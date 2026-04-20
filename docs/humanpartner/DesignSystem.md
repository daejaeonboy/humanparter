# Human Partner Design System Guideline

이 문서는 휴먼파트너 프로젝트의 일관된 시각적 경험을 위한 디자인 가이드라인입니다. 
사용자의 취향(얇은 폰트 선호, 단일 폰트 사용, 브랜드 컬러 중심)을 반영하여 정립되었습니다.

---

## 1. 타이포그래피 (Typography)

모든 텍스트는 **단일 폰트 패밀리**를 사용하며, **굵은 폰트(Bold) 사용을 지양**하고 정갈한 느낌을 유지합니다.

### 1.1 폰트 패밀리 (Font Family)
- **Pretendard**: 모든 플랫폼에서 가독성이 좋고 현대적인 Pretendard를 단일 폰트로 사용합니다.

### 1.2 폰트 두께 (Font Weight)
- **Regular (400)**: 일반 본문 텍스트, 설명글에 사용합니다.
- **Medium (500)**: 제목, 강조 텍스트, 버튼 등에 사용합니다. (700 이상의 Bold 체는 사용하지 않습니다.)

### 1.3 타이포 스케일 (Type Scale)
| 등급 | 크기 (Mobile / Desktop) | 용도 | 권장 두께 |
| :--- | :--- | :--- | :--- |
| **Display** | 40px / 72px | 메인 히어로 타이틀 | Medium (500) |
| **H1** | 30px / 42px | 섹션 메인 타이틀 | Medium (500) |
| **H2** | 22px / 30px | 서브 타이틀, 강조 문구 | Medium (500) |
| **Body** | 16px / 18px | 기본 본문 텍스트 | Regular (400) |
| **Caption** | 12px / 14px | 부가 정보, 메타 텍스트 | Regular (400) |

---

## 2. 컬러 시스템 (Color System)

브랜드 고유의 컬러인 **Navy**를 중심으로 정체성을 강조합니다.

### 2.1 브랜드 컬러 (Brand Color)
- **Primary (Navy)**: `#001E45`
  - 헤더, 주요 버튼, 브랜드 강조 텍스트, 아이콘 등에 사용합니다.

### 2.2 텍스트 컬러 (Text Color)
- **Primary Ink**: `Slate-900` (#0f172a) - 메인 제목 및 본문
- **Secondary Ink**: `Slate-600` (#475569) - 보조 설명글
- **Muted Ink**: `Slate-400` (#94a3b8) - 날짜, 비활성 텍스트

### 2.3 배경 및 면 컬러 (Surface Color)
- **Base**: `#FFFFFF` (기본 배경)
- **Soft**: `Slate-50` (#f8fafc) - 섹션 구분용 배경, 카드 배경
- **Accent**: `Brand-50` (#f0f5fa) - 브랜드 컬러의 아주 연한 버전

---

## 3. 디자인 원칙 (Design Principles)

1. **Simplicity**: 복잡한 장식이나 그림자보다는 여백(Padding)과 정렬을 통해 정보를 전달합니다.
2. **Consistency**: 모든 페이지에서 동일한 여백 시스템(`py-16`, `py-24`)과 폰트 규칙을 준수합니다.
3. **Brand-First**: 핵심 동작(CTA)이나 브랜드 요소를 강조할 때는 항상 `#001E45` 컬러를 최우선으로 고려합니다.
4. **Thin & Clean**: 굵은 선이나 두꺼운 폰트 대신, 적절한 크기 조절과 컬러 대비를 통해 위계를 잡습니다.
