import React, { useEffect, useMemo, useState } from 'react';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import {
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
  description,
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
      eyebrow="COMPANY EDITOR"
      title={title}
      description={description}
      submitLabel="정보 저장"
      saving={saving}
      onCancel={onCancel}
      onSubmit={() => void onSave()}
    >
      <div className="space-y-10">
        {showHeroFields && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">공통 상단 히어로</h3>
            <div className="grid gap-6">
              <label className="block space-y-2">
                <span className="text-[11px] font-bold text-slate-400">히어로 제목</span>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(event) => updateHeroField('title', event.target.value)}
                  className={inlineEditorInputClassName}
                  placeholder="상단 히어로 제목"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-bold text-slate-400">히어로 설명</span>
                <textarea
                  value={content.hero.description}
                  onChange={(event) => updateHeroField('description', event.target.value)}
                  className={inlineEditorTextareaClassName}
                  placeholder="상단 히어로 설명"
                />
              </label>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400">히어로 이미지</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={content.hero.imageUrl}
                    onChange={(event) => updateHeroField('imageUrl', event.target.value)}
                    className={inlineEditorInputClassName}
                    placeholder="상단 히어로 이미지 URL"
                  />
                  <button
                    type="button"
                    onClick={() => void handleUpload('company-hero-image', (imageUrl) => updateHeroField('imageUrl', imageUrl))}
                    className="inline-flex h-[46px] min-w-[100px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {uploadingField === 'company-hero-image' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    파일 선택
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showOverviewImageField && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">회사 개요 대표 이미지</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={content.overview.imageUrl}
                  onChange={(event) => updateOverviewImage(event.target.value)}
                  className={inlineEditorInputClassName}
                  placeholder="회사 개요 대표 이미지 URL"
                />
                <button
                  type="button"
                  onClick={() => void handleUpload('company-overview-image', updateOverviewImage)}
                  className="inline-flex h-[46px] min-w-[100px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {uploadingField === 'company-overview-image' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  파일 선택
                </button>
              </div>
            </div>
          </div>
        )}

        {showBodyEditor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">본문 내용 편집</h3>
              {availableSections.length > 1 && (
                <div className="flex gap-1">
                  {availableSections.map((tab) => {
                    const isActive = activeSection === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveSection(tab.value as CompanySectionTabValue)}
                        className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                          isActive
                            ? 'bg-[#42ab49] text-white'
                            : 'bg-white text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400">{activeSectionLabel} 본문</span>
              <RichTextEditor
                value={content.bodySections[activeBodyKey]}
                onChange={handleSectionHtmlChange}
                minHeight={480}
                uploadFolder="company"
                showLinkButton={false}
                variant="plain"
              />
            </div>
          </div>
        )}
      </div>
    </InlineEditorShell>
  );
};
