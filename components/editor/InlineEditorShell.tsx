import React from 'react';
import { Loader2, Save, X } from 'lucide-react';

interface InlineEditorShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  submitLabel?: string;
  saving?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  children: React.ReactNode;
}

interface InlineEditorSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const inlineEditorInputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/8';

export const inlineEditorTextareaClassName = `${inlineEditorInputClassName} min-h-[112px] resize-y leading-6`;

export const InlineEditorShell: React.FC<InlineEditorShellProps> = ({
  eyebrow = 'CONTENT EDITOR',
  title,
  description,
  submitLabel = '저장하기',
  saving = false,
  onCancel,
  onSubmit,
  children,
}) => {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#001e45]/65">{eyebrow}</p>
          <h2 className="text-[30px] font-bold tracking-[-0.03em] text-slate-900 md:text-[34px]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <X size={16} />
              취소
            </button>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#001e45] px-5 text-sm font-bold text-white transition-colors hover:bg-[#153a82] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {submitLabel}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
};

export const InlineEditorSection: React.FC<InlineEditorSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="space-y-4">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
};
