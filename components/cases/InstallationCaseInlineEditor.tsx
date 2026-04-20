import React, { useEffect, useMemo, useState } from 'react';
import { RichTextEditor } from '../admin/RichTextEditor';
import { InlineEditorShell, inlineEditorInputClassName } from '../editor/InlineEditorShell';
import { INSTALLATION_CASE_FILTER_TABS } from '../../src/config/publicMegaMenu';

export interface InstallationCaseAuthoringInput {
  title: string;
  category: string;
  subtitle: string;
  created_at: string;
  image_url: string;
  contentHtml: string;
}

interface InstallationCaseInlineEditorProps {
  initialValue: InstallationCaseAuthoringInput;
  title: string;
  description?: string;
  submitLabel?: string;
  saving?: boolean;
  categoryOptions?: string[];
  onSave: (value: InstallationCaseAuthoringInput) => Promise<void> | void;
  onDelete?: () => void;
  onCancel: () => void;
}

const DEFAULT_CATEGORY_OPTIONS = INSTALLATION_CASE_FILTER_TABS.filter((item) => item.value !== 'all').map(
  (item) => item.label,
);

const normalizeCategoryOptions = (options: string[], currentValue: string) =>
  Array.from(new Set([...options, currentValue].map((item) => item.trim()).filter(Boolean)));

const extractImageUrlsFromHtml = (html: string) => {
  if (!html || typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  return Array.from(document.querySelectorAll('img'))
    .map((image) => image.getAttribute('src')?.trim() || '')
    .filter(Boolean)
    .filter((url, index, array) => array.indexOf(url) === index);
};

export const InstallationCaseInlineEditor: React.FC<InstallationCaseInlineEditorProps> = ({
  initialValue,
  title,
  description,
  submitLabel = '저장',
  saving = false,
  categoryOptions = DEFAULT_CATEGORY_OPTIONS,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [formData, setFormData] = useState<InstallationCaseAuthoringInput>(initialValue);
  const availableCategoryOptions = normalizeCategoryOptions(categoryOptions, formData.category);
  const contentImageOptions = useMemo(() => extractImageUrlsFromHtml(formData.contentHtml), [formData.contentHtml]);

  useEffect(() => {
    setFormData(initialValue);
  }, [initialValue]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.image_url.trim() || !formData.created_at.trim()) {
      alert('제목, 작성일, 대표 이미지를 입력해 주세요.');
      return;
    }

    await onSave({
      ...formData,
      title: formData.title.trim(),
      category: formData.category.trim(),
      subtitle: formData.subtitle.trim(),
      created_at: formData.created_at.trim(),
      image_url: formData.image_url.trim(),
      contentHtml: formData.contentHtml,
    });
  };

  return (
    <InlineEditorShell
      eyebrow="CASE EDITOR"
      title={title}
      description={description}
      submitLabel={submitLabel}
      saving={saving}
      onCancel={onCancel}
      onSubmit={() => void handleSubmit()}
      onDelete={onDelete}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[11px] font-bold text-slate-400">제목</span>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              className={inlineEditorInputClassName}
              placeholder="설치사례 제목을 입력해 주세요"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-bold text-slate-400">카테고리</span>
            <select
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
              className={inlineEditorInputClassName}
            >
              <option value="" disabled>
                카테고리 선택
              </option>
              {availableCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-[11px] font-bold text-slate-400">작성일</span>
          <div className="relative max-w-[240px]">
            <input
              type="date"
              value={formData.created_at}
              onChange={(event) => setFormData((prev) => ({ ...prev, created_at: event.target.value }))}
              className={inlineEditorInputClassName}
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-bold text-slate-400">부제목</span>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
            className={inlineEditorInputClassName}
            placeholder="요약 설명이 있으면 입력해 주세요"
          />
        </label>

        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400">대표 이미지</span>

          <p className="text-sm font-medium leading-6 text-slate-500">
            대표 이미지는 본문 에디터 안 실제 이미지 위에서만 선택할 수 있고, 선택된 이미지는 체크 표시로 구분됩니다.
          </p>

          {formData.image_url && !contentImageOptions.includes(formData.image_url) && (
            <p className="text-sm font-medium leading-6 text-amber-600">
              현재 대표 이미지는 본문 이미지 목록에 없습니다. 본문 이미지 위 버튼으로 다시 선택해 주세요.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400">본문 내용</span>
          <p className="text-sm font-medium leading-6 text-slate-500">
            폴더에서 이미지를 본문 에디터 안으로 바로 끌어다 놓아도 업로드됩니다.
          </p>
          <RichTextEditor
            value={formData.contentHtml}
            onChange={(value) => setFormData((prev) => ({ ...prev, contentHtml: value }))}
            uploadFolder="installation-cases"
            minHeight={420}
            variant="plain"
            enableImageSelection
            selectedImageUrl={formData.image_url}
            imageSelectionLabel="대표 이미지로 선택"
            onSelectImage={(imageUrl) => setFormData((prev) => ({ ...prev, image_url: imageUrl }))}
          />
        </div>
      </div>
    </InlineEditorShell>
  );
};
