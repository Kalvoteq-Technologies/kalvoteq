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
    if (!window.localStorage.getItem("cookie-consent")) setVisible(true);
  }, []);

  const decide = (value: "accepted" | "essential") => {
    window.localStorage.setItem("cookie-consent", value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-card p-5 shadow-xl sm:flex sm:items-center sm:gap-6"
    >
      <p className="text-sm text-muted-foreground">
        We use essential cookies to run this site and optional analytics cookies to improve it. Read
        our{" "}
        <Link to="/cookies" className="font-medium text-primary underline-offset-4 hover:underline">
          cookie policy
        </Link>
        .
      </p>
      <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
        <Button variant="outline" size="sm" onClick={() => decide("essential")}>
          Essential only
        </Button>
        <Button size="sm" onClick={() => decide("accepted")}>
          Accept all
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Dismiss cookie banner"
          onClick={() => decide("essential")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
