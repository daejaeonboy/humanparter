import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { RichTextEditor } from '../admin/RichTextEditor';
import {
  InlineEditorSection,
  InlineEditorShell,
  inlineEditorInputClassName,
  inlineEditorTextareaClassName,
} from '../editor/InlineEditorShell';
import { NOTICE_FILTER_TABS, getNoticeTabValue } from '../../src/config/publicMegaMenu';
import { type NoticeAuthoringInput, type NoticeAttachment } from '../../src/api/noticeApi';
import { uploadImage, uploadFile } from '../../src/api/storageApi';

interface NoticeInlineEditorProps {
  initialValue: NoticeAuthoringInput;
  title: string;
  description?: string;
  submitLabel?: string;
  saving?: boolean;
  onSave: (value: NoticeAuthoringInput) => Promise<void> | void;
  onDelete?: () => void;
  onCancel: () => void;
}

const NOTICE_EDITOR_OPTIONS = NOTICE_FILTER_TABS.filter((item) => item.value !== 'all').map((item) => item.label);

const normalizeNoticeCategory = (value: string) =>
  getNoticeTabValue(value) === 'resources' ? '자료실' : '공지사항';

export const NoticeInlineEditor: React.FC<NoticeInlineEditorProps> = ({
  initialValue,
  title,
  description,
  submitLabel = '소식 저장',
  saving = false,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NoticeAuthoringInput>(initialValue);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAttachmentIndex, setUploadingAttachmentIndex] = useState<number | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...initialValue,
      category: normalizeNoticeCategory(initialValue.category),
      attachments: initialValue.attachments || [],
    });
  }, [initialValue]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const imageUrl = await uploadImage(file, 'notices');
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Failed to upload notice image:', error);
      alert('대표 이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  };

  const addAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), { name: '', url: '' }],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  const updateAttachment = (index: number, field: keyof NoticeAttachment, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAttachmentUpload = async (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingAttachmentIndex(index);
      try {
        const url = await uploadFile(file, 'attachments');
        updateAttachment(index, 'url', url);
        if (!formData.attachments?.[index].name) {
          updateAttachment(index, 'name', file.name);
        }
      } catch (error) {
        console.error('Failed to upload attachment:', error);
        alert('파일 업로드에 실패했습니다.');
      } finally {
        setUploadingAttachmentIndex(null);
      }
    };
    input.click();
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
      attachments: (formData.attachments || []).filter((a) => a.name.trim() && a.url.trim()),
    });
  };

  return (
    <InlineEditorShell
      eyebrow="정보센터 에디터"
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
            <span className="text-xs font-extrabold text-slate-700">제목</span>
            <input
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="제목을 입력해 주세요"
              className={inlineEditorInputClassName}
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-extrabold text-slate-700">카테고리</span>
            <select
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
              className={inlineEditorInputClassName}
            >
              {NOTICE_EDITOR_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-extrabold text-slate-700">게시일</span>
          <div className="relative max-w-[240px]">
            <input
              type="date"
              value={formData.publishedAt}
              onChange={(event) => setFormData((prev) => ({ ...prev, publishedAt: event.target.value }))}
              className={inlineEditorInputClassName}
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-extrabold text-slate-700">요약 (목록에 노출)</span>
          <textarea
            value={formData.excerpt}
            onChange={(event) => setFormData((prev) => ({ ...prev, excerpt: event.target.value }))}
            placeholder="목록에 노출될 간단한 요약 문구를 입력해 주세요"
            className={inlineEditorTextareaClassName}
            required
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-slate-700">본문 대표 이미지</span>
          <div className="flex gap-2">
            <input
              value={formData.imageUrl}
              onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="이미지 URL을 직접 입력하거나 파일을 선택하세요."
              className={inlineEditorInputClassName}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex h-[46px] min-w-[120px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-extrabold text-slate-800 transition-colors hover:bg-slate-50"
            >
              {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              파일 선택
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-slate-700">본문 내용</span>
          <RichTextEditor
            value={formData.contentHtml}
            onChange={(value) => setFormData((prev) => ({ ...prev, contentHtml: value }))}
            uploadFolder="notices"
            minHeight={400}
            variant="plain"
          />
          <p className="text-[11px] font-medium text-slate-500">
            '타이틀', '본문' 프리셋으로 빠르게 서식을 맞추고, 필요시 글자 크기, 색상, 행간을 조절하세요.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">첨부파일</span>
            <button
              type="button"
              onClick={addAttachment}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-extrabold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Plus size={12} />
              파일 추가하기
            </button>
          </div>

          <div className="space-y-3">
            {formData.attachments?.map((file, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500">파일명</span>
                  <input
                    value={file.name}
                    onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                    placeholder="예: 서비스 안내서.pdf"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#001e45]"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500">파일 경로 (URL)</span>
                  <div className="flex gap-2">
                    <input
                      value={file.url}
                      onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                      placeholder="파일을 업로드하거나 직접 URL을 입력하세요"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#001e45]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAttachmentUpload(index)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
                    >
                      {uploadingAttachmentIndex === index ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                    </button>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              </div>
            ))}
            {(!formData.attachments || formData.attachments.length === 0) && (
              <p className="py-6 text-center text-[11px] font-medium text-slate-400">등록된 첨부파일이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </InlineEditorShell>
  );
};
