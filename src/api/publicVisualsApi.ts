import { getPageContentEntry, upsertPageContentEntry } from './pageContentApi';
import {
  PUBLIC_VISUALS_PAGE_KEY,
  defaultPublicVisualsContent,
  normalizePublicVisualsContent,
  type PublicVisualsContent,
} from '../data/publicVisualsContent';

export const getPublicVisualsContent = async (): Promise<PublicVisualsContent> => {
  const entry = await getPageContentEntry<PublicVisualsContent>(PUBLIC_VISUALS_PAGE_KEY);
  return normalizePublicVisualsContent(entry?.content || defaultPublicVisualsContent);
};

export const savePublicVisualsContent = async (content: PublicVisualsContent): Promise<PublicVisualsContent> => {
  const normalizedContent = normalizePublicVisualsContent(content);
  const saved = await upsertPageContentEntry(PUBLIC_VISUALS_PAGE_KEY, normalizedContent);
  return normalizePublicVisualsContent(saved?.content || normalizedContent);
};
