import { supabase } from '../lib/supabase';
import { noticePosts as fallbackNoticePosts, type NoticePost as LegacyNoticePost } from '../data/noticePosts';
import { stripHtmlTags } from '../utils/html';

const TABLE_NAME = 'notice_posts';
const TABLE_STATUS_STORAGE_KEY = 'hp_notice_posts_table_status';

export interface NoticeAttachment {
  name: string;
  url: string;
}

export interface NoticePost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  contentHtml: string;
  attachments?: NoticeAttachment[];
  displayOrder: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PublicNoticePost = NoticePost;
export type NoticeAuthoringInput = Pick<
  NoticePost,
  'title' | 'excerpt' | 'imageUrl' | 'publishedAt' | 'category' | 'contentHtml' | 'attachments'
>;

export const DEFAULT_NOTICE_CATEGORY = '공지사항';
export const createEmptyNoticeAuthoringInput = (): NoticeAuthoringInput => ({
  title: '',
  excerpt: '',
  imageUrl: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  category: DEFAULT_NOTICE_CATEGORY,
  contentHtml: '<p></p>',
  attachments: [],
});

export const buildNoticeAuthoringInputFromPost = (post: NoticePost): NoticeAuthoringInput => ({
  title: post.title,
  excerpt: post.excerpt,
  imageUrl: post.imageUrl,
  publishedAt: post.publishedAt,
  category: post.category,
  contentHtml: post.contentHtml,
  attachments: post.attachments || [],
});

export const getNextNoticeDisplayOrder = (items: Pick<NoticePost, 'displayOrder'>[]) =>
  items.reduce((max, item) => Math.max(max, Number(item.displayOrder || 0)), 0) + 1;

export interface AdminNoticePostCollection {
  items: NoticePost[];
  usesFallback: boolean;
}

interface NoticeFetchOptions {
  bypassMissingCache?: boolean;
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

type NoticeFormInput = NoticeAuthoringInput & {
  displayOrder: number;
  isActive: boolean;
};
type NoticeUpdateInput = Partial<NoticeFormInput>;
type TableStatus = 'unknown' | 'available' | 'missing';

let tableStatusCache: TableStatus = 'unknown';

const isMissingTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string };
  return maybeError.code === '42P01' || String(maybeError.message || '').toLowerCase().includes(TABLE_NAME);
};

const createMissingTableError = () => ({
  code: '42P01',
  message: `${TABLE_NAME} table is missing`,
});

const readStoredTableStatus = (): TableStatus => {
  if (typeof window === 'undefined') return 'unknown';

  try {
    const stored = window.sessionStorage.getItem(TABLE_STATUS_STORAGE_KEY);
    return stored === 'available' || stored === 'missing' ? stored : 'unknown';
  } catch {
    return 'unknown';
  }
};

const writeStoredTableStatus = (status: Exclude<TableStatus, 'unknown'>) => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(TABLE_STATUS_STORAGE_KEY, status);
  } catch {
    // Ignore sessionStorage write failures.
  }
};

const getTableStatus = () => {
  if (tableStatusCache !== 'unknown') return tableStatusCache;
  tableStatusCache = readStoredTableStatus();
  return tableStatusCache;
};

const setTableStatus = (status: Exclude<TableStatus, 'unknown'>) => {
  tableStatusCache = status;
  writeStoredTableStatus(status);
};

export const resetNoticePostTableStatus = () => {
  tableStatusCache = 'unknown';

  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(TABLE_STATUS_STORAGE_KEY);
  } catch {
    // Ignore sessionStorage write failures.
  }
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

const ATTACHMENT_BLOCK_START = '<!--hp-attachments:start-->';
const ATTACHMENT_BLOCK_END = '<!--hp-attachments:end-->';

const stripInjectedAttachmentBlock = (html?: string | null) => {
  const normalized = normalizeHtml(html);
  const pattern = new RegExp(`${ATTACHMENT_BLOCK_START}[\\s\\S]*?${ATTACHMENT_BLOCK_END}`, 'g');
  return normalized.replace(pattern, '').trim() || '<p></p>';
};

const escapeAttachmentHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const injectAttachmentBlock = (html: string, attachments?: NoticeAttachment[]) => {
  const cleanHtml = stripInjectedAttachmentBlock(html);

  if (!attachments || attachments.length === 0) {
    return cleanHtml;
  }

  const items = attachments
    .filter((attachment) => attachment.name.trim() && attachment.url.trim())
    .map(
      (attachment) =>
        `<li><a href="${escapeAttachmentHtml(attachment.url)}" target="_blank" rel="noreferrer">${escapeAttachmentHtml(attachment.name)}</a></li>`,
    )
    .join('');

  if (!items) {
    return cleanHtml;
  }

  return `${cleanHtml}
${ATTACHMENT_BLOCK_START}
<section class="hp-attachments">
  <h2>첨부 자료</h2>
  <ul>
    ${items}
  </ul>
</section>
${ATTACHMENT_BLOCK_END}`;
};

const sortNoticePosts = (items: NoticePost[]) =>
  [...items].sort((a, b) => {
    const aOrder = Number.isFinite(a.displayOrder) ? a.displayOrder : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(b.displayOrder) ? b.displayOrder : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aPublishedAt = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bPublishedAt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    if (aPublishedAt !== bPublishedAt) return bPublishedAt - aPublishedAt;

    const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreatedAt - aCreatedAt;
  });

const normalizeRecord = (record: Record<string, unknown>): NoticePost => ({
  id: String(record.id || ''),
  title: String(record.title || ''),
  excerpt: String(record.excerpt || ''),
  imageUrl: String(record.image_url || ''),
  publishedAt: normalizeDate(record.published_at as string | null | undefined),
  category: String(record.category || ''),
  contentHtml: String(record.content_html || ''),
  attachments: Array.isArray(record.attachments) ? record.attachments : [],
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
  if (post.attachments !== undefined && post.attachments.length > 0) payload.attachments = post.attachments;
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

const isMissingAttachmentsSchemaError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { message?: string; code?: string };
  return (
    maybeError.code === 'PGRST204' &&
    String(maybeError.message || '').toLowerCase().includes('attachments')
  );
};

const fetchAdminNoticeRows = async (options?: NoticeFetchOptions): Promise<NoticePost[]> => {
  if (!options?.bypassMissingCache && getTableStatus() === 'missing') {
    throw createMissingTableError();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*');

  if (error) {
    if (isMissingTableError(error)) {
      setTableStatus('missing');
    }
    throw error;
  }

  setTableStatus('available');

  return sortNoticePosts((data || []).map((record) => normalizeRecord(record as Record<string, unknown>)));
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

export const getAdminNoticePostCollection = async (
  options?: NoticeFetchOptions,
): Promise<AdminNoticePostCollection> => {
  try {
    const items = await fetchAdminNoticeRows(options);
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

  if (error) {
    if (isMissingAttachmentsSchemaError(error) && (post.attachments?.length || 0) > 0) {
      const fallbackPayload = {
        id: payload.id,
        ...toSupabasePayload({
          ...post,
          contentHtml: injectAttachmentBlock(post.contentHtml, post.attachments),
          attachments: [],
        }),
      };

      const retry = await supabase
        .from(TABLE_NAME)
        .insert([fallbackPayload])
        .select()
        .single();

      if (retry.error) throw retry.error;
      return normalizeRecord(retry.data as Record<string, unknown>);
    }

    throw error;
  }
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

  if (error) {
    if (isMissingAttachmentsSchemaError(error) && (post.attachments?.length || 0) > 0) {
      const retryPayload = toSupabasePayload({
        ...post,
        contentHtml: injectAttachmentBlock(post.contentHtml, post.attachments),
        attachments: [],
      });

      const retry = await supabase
        .from(TABLE_NAME)
        .update(retryPayload)
        .eq('id', id)
        .select()
        .single();

      if (retry.error) throw retry.error;
      return normalizeRecord(retry.data as Record<string, unknown>);
    }

    throw error;
  }
  return normalizeRecord(data as Record<string, unknown>);
};

export const deleteNoticePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
