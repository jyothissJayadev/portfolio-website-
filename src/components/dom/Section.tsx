import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function Section({
  id,
  title,
  children,
}: {
  id: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex min-h-screen items-center px-6 py-24 md:px-16">
      <Reveal>
        <div className="max-w-2xl">
          {title && (
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
              {title}
            </h2>
          )}
          {children}
        </div>
      </Reveal>
    </section>
  );
}
