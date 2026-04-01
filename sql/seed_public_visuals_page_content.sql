insert into public.page_contents (page_key, content, is_active, updated_at)
values (
  'public-visuals',
  '{
    "productDefaults": {
      "all": {
        "description": "휴먼파트너의 전체 렌탈 품목을 한눈에 확인해보세요.",
        "imageUrl": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
      }
    },
    "collectionHeroes": {
      "cs": {
        "faq": {
          "title": "FAQ",
          "description": "자주 묻는 질문과 상담 채널을 한 번에 확인하고 필요한 안내를 빠르게 찾아보세요.",
          "imageUrl": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80"
        },
        "asGuide": {
          "title": "A/S 안내",
          "description": "접수 방법부터 처리 절차, 방문 지원 범위까지 운영 중 필요한 유지관리 안내를 확인해보세요.",
          "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
        }
      },
      "notice": {
        "all": {
          "title": "정보센터",
          "description": "휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요.",
          "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
        },
        "news": {
          "title": "공지사항",
          "description": "운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 한 번에 확인할 수 있습니다.",
          "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
        },
        "resources": {
          "title": "자료실",
          "description": "설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 빠르게 찾아볼 수 있습니다.",
          "imageUrl": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80"
        }
      },
      "cases": {
        "all": {
          "title": "설치 사례",
          "description": "기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요.",
          "imageUrl": "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80"
        },
        "temporaryOffice": {
          "title": "임시사무실",
          "description": "단기 프로젝트와 임시 업무공간에 맞춘 렌탈 구성 사례를 빠르게 비교해보세요.",
          "imageUrl": "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80"
        },
        "publicInstitution": {
          "title": "공공기관",
          "description": "공공기관과 교육 현장 중심의 설치 사례를 통해 실제 운영 구성을 확인할 수 있습니다.",
          "imageUrl": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80"
        }
      }
    },
    "megaMenuPreviews": {
      "company": {
        "imageUrl": "/company/abouthuman.png"
      },
      "products": {
        "imageUrl": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
      },
      "cases": {
        "imageUrl": "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80"
      },
      "notice": {
        "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
      },
      "cs": {
        "imageUrl": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80"
      }
    }
  }'::jsonb,
  true,
  now()
)
on conflict (page_key)
do update set
  content = excluded.content,
  is_active = excluded.is_active,
  updated_at = now();
