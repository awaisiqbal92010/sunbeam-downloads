import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Reelio" },
      { name: "description", content: "Create your free Reelio account." },
      { property: "og:title", content: "Sign up for Reelio" },
      { property: "og:description", content: "Free forever plan. No credit card required." },
    ],
  }),
  component: () => <AuthShell mode="signup" />,
});
