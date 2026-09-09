// A tiny FIFO job queue with a hard concurrency limit, so several downloads
// never spawn an unbounded number of yt-dlp/ffmpeg processes.
import { EventEmitter } from "node:events";
import crypto from "node:crypto";

export class JobQueue extends EventEmitter {
  /**
   * @param {{ concurrency:number, maxQueued:number, timeoutMs?:number, name?:string }} opts
   */
  constructor({ concurrency, maxQueued, timeoutMs = 0, name = "queue" }) {
    super();
    this.concurrency = Math.max(1, concurrency);
    this.maxQueued = Math.max(0, maxQueued);
    this.timeoutMs = timeoutMs;
    this.name = name;
    this.pending = [];
    this.active = new Map();
  }

  get stats() {
    return {
      name: this.name,
      active: this.active.size,
      queued: this.pending.length,
      concurrency: this.concurrency,
      maxQueued: this.maxQueued,
    };
  }

  /** Position of a job id in the waiting line, 1-based (0 = running). */
  positionOf(id) {
    const i = this.pending.findIndex((j) => j.id === id);
    return i === -1 ? 0 : i + 1;
  }

  /**
   * @param {(ctx:{ id:string, signal:AbortSignal })=>Promise<any>} task
   * @returns {{ id:string, position:number, promise:Promise<any> }}
   */
  push(task, { label = "" } = {}) {
    if (this.pending.length >= this.maxQueued) {
      const err = new Error("Queue is full — try again in a moment.");
      err.code = "QUEUE_FULL";
      throw err;
    }
    const id = crypto.randomUUID();
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.pending.push({ id, task, label, resolve, reject });
    const position = this.pending.length;
    queueMicrotask(() => this.#drain());
    this.emit("change", this.stats);
    return { id, position, promise };
  }

  cancel(id) {
    const i = this.pending.findIndex((j) => j.id === id);
    if (i !== -1) {
      const [job] = this.pending.splice(i, 1);
      const err = new Error("Cancelled");
      err.code = "CANCELLED";
      job.reject(err);
      this.emit("change", this.stats);
      return true;
    }
    const running = this.active.get(id);
    if (running) {
      running.controller.abort();
      return true;
    }
    return false;
  }

  #drain() {
    while (this.active.size < this.concurrency && this.pending.length > 0) {
      const job = this.pending.shift();
      const controller = new AbortController();
      const entry = { controller, label: job.label, startedAt: Date.now() };
      this.active.set(job.id, entry);
      this.emit("change", this.stats);

      const timer = this.timeoutMs
        ? setTimeout(() => controller.abort(new Error("Job timed out")), this.timeoutMs)
        : null;

      Promise.resolve()
        .then(() => job.task({ id: job.id, signal: controller.signal }))
        .then(job.resolve, job.reject)
        .finally(() => {
          if (timer) clearTimeout(timer);
          this.active.delete(job.id);
          this.emit("change", this.stats);
          this.#drain();
        });
    }
  }
}
