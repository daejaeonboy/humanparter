export interface NoticeContentSection {
  heading?: string;
  paragraphs: string[];
}

export interface NoticePost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  contentSections: NoticeContentSection[];
}

export const noticePosts: NoticePost[] = [
  {
    id: "notice-2026-office-rental-guide",
    title: "2026년 2분기 사무가구 렌탈 상담 접수 안내",
    excerpt:
      "기업 이전, 증설, 단기 프로젝트에 맞춘 사무가구 렌탈 상담 접수를 순차적으로 운영합니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-03-31",
    category: "운영안내",
    contentSections: [
      {
        heading: "상담 접수 범위",
        paragraphs: [
          "휴먼파트너는 사무실 이전, 신규 입주, 단기 인력 확충 등 다양한 상황에 맞춘 사무가구 렌탈 상담을 접수하고 있습니다.",
          "프로젝트 규모와 일정, 희망 품목을 미리 전달해주시면 현장 조건에 맞는 구성안을 보다 빠르게 제안드릴 수 있습니다.",
        ],
      },
      {
        heading: "사전 전달 권장 사항",
        paragraphs: [
          "좌석 수, 회의 공간 필요 여부, 설치 희망 일정, 반입 제약 사항을 함께 남겨주시면 초기 상담 정확도가 높아집니다.",
          "도면이나 현장 사진이 있다면 견적 및 배치 제안에 큰 도움이 됩니다.",
        ],
      },
    ],
  },
  {
    id: "notice-2026-installation-schedule-guide",
    title: "설치 일정 사전 협의 요청 안내",
    excerpt:
      "현장 설치 일정은 프로젝트 일정에 맞춰 조율되며, 반입 동선과 출입 가능 시간 확인이 필요합니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-03-28",
    category: "설치안내",
    contentSections: [
      {
        heading: "사전 협의 필요 항목",
        paragraphs: [
          "설치 전에는 건물 출입 가능 시간, 엘리베이터 사용 가능 여부, 주차 및 하역 동선 등을 반드시 확인해 주세요.",
          "특히 야간 설치나 주말 설치가 필요한 경우에는 최소 수일 전 협의가 권장됩니다.",
        ],
      },
      {
        heading: "현장 운영 팁",
        paragraphs: [
          "현장 담당자 연락처를 함께 전달해주시면 설치 당일 대응이 더욱 원활합니다.",
          "설치 완료 후에는 주요 동선과 배치 상태를 함께 확인하며 최종 인수 절차를 진행합니다.",
        ],
      },
    ],
  },
  {
    id: "notice-2026-it-package-update",
    title: "IT 장비 패키지 렌탈 구성 업데이트",
    excerpt:
      "노트북, 모니터, 주변기기를 묶은 기업형 IT 패키지 제안 구성이 새롭게 정리되었습니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-03-24",
    category: "서비스업데이트",
    contentSections: [
      {
        heading: "주요 변경 사항",
        paragraphs: [
          "프로젝트 성격에 따라 일반 사무형, 교육장형, 발표/행사형으로 나눈 추천 패키지를 우선 제안하고 있습니다.",
          "필요 시 장비 수량, 화면 크기, 네트워크 장비 포함 여부 등은 개별 조건에 따라 조정 가능합니다.",
        ],
      },
      {
        heading: "추천 대상",
        paragraphs: [
          "단기간에 다수의 좌석 환경을 구성해야 하는 교육장, 공공기관, 행사 운영 현장에 적합합니다.",
          "설치부터 회수까지 일괄 지원을 원하시는 고객에게 특히 효율적인 구성입니다.",
        ],
      },
    ],
  },
  {
    id: "notice-2026-customer-hours",
    title: "기업 상담 운영 시간 및 응대 기준 안내",
    excerpt:
      "평일 기업 상담 운영 시간과 견적 응대 절차를 정리해드립니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-03-21",
    category: "고객센터",
    contentSections: [
      {
        heading: "상담 운영 시간",
        paragraphs: [
          "기업 상담은 평일 기준으로 운영되며, 접수 순서와 프로젝트 일정에 따라 순차적으로 회신드립니다.",
          "긴급 일정이 필요한 경우 문의서에 희망 납기와 배경을 함께 남겨주시면 우선 검토가 가능합니다.",
        ],
      },
      {
        heading: "회신 방식",
        paragraphs: [
          "전화, 이메일, 온라인 문의 등 남겨주신 채널을 기준으로 가장 빠른 방식으로 회신드립니다.",
          "프로젝트 성격상 추가 확인이 필요한 경우, 간단한 현장 정보 요청이 함께 진행될 수 있습니다.",
        ],
      },
    ],
  },
  {
    id: "notice-2026-large-project-support",
    title: "대형 프로젝트 전담 대응 프로세스 안내",
    excerpt:
      "대규모 행사, 공공기관 입찰, 대량 렌탈 프로젝트를 위한 전담 대응 흐름을 안내드립니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-03-18",
    category: "프로젝트지원",
    contentSections: [
      {
        heading: "전담 대응 범위",
        paragraphs: [
          "대량 설치, 복수 공간 운영, 짧은 구축 일정이 필요한 프로젝트는 별도 전담 대응 방식으로 검토합니다.",
          "초기 상담 단계에서 규모, 일정, 예산 우선순위를 함께 정리하면 제안 품질을 높일 수 있습니다.",
        ],
      },
      {
        heading: "진행 방식",
        paragraphs: [
          "프로젝트 일정표 기준으로 상담, 구성 제안, 설치 계획, 운영 지원 범위를 단계별로 협의합니다.",
          "필요 시 현장 사전 방문 또는 온라인 미팅을 통해 주요 이슈를 먼저 점검할 수 있습니다.",
        ],
      },
    ],
  },
  {
    id: "notice-2026-site-checklist",
    title: "현장 설치 전 체크리스트 제공 안내",
    excerpt:
      "현장 반입과 설치를 더욱 안정적으로 진행하기 위한 기본 체크리스트를 안내드립니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-03-15",
    category: "현장안내",
    contentSections: [
      {
        heading: "체크리스트 항목",
        paragraphs: [
          "반입 시간, 통제 구역, 보양 필요 구간, 전기 및 네트워크 사용 환경 등은 사전 확인을 권장드립니다.",
          "특수 공간이나 보안 구역이 포함된 현장은 입실 규정도 함께 공유해 주세요.",
        ],
      },
      {
        heading: "효율적인 준비 방법",
        paragraphs: [
          "공간 사진, 간단한 평면도, 좌석 수요를 함께 전달해주시면 초기 제안 속도가 빨라집니다.",
          "설치 완료 후 운영 중 필요한 추가 품목도 같은 흐름으로 이어서 대응 가능합니다.",
        ],
      },
    ],
  },
];

export const getNoticePlainText = (post: NoticePost) =>
  post.contentSections
    .flatMap((section) => [section.heading || "", ...section.paragraphs])
    .join(" ")
    .trim();
