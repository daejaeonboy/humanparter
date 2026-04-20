import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mnxsvjrqrayhbcmhwddz.supabase.co',
  'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv',
);

const targetParagraph =
  '휴먼파트너가 중요하게 생각하는 것은 보기 좋은 제안이 아니라 실제로 운영이 잘 되는 결과입니다. 사무가구와 IT 장비, 운영에 필요한 다양한 품목을 고객 환경에 맞춰 빠르게 구성하고, 현장 여건과 일정에 맞는 설치 계획까지 함께 조율해 불필요한 시행착오를 줄입니다. 준비 과정에서 놓치기 쉬운 부분까지 미리 점검하기 때문에 고객은 더 예측 가능한 일정 안에서 업무를 시작할 수 있습니다.';

const escapedTarget = targetParagraph
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const targetHtmlParagraph = `<p>${escapedTarget}</p>`;

const { data, error } = await supabase
  .from('page_contents')
  .select('page_key, content')
  .eq('page_key', 'company')
  .maybeSingle();

if (error) {
  console.error(error);
  process.exit(1);
}

const current = data?.content || {};
const currentOverview = current.overview || {};
const currentBodySections = current.bodySections || {};

const nextOverviewParagraphs = Array.isArray(currentOverview.paragraphs)
  ? currentOverview.paragraphs.filter((item) => item !== targetParagraph)
  : [];

const overviewHtml = String(currentBodySections.overviewHtml || '');
const nextOverviewHtml = overviewHtml.replace(targetHtmlParagraph, '');

const nextContent = {
  ...current,
  overview: {
    ...currentOverview,
    paragraphs: nextOverviewParagraphs,
  },
  bodySections: {
    ...currentBodySections,
    overviewHtml: nextOverviewHtml,
  },
};

const { error: upsertError } = await supabase
  .from('page_contents')
  .upsert(
    [
      {
        page_key: 'company',
        content: nextContent,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: 'page_key' },
  );

if (upsertError) {
  console.error(upsertError);
  process.exit(1);
}

console.log('removed target overview paragraph');
