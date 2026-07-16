"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";
import { Command } from "lucide-react";

interface ShortcutGroup {
  label: string;
  shortcuts: { keys: string; description: string }[];
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const isMac = useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac"),
    () => false,
  );
  const mod = isMac ? "\u2318" : "Ctrl";
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const timer = setTimeout(() => {
      const closeBtn = dialogRef.current?.querySelector("button");
      closeBtn?.focus();
    }, 50);
    return () => {
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const groups: ShortcutGroup[] = [
    {
      label: "Navigation",
      shortcuts: [
        { keys: "g → p", description: "Go to Problem Set" },
        { keys: "g → d", description: "Go to Dashboard" },
        { keys: "g → s", description: "Go to Streaks" },
        { keys: "g → c", description: "Go to Daily Challenge" },
        { keys: "g → h", description: "Go to Home" },
      ],
    },
    {
      label: "Problem Set",
      shortcuts: [
        { keys: "/", description: "Focus search" },
        { keys: `${mod}+K`, description: "Focus search" },
        { keys: "i", description: "Toggle Important filter" },
        { keys: "d", description: "Cycle difficulty filter" },
        { keys: "r", description: "Reset all filters" },
      ],
    },
    {
      label: "General",
      shortcuts: [
        { keys: "?", description: "Toggle this help" },
        { keys: `${mod}+/`, description: "Toggle this help" },
        { keys: "t", description: "Toggle theme" },
        { keys: "Esc", description: "Close modals / dropdowns" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        ref={dialogRef}
        className="mx-4 w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 border border-border">
            <Command className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Keyboard Shortcuts</h2>
            <p className="text-sm text-muted-foreground">Press ? or {mod}+/ to open this panel</p>
          </div>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-mono text-muted-foreground shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors px-5 py-2.5 text-sm font-semibold text-foreground border-none outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
}
