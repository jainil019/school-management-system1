import type { ReactNode } from "react";

interface ModuleModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function ModuleModal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: ModuleModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
