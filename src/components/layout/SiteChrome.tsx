import { Link } from "@tanstack/react-router";
import { ArrowUp, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <Button
      size="icon"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full shadow-lg"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem("cookie-notice-seen")) setVisible(true);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem("cookie-notice-seen", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-card p-5 shadow-xl sm:flex sm:items-center sm:gap-6"
    >
      <p className="text-sm text-muted-foreground">
        We only use essential cookies to run this site — no analytics or tracking. Read our{" "}
        <Link to="/cookies" className="font-medium text-primary underline-offset-4 hover:underline">
          cookie policy
        </Link>
        .
      </p>
      <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
        <Button size="sm" onClick={dismiss}>
          Got it
        </Button>
        <Button variant="ghost" size="icon" aria-label="Dismiss cookie notice" onClick={dismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
