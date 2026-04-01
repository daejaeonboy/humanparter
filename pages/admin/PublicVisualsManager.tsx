import React, { useEffect, useMemo, useState } from 'react';
import { ImageIcon, Loader2, Save, Upload } from 'lucide-react';
import { invalidatePublicDataCache } from '../../src/api/publicDataApi';
import { getPublicVisualsContent, savePublicVisualsContent } from '../../src/api/publicVisualsApi';
import { uploadImage } from '../../src/api/storageApi';
import {
  defaultPublicVisualsContent,
  normalizePublicVisualsContent,
  type CollectionHeroKeyMap,
  type PublicMegaMenuPreviewKey,
  type PublicVisualsContent,
} from '../../src/content/publicVisualsContent';
import { MEGA_MENU_PREVIEW_EDITORS } from '../../src/config/publicMegaMenu';

type CollectionHeroEditor =
  | {
      key: string;
      label: string;
      description: string;
      group: 'cs';
      itemKey: CollectionHeroKeyMap['cs'];
    }
  | {
      key: string;
      label: string;
      description: string;
      group: 'notice';
      itemKey: CollectionHeroKeyMap['notice'];
    }
  | {
      key: string;
      label: string;
      description: string;
      group: 'cases';
      itemKey: CollectionHeroKeyMap['cases'];
    };

const productDefaultEditor = {
  key: 'product-default',
  label: '제품 목록 기본 비주얼',
  description: '상품 목록 상단 기본 히어로 이미지와 설명에 사용됩니다.',
};

const collectionHeroEditors: CollectionHeroEditor[] = [
  {
    key: 'cs-faq',
    label: '고객센터 FAQ 상단 배너',
    description: '고객센터 FAQ 페이지 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'cs',
    itemKey: 'faq',
  },
  {
    key: 'cs-as-guide',
    label: 'A/S 안내 상단 배너',
    description: '고객센터 A/S 안내 페이지 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'cs',
    itemKey: 'asGuide',
  },
  {
    key: 'notice-all',
    label: '공지사항 기본 상단 배너',
    description: '공지사항 목록의 기본 탭 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'notice',
    itemKey: 'all',
  },
  {
    key: 'notice-news',
    label: '공지사항 탭 상단 배너',
    description: '공지사항 목록의 공지사항 탭 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'notice',
    itemKey: 'news',
  },
  {
    key: 'notice-resources',
    label: '자료실 탭 상단 배너',
    description: '공지사항 목록의 자료실 탭 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'notice',
    itemKey: 'resources',
  },
  {
    key: 'cases-all',
    label: '설치사례 기본 상단 배너',
    description: '설치사례 목록의 기본 탭 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'cases',
    itemKey: 'all',
  },
  {
    key: 'cases-temporary-office',
    label: '임시사무실 상단 배너',
    description: '설치사례 목록의 임시사무실 탭 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'cases',
    itemKey: 'temporaryOffice',
  },
  {
    key: 'cases-public-institution',
    label: '공공기관 상단 배너',
    description: '설치사례 목록의 공공기관 탭 상단 히어로 이미지와 설명에 사용됩니다.',
    group: 'cases',
    itemKey: 'publicInstitution',
  },
];

const sectionCardClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#001e45]';
const textareaClassName = `${inputClassName} min-h-[112px] resize-y leading-6`;

const getCollectionHeroAsset = (
  content: PublicVisualsContent,
  item: CollectionHeroEditor,
) => {
  switch (item.group) {
    case 'cs':
      return content.collectionHeroes.cs[item.itemKey];
    case 'notice':
      return content.collectionHeroes.notice[item.itemKey];
    case 'cases':
      return content.collectionHeroes.cases[item.itemKey];
    default:
      return content.collectionHeroes.cs.faq;
  }
};

export const PublicVisualsManager: React.FC = () => {
  const [content, setContent] = useState<PublicVisualsContent>(defaultPublicVisualsContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const loaded = await getPublicVisualsContent();
        setContent(loaded);
      } catch (error) {
        console.error('Failed to load public visuals:', error);
        setContent(defaultPublicVisualsContent);
      } finally {
        setLoading(false);
      }
    };

    void loadContent();
  }, []);

  const megaMenuPreviewSections = useMemo(
    () =>
      MEGA_MENU_PREVIEW_EDITORS.map((item) => ({
        ...item,
        imageUrl: content.megaMenuPreviews[item.key]?.imageUrl || '',
      })),
    [content.megaMenuPreviews],
  );

  const updateProductDefault = (field: 'imageUrl' | 'description', value: string) => {
    setContent((prev) => ({
      ...prev,
      productDefaults: {
        ...prev.productDefaults,
        all: {
          ...prev.productDefaults.all,
          [field]: value,
        },
      },
    }));
  };

  const updateCollectionHero = (
    group: CollectionHeroEditor['group'],
    itemKey: string,
    field: 'title' | 'imageUrl' | 'description',
    value: string,
  ) => {
    setContent((prev) => {
      const currentGroup = prev.collectionHeroes[group] as Record<string, { title?: string; imageUrl: string; description: string }>;
      return {
        ...prev,
        collectionHeroes: {
          ...prev.collectionHeroes,
          [group]: {
            ...currentGroup,
            [itemKey]: {
              ...currentGroup[itemKey],
              [field]: value,
            },
          },
        },
      };
    });
  };

  const updateMegaMenuPreview = (
    key: PublicMegaMenuPreviewKey,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      megaMenuPreviews: {
        ...prev.megaMenuPreviews,
        [key]: {
          ...prev.megaMenuPreviews[key],
          imageUrl: value,
        },
      },
    }));
  };

  const handleUpload = async (
    key: string,
    onComplete: (imageUrl: string) => void,
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingKey(key);
      try {
        const imageUrl = await uploadImage(file, 'banners');
        onComplete(imageUrl);
      } catch (error) {
        console.error(error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setUploadingKey(null);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await savePublicVisualsContent(content);
      invalidatePublicDataCache();
      setContent(normalizePublicVisualsContent(saved));
      alert('공개 비주얼을 저장했습니다.');
    } catch (error) {
      console.error('Failed to save public visuals:', error);
      alert('저장에 실패했습니다. page_contents 테이블과 public-visuals 시드가 준비되었는지 확인해 주세요.');
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">공개 비주얼 관리</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              공개 페이지 상단 배너와 헤더 메가 메뉴의 상위 5개 대표 이미지를 한 곳에서 관리합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#001e45] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#153a82] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            저장하기
          </button>
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">제품 기본 비주얼</h2>
          <p className="mt-1 text-sm text-slate-500">{productDefaultEditor.description}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {content.productDefaults.all.imageUrl ? (
              <img src={content.productDefaults.all.imageUrl} alt={productDefaultEditor.label} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center text-slate-300">
                <ImageIcon size={36} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleUpload(productDefaultEditor.key, (imageUrl) => updateProductDefault('imageUrl', imageUrl))}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {uploadingKey === productDefaultEditor.key ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                이미지 업로드
              </button>
            </div>

            <input
              type="url"
              value={content.productDefaults.all.imageUrl}
              onChange={(event) => updateProductDefault('imageUrl', event.target.value)}
              className={inputClassName}
              placeholder="기본 제품 비주얼 이미지 URL"
            />
            <textarea
              value={content.productDefaults.all.description}
              onChange={(event) => updateProductDefault('description', event.target.value)}
              className={textareaClassName}
              placeholder="기본 제품 비주얼 설명"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">상단 배너</h2>
          <p className="mt-1 text-sm text-slate-500">공개 페이지 상단 히어로 제목, 이미지, 설명을 관리합니다.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {collectionHeroEditors.map((item) => {
            const visual = getCollectionHeroAsset(content, item);

            return (
              <article key={item.key} className={sectionCardClass}>
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {visual.imageUrl ? (
                      <img src={visual.imageUrl} alt={item.label} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-slate-300">
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => void handleUpload(item.key, (imageUrl) => updateCollectionHero(item.group, item.itemKey, 'imageUrl', imageUrl))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {uploadingKey === item.key ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      이미지 업로드
                    </button>

                    <input
                      type="text"
                      value={visual.title || ''}
                      onChange={(event) => updateCollectionHero(item.group, item.itemKey, 'title', event.target.value)}
                      className={inputClassName}
                      placeholder="상단 배너 제목"
                    />
                    <input
                      type="url"
                      value={visual.imageUrl}
                      onChange={(event) => updateCollectionHero(item.group, item.itemKey, 'imageUrl', event.target.value)}
                      className={inputClassName}
                      placeholder="상단 배너 이미지 URL"
                    />
                    <textarea
                      value={visual.description}
                      onChange={(event) => updateCollectionHero(item.group, item.itemKey, 'description', event.target.value)}
                      className={textareaClassName}
                      placeholder="상단 배너 설명"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">메가 메뉴 대표 이미지</h2>
          <p className="mt-1 text-sm text-slate-500">헤더 메가 메뉴의 상위 5개 메뉴 이미지를 관리합니다.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {megaMenuPreviewSections.map((item) => {
            const uploadKey = `mega-menu-preview:${item.key}`;

            return (
              <article key={item.key} className={sectionCardClass}>
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.label} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-slate-300">
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => void handleUpload(uploadKey, (imageUrl) => updateMegaMenuPreview(item.key, imageUrl))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {uploadingKey === uploadKey ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      이미지 업로드
                    </button>

                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(event) => updateMegaMenuPreview(item.key, event.target.value)}
                      className={inputClassName}
                      placeholder="메가 메뉴 대표 이미지 URL"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
