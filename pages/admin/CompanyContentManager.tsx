import React, { useEffect, useState } from 'react';
import { Building2, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompanySectionsEditor } from '../../components/company/CompanySectionsEditor';
import { getCompanyPageContent, saveCompanyPageContent } from '../../src/api/companyContentApi';
import { invalidatePublicDataCache } from '../../src/api/publicDataApi';
import {
  defaultCompanyPageContent,
  normalizeCompanyPageContent,
  type CompanyPageContent,
} from '../../src/data/companyPageContent';

export const CompanyContentManager: React.FC = () => {
  const [content, setContent] = useState<CompanyPageContent>(defaultCompanyPageContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const loaded = await getCompanyPageContent();
        setContent(loaded);
      } catch (error) {
        console.error('Failed to load company content:', error);
        setContent(defaultCompanyPageContent);
      } finally {
        setLoading(false);
      }
    };

    void loadContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveCompanyPageContent(content);
      invalidatePublicDataCache();
      setContent(normalizeCompanyPageContent(saved));
      alert('회사소개 본문을 저장했습니다.');
    } catch (error) {
      console.error('Failed to save company content:', error);
      alert('저장에 실패했습니다. Supabase에서 `sql/create_page_contents_table.sql`을 먼저 실행해 주세요.');
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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Building2 size={22} className="text-[#001e45]" />
              회사소개 콘텐츠 관리
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              회사소개 상단 히어로, 회사 개요 대표 이미지, 각 탭 본문까지 공개 페이지와 같은 데이터로 함께 관리합니다.
            </p>
          </div>

          <Link
            to="/company"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            공개 페이지에서 수정하기
            <ExternalLink size={16} />
          </Link>
        </div>
      </section>

      <CompanySectionsEditor
        content={content}
        onChange={setContent}
        onSave={handleSave}
        saving={saving}
        title="회사소개 콘텐츠 수정"
        description="회사소개 상단 히어로와 회사 개요 대표 이미지, 회사 개요·사업영역·비전·오시는길 본문을 한 곳에서 관리합니다."
      />
    </div>
  );
};
