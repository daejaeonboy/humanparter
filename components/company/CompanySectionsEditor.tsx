import React, { useEffect, useMemo, useState } from 'react';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import {
  InlineEditorSection,
  InlineEditorShell,
  inlineEditorInputClassName,
  inlineEditorTextareaClassName,
} from '../editor/InlineEditorShell';
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
  showBodyEditor?: boolean;
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
  showBodyEditor = true,
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

  const handleUpload = async (uploadKey: string, onComplete: (imageUrl: string) => void) => {
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

  return (
    <InlineEditorShell
      eyebrow="INLINE EDITOR"
      title={title}
      description={description}
      submitLabel="저장하기"
      saving={saving}
      onCancel={onCancel}
      onSubmit={() => void onSave()}
    >
      {showHeroFields && (
        <InlineEditorSection
          title="공통 상단 히어로"
          description="회사소개 전 페이지 상단 공통 제목, 설명, 이미지를 수정합니다."
        >
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {content.hero.imageUrl ? (
                <img src={content.hero.imageUrl} alt={content.hero.title} className="aspect-[4/3] h-full w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-slate-400">
                  <ImageIcon size={28} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleUpload('company-hero-image', (imageUrl) => updateHeroField('imageUrl', imageUrl))}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {uploadingField === 'company-hero-image' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  이미지 업로드
                </button>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                제목
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(event) => updateHeroField('title', event.target.value)}
                  className={`${inlineEditorInputClassName} mt-2`}
                  placeholder="상단 히어로 제목"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                설명
                <textarea
                  value={content.hero.description}
                  onChange={(event) => updateHeroField('description', event.target.value)}
                  className={`${inlineEditorTextareaClassName} mt-2`}
                  placeholder="상단 히어로 설명"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                이미지 URL
                <input
                  type="url"
                  value={content.hero.imageUrl}
                  onChange={(event) => updateHeroField('imageUrl', event.target.value)}
                  className={`${inlineEditorInputClassName} mt-2`}
                  placeholder="상단 히어로 이미지 URL"
                />
              </label>
            </div>
          </div>
        </InlineEditorSection>
      )}

      {showOverviewImageField && (
        <InlineEditorSection
          title="회사 개요 대표 이미지"
          description="회사소개 개요 본문과 메인 페이지 회사소개 섹션에서 함께 사용하는 이미지를 수정합니다."
        >
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {content.overview.imageUrl ? (
                <img
                  src={content.overview.imageUrl}
                  alt={content.overview.title}
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-slate-400">
                  <ImageIcon size={28} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleUpload('company-overview-image', updateOverviewImage)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {uploadingField === 'company-overview-image' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  이미지 업로드
                </button>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                이미지 URL
                <input
                  type="url"
                  value={content.overview.imageUrl}
                  onChange={(event) => updateOverviewImage(event.target.value)}
                  className={`${inlineEditorInputClassName} mt-2`}
                  placeholder="회사 개요 대표 이미지 URL"
                />
              </label>
            </div>
          </div>
        </InlineEditorSection>
      )}

      {showBodyEditor && (
        <InlineEditorSection
          title={`${activeSectionLabel} 본문`}
          description="현재 페이지에 노출되는 본문 내용을 직접 수정합니다."
        >
          {availableSections.length > 1 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {availableSections.map((tab) => {
                const isActive = activeSection === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveSection(tab.value as CompanySectionTabValue)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-[#001e45] bg-[#001e45] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <RichTextEditor
            value={content.bodySections[activeBodyKey]}
            onChange={handleSectionHtmlChange}
            minHeight={480}
            uploadFolder="company"
            showLinkButton={false}
            variant="plain"
          />
        </InlineEditorSection>
      )}
    </InlineEditorShell>
  );
};
