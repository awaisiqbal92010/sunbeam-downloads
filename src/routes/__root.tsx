import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ background: "#FFFBF7" }}>
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ backgroundImage: "linear-gradient(135deg,#FF3B30,#FF7A00,#FFC700)" }} />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40" style={{ backgroundImage: "linear-gradient(135deg,#FFC700,#FF7A00,#FF3B30)" }} />
      <div className="relative max-w-md text-center">
        <p className="text-[9rem] md:text-[12rem] font-extrabold leading-none tracking-tighter" style={{ backgroundImage: "linear-gradient(135deg,#FF3B30,#FF7A00,#FFC700)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>404</p>
        <h2 className="mt-2 text-2xl font-extrabold">This reel doesn't exist.</h2>
        <p className="mt-2 text-sm font-medium text-black/60">The link you followed may be broken, or the page may have been moved.</p>
        <div className="mt-8">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-[0_10px_30px_-8px_rgba(255,122,0,0.45)]" style={{ backgroundImage: "linear-gradient(135deg,#FF3B30,#FF7A00,#FFC700)" }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Reelio — Download videos from any social platform" },
      { name: "description", content: "Reelio lets you paste any social video link and download it fast in the format and quality you want. YouTube, Instagram, TikTok, X, Facebook, Vimeo, Pinterest." },
      { property: "og:title", content: "Reelio — Download videos from any social platform" },
      { property: "og:description", content: "Paste a link. Get the video. Any platform, any format, no watermark." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
