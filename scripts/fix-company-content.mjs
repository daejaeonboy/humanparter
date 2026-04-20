import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mnxsvjrqrayhbcmhwddz.supabase.co',
  'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv',
);

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderParagraph = (value) => `<p>${escapeHtml(value)}</p>`;
const renderHeading = (tag, value) => `<${tag}>${escapeHtml(value)}</${tag}>`;
const renderImage = (src, alt) => `<p><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" /></p>`;

const overviewImage = '/company/abouthuman.png';
const businessImage = '/company/service-01.jpg';
const visionImage = '/company/service-02.png';

const overviewTitle = '휴먼파트너는 비즈니스의 성공적인 운영을 지원하는 실무 중심의 운영 파트너입니다.';
const overviewParagraphs = [
  '기업(B2B)과 공공기관(B2G)이 본연의 업무에 집중할 수 있도록 최적화된 장비 솔루션과 체계적인 관리 서비스를 제공합니다. 휴먼파트너는 복잡한 렌탈 과정을 단순화하고, 고객 환경에 맞춘 유연한 대응으로 언제나 곁에서 실질적인 도움을 주는 파트너가 되고자 합니다.',
  '고객이 필요로 하는 것은 단순한 품목의 나열이 아니라, 실제 업무와 현장에서 바로 활용할 수 있는 안정적인 운영 환경입니다. 휴먼파트너는 이 점을 정확히 이해하고, 목적과 상황에 맞는 방식으로 준비 과정 전반을 함께 설계합니다.',
  '업무 공간을 새롭게 구축하거나 기존 환경을 빠르게 재정비해야 하는 순간에는 많은 판단이 필요합니다. 어떤 품목이 실제로 필요한지, 예산 안에서 어떤 구성이 효율적인지, 설치와 운영 일정은 어떻게 조율할지, 사용 중 발생할 수 있는 변수는 어떻게 줄일지까지 함께 고민해야 합니다. 휴먼파트너는 이러한 과정을 고객이 혼자 감당하지 않도록 초기 상담부터 필요한 기준을 정리하고 실행 가능한 구성으로 구체화합니다.',
  '현장마다 필요한 기준은 다릅니다. 어떤 곳은 빠른 설치와 즉시 사용이 중요하고, 또 어떤 곳은 예산 안에서 효율적인 구성을 만드는 일이 우선일 수 있습니다. 휴먼파트너는 하나의 방식만 고집하지 않고, 고객의 상황과 운영 목적에 맞춰 제안의 우선순위를 조정합니다. 그래서 같은 렌탈이라도 더 현실적이고 더 실용적인 구성으로 연결될 수 있습니다.',
  '고객이 얻는 가장 큰 가치는 준비와 관리의 부담을 줄이면서도 운영의 안정감을 높일 수 있다는 점입니다. 상담, 제안, 설치, 유지관리, 회수까지 전 과정을 체계적으로 지원하기 때문에 고객은 복잡한 조율과 반복적인 확인 업무를 줄이고 본연의 핵심 업무에 더욱 집중할 수 있습니다.',
  '휴먼파트너는 단기적인 공급 관계보다 함께 준비하고 끝까지 관리하는 파트너십을 지향합니다. 고객이 필요한 시점에 맞춰 유연하게 대응하고, 변화하는 조건에도 흔들리지 않는 안정적인 운영 흐름을 만드는 것, 그것이 휴먼파트너가 제공하고자 하는 실질적인 가치입니다. 앞으로도 고객의 준비 과정은 더 단순하게, 운영 결과는 더 완성도 높게 만들 수 있도록 현장에 맞는 제안과 실행으로 함께하겠습니다.',
];

const businessTitle = '휴먼파트너의 사업영역은 단순히 품목을 나열해 공급하는 데서 끝나지 않습니다.';
const businessIntroParagraphs = [
  '고객이 실제로 필요로 하는 공간 구성과 운영 흐름을 먼저 이해하고, 그 목적에 맞는 품목과 방식으로 렌탈 구성을 제안하는 것이 휴먼파트너 사업의 핵심입니다. 사무가구와 IT 장비, 운영에 필요한 각종 품목을 고객 환경에 맞게 조합해 보다 효율적이고 안정적인 업무 환경을 구축할 수 있도록 지원합니다.',
  '업무 공간을 준비하는 과정에서는 필요한 물품만 확보하는 것으로 충분하지 않은 경우가 많습니다. 현장 규모와 사용 목적, 일정, 예산, 설치 조건까지 함께 고려해야 실제 운영에 무리가 없는 구성이 완성됩니다. 휴먼파트너는 고객이 당장 필요한 품목뿐 아니라 운영 과정에서 실제 도움이 되는 구성까지 함께 검토해 보다 현실적인 제안을 제공합니다.',
];

const businessSections = [
  {
    title: '사무가구 렌탈',
    body:
      '사무가구 렌탈은 휴먼파트너의 기본 사업영역 중 하나입니다. 책상, 의자, 수납장, 회의용 가구 등 업무 공간에 필요한 기본 가구를 현장 여건에 맞춰 구성하고, 공간 효율과 사용 편의성까지 고려한 배치를 제안합니다. 단기 프로젝트 공간이든 장기 운영 공간이든 목적에 맞는 가구 구성을 빠르고 안정적으로 지원합니다.',
  },
  {
    title: 'IT 장비 렌탈',
    body:
      'IT 장비 렌탈 역시 중요한 사업영역입니다. 노트북, 모니터, 데스크톱, 프린터, 복합기 등 업무 운영에 직접 연결되는 장비는 실제 사용 환경에 맞게 빠르게 세팅되고 안정적으로 운영되는 것이 중요합니다. 고성능 기업용 PC와 삼성 복합기 등 사무환경의 핵심 인프라 구축까지 지원하며, 초기 도입 비용 부담은 줄이고 정기적인 유지보수와 신속한 AS로 업무 공백을 최소화합니다.',
  },
  {
    title: '운영 지원 및 현장 대응',
    body:
      '운영에 필요한 부가 품목과 현장 지원 역시 함께 제공합니다. 행사 성격과 프로젝트 환경에 맞는 배치, 기술 지원, 공공기관 기준에 맞는 투명한 계약 절차와 철저한 사후관리까지 하나의 흐름으로 대응해 고객이 여러 업체를 나누어 관리하는 부담을 줄입니다.',
  },
];

const businessClosingParagraph =
  '휴먼파트너의 사업영역은 결국 고객이 더 빠르고 안정적으로 운영을 시작할 수 있도록 만드는 데 목적이 있습니다. 품목 공급, 구성 제안, 설치, 유지관리, 회수까지 이어지는 전 과정을 체계적으로 지원함으로써 고객이 본연의 업무와 운영에 더욱 집중할 수 있도록 돕습니다.';

const visionTitle = '기술과 사람이 맞닿는 효율의 정점';
const visionParagraphs = [
  '휴먼파트너의 지향점은 렌탈의 디지털 고도화와 인간적 신뢰의 결합에 있습니다.',
  '오늘날 기업과 기관의 업무 환경은 점점 더 빠르게 변하고 있습니다. 공간을 새롭게 구성해야 하는 상황도 많아졌고, 프로젝트 일정에 따라 단기간에 환경을 마련해야 하는 경우도 적지 않습니다. 이런 변화 속에서 고객이 원하는 것은 단순히 물품을 빌리는 서비스가 아니라, 준비 과정의 부담을 줄이고 운영의 완성도를 높일 수 있는 실질적인 지원입니다. 휴먼파트너는 바로 그 지점에서 역할을 해야 한다고 생각합니다.',
  '플랫폼 기반의 효율적인 관리 시스템을 통해 고객이 장비 관리의 번거로움에서 완전히 자유로워지는 세상을 꿈꿉니다. 가장 효율적인 방식으로 자원을 공유하되, 그 과정에서 느껴지는 책임감과 디테일은 사람의 온기를 담아내는 것. 휴먼파트너는 기술로 업무를 혁신하고, 신뢰로 관계를 지속하며 대한민국 B2B 렌탈 시장의 새로운 표준이 되겠습니다.',
  '건강한 기업, 지속적인 발전, 우수서비스',
  '㈜신도리코 공식파트너인 휴먼파트너는 신도리코의 전국 인프라를 활용한 업무연계 및 정보공유 / 본사교육을 통해 다양한 정보력을 바탕으로 높은 기술력을 제공합니다.',
  "또한 건강한 기업으로서 기아대책, 유니세프, UN난민구조, 굿네이버스 국내/국제아동보호사업에 수익의 일부를 꾸준하게 기부하고 있으며, '존경받는 기업, 발전하는 회사'라는 경영 이념을 기반으로 우리 사회 전체가 건강하고 지속 가능하도록 만드는 데 필요한 역할을 앞으로도 적극적으로 해 나갈 것입니다.",
];

const visionItems = [
  {
    title: '디지털 고도화',
    description: '플랫폼 기반의 효율적인 관리 시스템으로 고객이 장비 관리의 번거로움에서 벗어날 수 있도록 돕습니다.',
  },
  {
    title: '인간적 신뢰',
    description: '기술 중심의 효율 위에 책임감과 디테일, 사람의 온기를 더해 오래 지속되는 관계를 만듭니다.',
  },
  {
    title: '지속 가능한 성장',
    description: '건강한 기업 운영과 사회공헌을 함께 실천하며 B2B 렌탈 시장의 새로운 표준을 만들어갑니다.',
  },
];

const overviewHtml = [
  renderHeading('h2', '회사 개요'),
  renderParagraph(overviewTitle),
  renderParagraph(overviewParagraphs[0]),
  renderParagraph(overviewParagraphs[1]),
  renderImage(overviewImage, '회사개요 이미지'),
  ...overviewParagraphs.slice(2).map(renderParagraph),
].join('');

const businessHtml = [
  renderParagraph(businessIntroParagraphs[0]),
  renderParagraph(businessIntroParagraphs[1]),
  renderImage(businessImage, '사업영역 이미지'),
  ...businessSections.flatMap((section) => [renderHeading('h3', section.title), renderParagraph(section.body)]),
  renderParagraph(businessClosingParagraph),
].join('');

const visionHtml = [
  renderHeading('h2', visionTitle),
  renderParagraph(visionParagraphs[0]),
  renderParagraph(visionParagraphs[1]),
  renderImage(visionImage, '비전 이미지'),
  renderParagraph(visionParagraphs[2]),
  renderHeading('h3', visionParagraphs[3]),
  renderParagraph(visionParagraphs[4]),
  renderParagraph(visionParagraphs[5]),
].join('');

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

const nextContent = {
  ...current,
  overview: {
    ...(current.overview || {}),
    eyebrow: current.overview?.eyebrow || 'ABOUT HUMAN PARTNER',
    title: overviewTitle,
    paragraphs: overviewParagraphs,
    checklist: Array.isArray(current.overview?.checklist) ? current.overview.checklist : [],
    imageUrl: overviewImage,
  },
  business: {
    ...(current.business || {}),
    eyebrow: current.business?.eyebrow || 'OUR SERVICES',
    title: businessTitle,
    description: [...businessIntroParagraphs, ...businessSections.map((item) => item.body), businessClosingParagraph].join('\n\n'),
    cards: Array.isArray(current.business?.cards) ? current.business.cards : [],
  },
  vision: {
    ...(current.vision || {}),
    eyebrow: current.vision?.eyebrow || 'VISION',
    title: visionTitle,
    description: visionParagraphs.join('\n\n'),
    items: visionItems,
  },
  bodySections: {
    ...(current.bodySections || {}),
    overviewHtml,
    businessHtml,
    visionHtml,
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

console.log('company content fixed');
