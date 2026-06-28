"use client";

import { useEffect, useId, useRef } from "react";

type ConfirmDeleteModalProps = {
  open: boolean;
  itemLabel: string;
  sectionLabel: string;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  open,
  itemLabel,
  sectionLabel,
  isBusy,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isBusy, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        disabled={isBusy}
        onClick={onCancel}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm transition disabled:cursor-not-allowed"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c1528] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="border-b border-rose-400/15 bg-linear-to-r from-rose-400/10 via-transparent to-transparent px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-400/10 text-rose-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-white">
                Remove item?
              </h2>
              <p id={descriptionId} className="mt-1.5 text-sm leading-6 text-white/65">
                You are about to remove{" "}
                <span className="font-medium text-white">&ldquo;{itemLabel}&rdquo;</span> from{" "}
                {sectionLabel.toLowerCase()}. This change applies platform-wide and cannot be undone from here.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className="rounded-xl border border-rose-400/30 bg-rose-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Removing..." : "Yes, remove item"}
          </button>
        </div>
      </div>
    </div>
  );
}
