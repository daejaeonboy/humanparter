import React from 'react';
import { ChevronLeft, Loader2, Save, X } from 'lucide-react';

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
  eyebrow = '콘텐츠 에디터',
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
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {onCancel && (
        <button
          onClick={onCancel}
          className="group flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#001e45]"
        >
          <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          돌아가기
        </button>
      )}

      <header>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#001e45]">{eyebrow}</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-[15px] font-medium leading-7 text-slate-600">{description}</p>}
      </header>

      <div className="space-y-12">
        {children}
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 pt-8">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-red-200 px-6 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
            >
              삭제하기
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-8 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              취소
            </button>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#001e45] px-10 text-sm font-bold text-white shadow-md transition-all hover:bg-[#00142d] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {submitLabel}
            </button>
          )}
        </div>
      </footer>
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
