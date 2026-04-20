import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mnxsvjrqrayhbcmhwddz.supabase.co',
  'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv',
);

const expectedOverviewTitle = '휴먼파트너는 비즈니스의 성공적인 운영을 지원하는 실무 중심의 운영 파트너입니다.';
const expectedBusinessTitle = '휴먼파트너의 사업영역은 단순히 품목을 나열해 공급하는 데서 끝나지 않습니다.';
const expectedVisionTitle = '건강한 기업, 지속적인 발전, 우수서비스';

const { data, error } = await supabase
  .from('page_contents')
  .select('content')
  .eq('page_key', 'company')
  .maybeSingle();

if (error) {
  console.error(error);
  process.exit(1);
}

const checks = [
  data?.content?.overview?.title === expectedOverviewTitle,
  data?.content?.business?.title === expectedBusinessTitle,
  data?.content?.vision?.title === expectedVisionTitle,
  String(data?.content?.bodySections?.overviewHtml || '').includes(expectedOverviewTitle),
  String(data?.content?.bodySections?.businessHtml || '').includes('고객이 실제로 필요로 하는 공간 구성과 운영 흐름을 먼저 이해하고'),
  String(data?.content?.bodySections?.visionHtml || '').includes('㈜신도리코 공식파트너인 휴먼파트너는'),
];

if (!checks.every(Boolean)) {
  console.error('VERIFY_FAILED');
  process.exit(1);
}

console.log('VERIFY_OK');
