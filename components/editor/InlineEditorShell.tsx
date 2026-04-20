import React from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';

interface InlineEditorShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  submitLabel?: string;
  saving?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

interface InlineEditorSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const inlineEditorInputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10 placeholder:text-slate-400';

export const inlineEditorTextareaClassName = `${inlineEditorInputClassName} min-h-[160px] resize-y leading-7`;

export const InlineEditorShell: React.FC<InlineEditorShellProps> = ({
  eyebrow = 'CONTENT EDITOR',
  title,
  description,
  submitLabel = '저장하기',
  saving = false,
  onCancel,
  onSubmit,
  onDelete,
  children,
}) => {
  return (
    <div className="mx-auto max-w-5xl pb-20">
      {onCancel && (
        <button
          onClick={onCancel}
          className="group mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#001e45]"
        >
          <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          돌아가기
        </button>
      )}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <header className="border-b border-slate-200 bg-white px-6 py-6 md:px-8 md:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#001e45]">{eyebrow}</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
              {description && <p className="mt-4 text-[15px] font-medium leading-7 text-slate-600">{description}</p>}
            </div>

            {(onCancel || onSubmit) && (
              <div className="flex shrink-0 items-center gap-3 self-start lg:pt-1">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    취소
                  </button>
                )}
                {onSubmit && (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={saving}
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#001e45] px-8 text-sm font-bold text-white shadow-md transition-all hover:bg-[#00142d] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {submitLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
          <div className="space-y-12">
            {children}
          </div>
        </div>

        {onDelete && (
          <footer className="sticky bottom-0 flex items-center justify-start border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:px-8">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-red-200 px-6 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
            >
              삭제하기
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export const InlineEditorSection: React.FC<InlineEditorSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="space-y-4">
      <div className="mb-2">
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
};
