import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import {
  InlineEditorSection,
  InlineEditorShell,
  inlineEditorInputClassName,
  inlineEditorTextareaClassName,
} from '../editor/InlineEditorShell';
import { NOTICE_FILTER_TABS, getNoticeTabValue } from '../../src/config/publicMegaMenu';
import { type NoticeAuthoringInput } from '../../src/api/noticeApi';
import { uploadImage } from '../../src/api/storageApi';

interface NoticeInlineEditorProps {
  initialValue: NoticeAuthoringInput;
  title: string;
  description: string;
  submitLabel?: string;
  saving?: boolean;
  onSave: (value: NoticeAuthoringInput) => Promise<void> | void;
  onCancel: () => void;
}

const NOTICE_EDITOR_OPTIONS = NOTICE_FILTER_TABS.filter((item) => item.value !== 'all').map((item) => item.label);

const normalizeNoticeCategory = (value: string) =>
  getNoticeTabValue(value) === 'resources' ? '자료실' : '공지사항';

export const NoticeInlineEditor: React.FC<NoticeInlineEditorProps> = ({
  initialValue,
  title,
  description,
  submitLabel = '저장하기',
  saving = false,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NoticeAuthoringInput>(initialValue);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...initialValue,
      category: normalizeNoticeCategory(initialValue.category),
    });
  }, [initialValue]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'notices');
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Failed to upload notice image:', error);
      alert('대표 이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    await onSave({
      ...formData,
      title: formData.title.trim(),
      excerpt: formData.excerpt.trim(),
      imageUrl: formData.imageUrl.trim(),
      publishedAt: formData.publishedAt,
      category: formData.category.trim(),
      contentHtml: formData.contentHtml,
    });
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <InlineEditorShell
        eyebrow="NOTICE EDITOR"
        title={title}
        description={description}
        submitLabel={submitLabel}
        saving={saving}
        onCancel={onCancel}
        onSubmit={() => void handleSubmit()}
      >
        <InlineEditorSection title="기본 정보" description="게시글 기본 정보와 요약을 입력합니다.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              제목
              <input
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                className={`${inlineEditorInputClassName} mt-2`}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              카테고리
              <div className="mt-2 flex flex-wrap gap-2">
                {NOTICE_EDITOR_OPTIONS.map((option) => {
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
              게시일
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(event) => setFormData((prev) => ({ ...prev, publishedAt: event.target.value }))}
                className={`${inlineEditorInputClassName} mt-2`}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              요약
              <textarea
                value={formData.excerpt}
                onChange={(event) => setFormData((prev) => ({ ...prev, excerpt: event.target.value }))}
                className={`${inlineEditorTextareaClassName} mt-2`}
                required
              />
            </label>
          </div>
        </InlineEditorSection>

        <InlineEditorSection title="썸네일 이미지" description="리스트와 상세 상단에서 사용하는 대표 이미지를 관리합니다.">
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="정보센터 썸네일 미리보기" className="aspect-[4/3] h-full w-full object-cover" />
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
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  이미지 업로드
                </button>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                썸네일 이미지 URL
                <input
                  value={formData.imageUrl}
                  onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  className={`${inlineEditorInputClassName} mt-2`}
                  required
                />
              </label>
            </div>
          </div>
        </InlineEditorSection>

        <InlineEditorSection title="본문 내용" description="썸네일과 별개로, 본문 이미지는 아래 에디터 안에서 직접 삽입합니다.">
          <RichTextEditor
            value={formData.contentHtml}
            onChange={(value) => setFormData((prev) => ({ ...prev, contentHtml: value }))}
            uploadFolder="notices"
            minHeight={360}
            variant="plain"
          />
        </InlineEditorSection>
      </InlineEditorShell>
    </div>
  );
};
