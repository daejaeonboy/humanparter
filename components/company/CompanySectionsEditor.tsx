import React, { useEffect, useMemo, useState } from 'react';
import { ImageIcon, Loader2, PencilLine, Save, Upload, X } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import { COMPANY_SECTION_TABS } from '../../src/config/publicMegaMenu';
import { uploadImage } from '../../src/api/storageApi';
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
  showHeroFields?: boolean;
  showOverviewImageField?: boolean;
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
  showHeroFields = true,
  showOverviewImageField = true,
}) => {
  const availableSections = (sectionValues && sectionValues.length > 0
    ? COMPANY_SECTION_TABS.filter((tab) => sectionValues.includes(tab.value as CompanySectionTabValue))
    : COMPANY_SECTION_TABS) as Array<(typeof COMPANY_SECTION_TABS)[number]>;
  const [activeSection, setActiveSection] = useState<CompanySectionTabValue>(defaultSection);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

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

  const updateHeroField = (field: 'title' | 'description' | 'imageUrl', value: string) => {
    onChange({
      ...content,
      hero: {
        ...content.hero,
        [field]: value,
      },
    });
  };

  const updateOverviewImage = (value: string) => {
    onChange({
      ...content,
      overview: {
        ...content.overview,
        imageUrl: value,
      },
    });
  };

  const handleUpload = async (
    uploadKey: string,
    onComplete: (imageUrl: string) => void,
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingField(uploadKey);
      try {
        const imageUrl = await uploadImage(file, 'company');
        onComplete(imageUrl);
      } catch (error) {
        console.error(error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setUploadingField(null);
      }
    };
    input.click();
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#001e45]';
  const textareaClassName = `${inputClassName} min-h-[112px] resize-y leading-6`;

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

      {showHeroFields && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">공통 상단 히어로</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              회사소개 전 페이지 상단 공통 제목, 설명, 이미지를 수정합니다.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {content.hero.imageUrl ? (
                <img src={content.hero.imageUrl} alt={content.hero.title} className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 items-center justify-center text-slate-300">
                  <ImageIcon size={36} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleUpload('company-hero-image', (imageUrl) => updateHeroField('imageUrl', imageUrl))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {uploadingField === 'company-hero-image' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  이미지 업로드
                </button>
              </div>

              <input
                type="text"
                value={content.hero.title}
                onChange={(event) => updateHeroField('title', event.target.value)}
                className={inputClassName}
                placeholder="상단 히어로 제목"
              />
              <textarea
                value={content.hero.description}
                onChange={(event) => updateHeroField('description', event.target.value)}
                className={textareaClassName}
                placeholder="상단 히어로 설명"
              />
              <input
                type="url"
                value={content.hero.imageUrl}
                onChange={(event) => updateHeroField('imageUrl', event.target.value)}
                className={inputClassName}
                placeholder="상단 히어로 이미지 URL"
              />
            </div>
          </div>
        </div>
      )}

      {showOverviewImageField && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">회사 개요 대표 이미지</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              회사소개 개요 본문과 메인 페이지 회사소개 섹션에서 함께 사용하는 이미지를 수정합니다.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {content.overview.imageUrl ? (
                <img src={content.overview.imageUrl} alt={content.overview.title} className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 items-center justify-center text-slate-300">
                  <ImageIcon size={36} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleUpload('company-overview-image', updateOverviewImage)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {uploadingField === 'company-overview-image' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  이미지 업로드
                </button>
              </div>

              <input
                type="url"
                value={content.overview.imageUrl}
                onChange={(event) => updateOverviewImage(event.target.value)}
                className={inputClassName}
                placeholder="회사 개요 대표 이미지 URL"
              />
            </div>
          </div>
        </div>
      )}

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
