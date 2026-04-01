import { getPageContentEntry, upsertPageContentEntry } from './pageContentApi';
import {
  COMPANY_CONTENT_PAGE_KEY,
  defaultCompanyPageContent,
  normalizeCompanyPageContent,
  type CompanyPageContent,
} from '../content/companyPageContent';

export const getCompanyPageContent = async (): Promise<CompanyPageContent> => {
  const entry = await getPageContentEntry<CompanyPageContent>(COMPANY_CONTENT_PAGE_KEY);
  return normalizeCompanyPageContent(entry?.content || defaultCompanyPageContent);
};

export const saveCompanyPageContent = async (content: CompanyPageContent): Promise<CompanyPageContent> => {
  const normalizedContent = normalizeCompanyPageContent(content);
  const saved = await upsertPageContentEntry(COMPANY_CONTENT_PAGE_KEY, normalizedContent);
  return normalizeCompanyPageContent(saved?.content || content);
};
