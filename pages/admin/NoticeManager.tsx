import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Eye, EyeOff, FileText, ImageIcon, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import {
  addNoticePost,
  FALLBACK_NOTICE_POSTS,
  getAdminNoticePostCollection,
  NoticePost,
  resetNoticePostTableStatus,
  updateNoticePost,
  deleteNoticePost,
} from '../../src/api/noticeApi';
import { invalidatePublicDataCache } from '../../src/api/publicDataApi';
import { uploadImage } from '../../src/api/storageApi';

type NoticeFormState = Omit<NoticePost, 'id' | 'created_at' | 'updated_at'>;

const createEmptyForm = (nextOrder: number): NoticeFormState => ({
  title: '',
  excerpt: '',
  imageUrl: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  category: '운영안내',
  contentHtml: '<p></p>',
  displayOrder: nextOrder,
  isActive: true,
});

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#001e45]';

const textareaClassName = `${inputClassName} min-h-[110px] resize-y`;

export const NoticeManager: React.FC = () => {
  const [items, setItems] = useState<NoticePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NoticePost | null>(null);
  const [formData, setFormData] = useState<NoticeFormState>(createEmptyForm(1));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      if (forceRefresh) {
        resetNoticePostTableStatus();
      }

      const { items: data, usesFallback } = await getAdminNoticePostCollection({
        bypassMissingCache: forceRefresh,
      });
      setItems(data);
      setUsingFallback(usesFallback);
    } catch (error) {
      console.error('Failed to load notice posts:', error);
      setItems(FALLBACK_NOTICE_POSTS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(true);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(createEmptyForm(items.length + 1));
    setShowModal(true);
  };

  const openEditModal = (item: NoticePost) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      category: item.category,
      contentHtml: item.contentHtml,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setUploading(false);
  };

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingItem?.id) {
        if (usingFallback) {
          alert('먼저 Supabase에서 `sql/create_notice_posts_table.sql`을 실행해 실제 정보센터 테이블을 만든 뒤 수정해 주세요.');
          return;
        }
        await updateNoticePost(editingItem.id, formData);
      } else {
        await addNoticePost(formData);
      }

      invalidatePublicDataCache();
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save notice post:', error);
      alert('저장에 실패했습니다. Supabase에서 `sql/create_notice_posts_table.sql`을 먼저 실행해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NoticePost) => {
    if (usingFallback) {
      alert('먼저 Supabase에서 `sql/create_notice_posts_table.sql`을 실행해 실제 정보센터 테이블을 만든 뒤 삭제해 주세요.');
      return;
    }

    if (!confirm(`'${item.title}' 정보센터를 삭제하시겠습니까?`)) return;

    try {
      await deleteNoticePost(item.id);
      invalidatePublicDataCache();
      await loadData();
    } catch (error) {
      console.error('Failed to delete notice post:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: NoticePost) => {
    if (usingFallback) {
      alert('먼저 Supabase에서 `sql/create_notice_posts_table.sql`을 실행해 실제 정보센터 테이블을 만든 뒤 노출 상태를 변경해 주세요.');
      return;
    }

    try {
      await updateNoticePost(item.id, { isActive: !item.isActive });
      invalidatePublicDataCache();
      await loadData();
    } catch (error) {
      console.error('Failed to toggle notice visibility:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <FileText size={22} className="text-[#001e45]" />
            정보센터 관리
          </h1>
          <p className="mt-2 text-sm text-slate-500">정보센터 목록과 게시글 본문을 관리합니다.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#001e45] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#153a82]"
        >
          <Plus size={16} />
          정보센터 추가
        </button>
      </div>

      {usingFallback && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              현재는 예시 정보센터 데이터를 보고 있습니다. 실제 저장, 수정, 삭제를 사용하려면 Supabase에서
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 text-[13px] font-semibold">sql/create_notice_posts_table.sql</code>
              을 먼저 실행해 주세요.
            </div>
            <button
              type="button"
              onClick={() => void loadData(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              테이블 다시 확인
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className="rounded-lg bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur"
                  title={item.isActive ? '비활성화' : '활성화'}
                >
                  {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="rounded-lg bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur"
                  title="수정"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="rounded-lg bg-white/90 p-2 text-red-500 shadow-sm backdrop-blur"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {item.category}
                </span>
                <span className="text-xs font-medium text-slate-400">{item.publishedAt}</span>
              </div>
              <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">{item.title}</h2>
              <p className="line-clamp-2 text-sm leading-6 text-slate-500">{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingItem ? '정보센터 수정' : '정보센터 추가'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">공개 정보센터 페이지와 상세 본문에 반영됩니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <X size={16} />
                    닫기
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#001e45] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#153a82] disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    저장
                  </button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    제목
                    <input
                      value={formData.title}
                      onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                      className={`${inputClassName} mt-2`}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    카테고리
                    <input
                      value={formData.category}
                      onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                      className={`${inputClassName} mt-2`}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    게시일
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(event) => setFormData((prev) => ({ ...prev, publishedAt: event.target.value }))}
                      className={`${inputClassName} mt-2`}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    노출 순서
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, displayOrder: Number(event.target.value) || 0 }))
                      }
                      className={`${inputClassName} mt-2`}
                    />
                  </label>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  요약
                  <textarea
                    value={formData.excerpt}
                    onChange={(event) => setFormData((prev) => ({ ...prev, excerpt: event.target.value }))}
                    className={`${textareaClassName} mt-2`}
                  />
                </label>

                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">
                      대표 이미지 URL
                      <div className="mt-2 flex gap-2">
                        <input
                          value={formData.imageUrl}
                          onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))}
                          className={inputClassName}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          업로드
                        </button>
                      </div>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(event) => setFormData((prev) => ({ ...prev, isActive: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      공개 노출
                    </label>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="정보센터 대표 이미지 미리보기" className="aspect-[4/3] h-full w-full object-cover" />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center text-slate-400">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">본문</p>
                  <RichTextEditor
                    value={formData.contentHtml}
                    onChange={(value) => setFormData((prev) => ({ ...prev, contentHtml: value }))}
                    uploadFolder="notices"
                    minHeight={360}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
