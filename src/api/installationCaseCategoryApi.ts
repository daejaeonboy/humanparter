import { getPageContentEntry, upsertPageContentEntry } from './pageContentApi';

const INSTALLATION_CASE_CATEGORIES_PAGE_KEY = 'installation-case-categories';

interface InstallationCaseCategoriesContent {
  categories?: string[];
}

const normalizeCategoryLabel = (value: string) => value.trim().replace(/\s+/g, ' ');

const dedupeCategories = (categories: string[]) =>
  Array.from(
    new Set(
      categories
        .map((category) => normalizeCategoryLabel(category))
        .filter(Boolean),
    ),
  );

export const getInstallationCaseCategories = async (): Promise<string[]> => {
  const entry = await getPageContentEntry<InstallationCaseCategoriesContent>(INSTALLATION_CASE_CATEGORIES_PAGE_KEY);
  return dedupeCategories(entry?.content?.categories || []);
};

export const saveInstallationCaseCategories = async (categories: string[]): Promise<string[]> => {
  const normalizedCategories = dedupeCategories(categories);
  const saved = await upsertPageContentEntry<InstallationCaseCategoriesContent>(
    INSTALLATION_CASE_CATEGORIES_PAGE_KEY,
    { categories: normalizedCategories },
  );

  return dedupeCategories(saved.content?.categories || normalizedCategories);
};
