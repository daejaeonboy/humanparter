import { supabase } from '../lib/supabase';
import { noticePosts as fallbackNoticePosts, type NoticePost as LegacyNoticePost } from '../data/noticePosts';
import { stripHtmlTags } from '../utils/html';

const TABLE_NAME = 'notice_posts';

export interface NoticePost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  contentHtml: string;
  displayOrder: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PublicNoticePost = NoticePost;

export interface AdminNoticePostCollection {
  items: NoticePost[];
  usesFallback: boolean;
}

type NoticeRecord = {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  category: string;
  content_html: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type NoticeFormInput = Omit<NoticePost, 'id' | 'created_at' | 'updated_at'>;
type NoticeUpdateInput = Partial<NoticeFormInput>;

const isMissingTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string };
  return maybeError.code === '42P01' || String(maybeError.message || '').toLowerCase().includes(TABLE_NAME);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const legacyNoticeToHtml = (post: LegacyNoticePost) =>
  post.contentSections
    .map((section) => {
      const heading = section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : '';
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
      return `${heading}${paragraphs}`;
    })
    .join('');

const legacyNoticeToPublic = (post: LegacyNoticePost, index: number): NoticePost => ({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  imageUrl: post.imageUrl,
  publishedAt: post.publishedAt,
  category: post.category,
  contentHtml: legacyNoticeToHtml(post),
  displayOrder: index + 1,
  isActive: true,
});

const normalizeDate = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const formatDateForStorage = (value?: string) => {
  const normalized = normalizeDate(value);
  return normalized || new Date().toISOString().slice(0, 10);
};

const normalizeHtml = (value?: string | null) => (value && value.trim() ? value.trim() : '<p></p>');

const normalizeRecord = (record: Record<string, unknown>): NoticePost => ({
  id: String(record.id || ''),
  title: String(record.title || ''),
  excerpt: String(record.excerpt || ''),
  imageUrl: String(record.image_url || ''),
  publishedAt: normalizeDate(record.published_at as string | null | undefined),
  category: String(record.category || ''),
  contentHtml: String(record.content_html || ''),
  displayOrder: Number(record.display_order || 0),
  isActive: record.is_active !== false,
  created_at: typeof record.created_at === 'string' ? record.created_at : undefined,
  updated_at: typeof record.updated_at === 'string' ? record.updated_at : undefined,
});

const normalizePublic = (item: NoticePost): PublicNoticePost => ({
  ...item,
  isActive: item.isActive !== false,
});

const toSupabasePayload = (post: NoticeFormInput | NoticeUpdateInput) => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (post.title !== undefined) payload.title = post.title.trim();
  if (post.excerpt !== undefined) payload.excerpt = post.excerpt.trim();
  if (post.imageUrl !== undefined) payload.image_url = post.imageUrl.trim();
  if (post.publishedAt !== undefined) payload.published_at = formatDateForStorage(post.publishedAt);
  if (post.category !== undefined) payload.category = post.category.trim() || '공지사항';
  if (post.contentHtml !== undefined) payload.content_html = normalizeHtml(post.contentHtml);
  if (post.displayOrder !== undefined) payload.display_order = Number(post.displayOrder || 0);
  if (post.isActive !== undefined) payload.is_active = post.isActive !== false;

  return payload;
};

const createNoticeId = (title: string) => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  const timestamp = Date.now().toString(36);
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `notice-${slug || timestamp}-${random}`;
};

const fetchAdminNoticeRows = async (): Promise<NoticePost[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((record) => normalizeRecord(record as Record<string, unknown>));
};

const getFallbackNoticePosts = (): NoticePost[] =>
  fallbackNoticePosts.map((post, index) => legacyNoticeToPublic(post, index));

export const FALLBACK_NOTICE_POSTS: NoticePost[] = getFallbackNoticePosts();

export const stripNoticeHtml = (html?: string | null) => stripHtmlTags(html);

export const getAllAdminNoticePosts = async (): Promise<NoticePost[]> => {
  try {
    return await fetchAdminNoticeRows();
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }
};

export const getAdminNoticePostCollection = async (): Promise<AdminNoticePostCollection> => {
  try {
    const items = await fetchAdminNoticeRows();
    return {
      items,
      usesFallback: false,
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return {
        items: FALLBACK_NOTICE_POSTS,
        usesFallback: true,
      };
    }
    throw error;
  }
};

export const getPublicNoticePosts = async (): Promise<PublicNoticePost[]> => {
  try {
    const items = await fetchAdminNoticeRows();
    return items.filter((item) => item.isActive !== false).map(normalizePublic);
  } catch (error) {
    if (isMissingTableError(error)) {
      return FALLBACK_NOTICE_POSTS;
    }
    throw error;
  }
};

export const getNoticePostsWithFallback = getPublicNoticePosts;

export const getPublicNoticePostById = async (id: string): Promise<PublicNoticePost | null> => {
  const posts = await getPublicNoticePosts();
  return posts.find((item) => item.id === id) || null;
};

export const getNoticePostByIdWithFallback = getPublicNoticePostById;

export const addNoticePost = async (post: NoticeFormInput): Promise<NoticePost> => {
  const payload = {
    id: createNoticeId(post.title),
    ...toSupabasePayload(post),
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return normalizeRecord(data as Record<string, unknown>);
};

export const updateNoticePost = async (id: string, post: NoticeUpdateInput): Promise<NoticePost> => {
  const payload = toSupabasePayload(post);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeRecord(data as Record<string, unknown>);
};

export const deleteNoticePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
