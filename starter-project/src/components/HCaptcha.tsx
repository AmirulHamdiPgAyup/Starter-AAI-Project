"use client";

import { useEffect, useRef, useState } from "react";

// hCaptcha widget (design §12c). Rendered explicitly so the script loads
// once per page no matter how many forms are on it. hCaptcha injects a
// hidden `h-captcha-response` textarea INSIDE the host div below — which
// sits inside the <form>, so the token travels with the submission and the
// server can verify it (src/lib/captcha.ts).
//
// Tokens are single-use, so the parent bumps `resetKey` after every server
// error; that wipes the old widget and renders a fresh one for the retry.

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, options: { sitekey: string }) => string;
      reset: (widgetId?: string) => void;
    };
    __hcaptchaOnLoad?: () => void;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.hcaptcha) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      window.__hcaptchaOnLoad = () => resolve();
      const script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=__hcaptchaOnLoad";
      script.async = true;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("hCaptcha script failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function HCaptcha({
  sitekey,
  resetKey = 0,
}: {
  sitekey: string;
  resetKey?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!sitekey) {
      // Rendered below as a message; no state to set.
      return;
    }
    loadScript()
      .then(() => {
        if (cancelled || !window.hcaptcha || !hostRef.current) return;
        if (widgetIdRef.current) {
          try {
            window.hcaptcha.reset(widgetIdRef.current);
          } catch {
            // old widget already gone — the wipe below is enough
          }
          widgetIdRef.current = null;
        }
        hostRef.current.innerHTML = ""; // drop the consumed token + iframe
        widgetIdRef.current = window.hcaptcha.render(hostRef.current, { sitekey });
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sitekey, resetKey]);

  if (!sitekey || failed) {
    return (
      <p className="text-sm text-red-600" role="alert">
        The CAPTCHA service could not be loaded. Check the HCAPTCHA keys in
        .env and your internet connection, then reload this page.
      </p>
    );
  }

  return <div ref={hostRef} aria-label="CAPTCHA verification" />;
}
