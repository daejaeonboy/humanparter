import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, PencilLine, Save, X } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import { COMPANY_SECTION_TABS } from '../../src/config/publicMegaMenu';
import {
  COMPANY_BODY_SECTION_KEY_BY_TAB,
  type CompanyPageContent,
  type CompanySectionTabValue,
} from '../../src/data/companyPageContent';

interface CompanySectionsEditorProps {
  content: CompanyPageContent;
  onChange: (nextContent: CompanyPageContent) => void;
  onSave: () => Promise<void> | void;
  onCancel?: () => void;
  saving?: boolean;
  defaultSection?: CompanySectionTabValue;
  sectionValues?: CompanySectionTabValue[];
  title?: string;
  description?: string;
}

export const CompanySectionsEditor: React.FC<CompanySectionsEditorProps> = ({
  content,
  onChange,
  onSave,
  onCancel,
  saving = false,
  defaultSection = 'company-overview',
  sectionValues,
  title = '회사소개 수정',
  description = '공개 회사소개 페이지에서 바로 본문을 수정합니다. 텍스트와 이미지를 중심으로 편집해 주세요.',
}) => {
  const availableSections = (sectionValues && sectionValues.length > 0
    ? COMPANY_SECTION_TABS.filter((tab) => sectionValues.includes(tab.value as CompanySectionTabValue))
    : COMPANY_SECTION_TABS) as Array<(typeof COMPANY_SECTION_TABS)[number]>;
  const [activeSection, setActiveSection] = useState<CompanySectionTabValue>(defaultSection);

  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  const activeSectionLabel = useMemo(
    () => availableSections.find((tab) => tab.value === activeSection)?.label || '회사 개요',
    [activeSection, availableSections],
  );

  const activeBodyKey = COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection];

  const handleSectionHtmlChange = (html: string) => {
    onChange({
      ...content,
      bodySections: {
        ...content.bodySections,
        [activeBodyKey]: html,
      },
    });
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#001e45]/70">Inline Editor</p>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <PencilLine size={20} className="text-[#001e45]" />
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <X size={16} />
              취소
            </button>
          )}
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#001e45] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#153a82] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            저장하기
          </button>
        </div>
      </div>

      {availableSections.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {availableSections.map((tab) => {
          const isActive = activeSection === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveSection(tab.value as CompanySectionTabValue)}
              className={`rounded-[8px] border px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
          })}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">{activeSectionLabel} 본문</p>
        <RichTextEditor
          value={content.bodySections[activeBodyKey]}
          onChange={handleSectionHtmlChange}
          minHeight={480}
          uploadFolder="company"
          showLinkButton={false}
        />
      </div>
    </section>
  );
};
