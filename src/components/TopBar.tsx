import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "@/components/PixelIcons";
import type { ReactNode } from "react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      aria-label="Back"
      onClick={() =>
        window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" })
      }
      className={`icon-btn ${className}`}
    >
      <ChevronLeft className="size-[18px]" />
    </button>
  );
}

export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-6">
      <h1 className="text-2xl font-semibold uppercase tracking-wide">{title}</h1>
      {right}
    </header>
  );
}
