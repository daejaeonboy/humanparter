import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import {
  InlineEditorSection,
  InlineEditorShell,
  inlineEditorInputClassName,
  inlineEditorTextareaClassName,
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
  description: string;
  submitLabel?: string;
  saving?: boolean;
  onSave: (value: InstallationCaseAuthoringInput) => Promise<void> | void;
  onCancel: () => void;
}

const getUploadErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '알 수 없는 오류';
  const anyError = error as Record<string, string>;
  return anyError.message || anyError.error_description || anyError.details || '알 수 없는 오류';
};

const INSTALLATION_CASE_EDITOR_OPTIONS = INSTALLATION_CASE_FILTER_TABS.filter((item) => item.value !== 'all').map(
  (item) => item.label,
);

const normalizeInstallationCaseCategory = (value: string) =>
  INSTALLATION_CASE_EDITOR_OPTIONS.includes(value) ? value : '임시사무실';

export const InstallationCaseInlineEditor: React.FC<InstallationCaseInlineEditorProps> = ({
  initialValue,
  title,
  description,
  submitLabel = '저장하기',
  saving = false,
  onSave,
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

  const uploadCaseImage = async (file: File) => {
    try {
      return await uploadImage(file, 'installation-cases');
    } catch (folderError) {
      console.warn('Upload to installation-cases failed, retrying with default folder:', folderError);
      return uploadImage(file);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    setUploadingCover(true);
    try {
      const imageUrl = await uploadCaseImage(file);
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      alert(`썸네일 이미지 업로드에 실패했습니다.\n사유: ${getUploadErrorMessage(error)}`);
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
    <div>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />

      <InlineEditorShell
        eyebrow="CASE EDITOR"
        title={title}
        description={description}
        submitLabel={submitLabel}
        saving={saving}
        onCancel={onCancel}
        onSubmit={() => void handleSubmit()}
      >
        <InlineEditorSection title="기본 정보" description="설치사례 제목과 요약 문구를 입력합니다.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              제목
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                className={`${inlineEditorInputClassName} mt-2`}
                placeholder="설치사례 제목을 입력해 주세요"
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              카테고리
              <div className="mt-2 flex flex-wrap gap-2">
                {INSTALLATION_CASE_EDITOR_OPTIONS.map((option) => {
                  const isActive = formData.category === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: option }))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'border-[#001e45] bg-[#001e45] text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              작성일
              <input
                type="date"
                value={formData.created_at}
                onChange={(event) => setFormData((prev) => ({ ...prev, created_at: event.target.value }))}
                className={`${inlineEditorInputClassName} mt-2`}
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              부제목
              <input
                type="text"
                value={formData.subtitle}
                onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
                className={`${inlineEditorInputClassName} mt-2`}
                placeholder="요약 설명이 있으면 입력해 주세요"
              />
            </label>
          </div>
        </InlineEditorSection>

        <InlineEditorSection title="썸네일 이미지" description="리스트 카드와 상세 상단 대표 영역에서 사용하는 이미지를 관리합니다.">
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="설치사례 썸네일 미리보기"
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
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  이미지 업로드
                </button>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                썸네일 이미지 URL
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(event) => setFormData((prev) => ({ ...prev, image_url: event.target.value }))}
                  className={`${inlineEditorInputClassName} mt-2`}
                  placeholder="썸네일 이미지 URL"
                  required
                />
              </label>
            </div>
          </div>
        </InlineEditorSection>

        <InlineEditorSection title="본문 내용" description="본문 이미지는 아래 에디터 안에서 직접 업로드하거나 삽입해 작성합니다.">
          <RichTextEditor
            value={formData.contentHtml}
            onChange={(value) => setFormData((prev) => ({ ...prev, contentHtml: value }))}
            uploadFolder="installation-cases"
            minHeight={420}
            variant="plain"
          />
        </InlineEditorSection>
      </InlineEditorShell>
    </div>
  );
};
