"use client";

import { useRouter } from "next/navigation";
import { SuccessModal } from "../ui/SuccessModal";

// Page-level success pop-up (design §11): a queue action redirects back to
// the page with a flag, and the page — not the table row, which disappears —
// shows the message. Pressing Done clears the flag from the address bar.
export function PageSuccessModal({
  open,
  title,
  message,
  dismissHref,
}: {
  open: boolean;
  title: string;
  message?: string;
  dismissHref: string;
}) {
  const router = useRouter();
  return (
    <SuccessModal
      open={open}
      title={title}
      message={message}
      onAction={() => router.replace(dismissHref)}
    />
  );
}
