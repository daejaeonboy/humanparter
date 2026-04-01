import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import {
  InlineEditorShell,
  inlineEditorInputClassName,
} from '../editor/InlineEditorShell';
import { INSTALLATION_CASE_FILTER_TABS } from '../../src/config/publicMegaMenu';
import { uploadImage } from '../../src/api/storageApi';

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
  onSave: (value: InstallationCaseAuthoringInput) => Promise<void> | void;
  onDelete?: () => void;
  onCancel: () => void;
}

const INSTALLATION_CASE_EDITOR_OPTIONS = INSTALLATION_CASE_FILTER_TABS.filter((item) => item.value !== 'all').map(
  (item) => item.label,
);

const normalizeInstallationCaseCategory = (value: string) =>
  INSTALLATION_CASE_EDITOR_OPTIONS.includes(value) ? value : '임시사무실';

export const InstallationCaseInlineEditor: React.FC<InstallationCaseInlineEditorProps> = ({
  initialValue,
  title,
  description,
  submitLabel = '사례 저장',
  saving = false,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [formData, setFormData] = useState<InstallationCaseAuthoringInput>(initialValue);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...initialValue,
      category: normalizeInstallationCaseCategory(initialValue.category),
    });
  }, [initialValue]);

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const imageUrl = await uploadImage(file, 'installation-cases');
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      alert('썸네일 이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.image_url.trim() || !formData.created_at.trim()) {
      alert('제목, 날짜, 썸네일 이미지를 입력해 주세요.');
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
              {INSTALLATION_CASE_EDITOR_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
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
          <span className="text-[11px] font-bold text-slate-400">부제목 (요약 설명)</span>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
            className={inlineEditorInputClassName}
            placeholder="요약 설명이 있으면 입력해 주세요"
          />
        </label>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400">썸네일 이미지</span>
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.image_url}
              onChange={(event) => setFormData((prev) => ({ ...prev, image_url: event.target.value }))}
              className={inlineEditorInputClassName}
              placeholder="썸네일 이미지 URL"
              required
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="inline-flex h-[46px] min-w-[100px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              파일 선택
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400">본문 내용</span>
          <RichTextEditor
            value={formData.contentHtml}
            onChange={(value) => setFormData((prev) => ({ ...prev, contentHtml: value }))}
            uploadFolder="installation-cases"
            minHeight={420}
            variant="plain"
          />
        </div>
      </div>
    </InlineEditorShell>
  );
};
