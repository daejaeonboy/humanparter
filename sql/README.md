# SQL Files

이 폴더에는 Human Partner 프로젝트에서 사용하는 Supabase SQL 스크립트를 모아둡니다.

## 사용 방법

- Supabase SQL Editor에서 필요한 파일 내용을 열어 1회 실행합니다.
- 관리자 화면 경고 문구에 표시되는 파일 경로도 이 폴더 기준으로 맞춰져 있습니다.

## 자주 쓰는 파일

- `create_page_contents_table.sql`: 페이지 콘텐츠 저장용 테이블 생성
- `create_notice_posts_table.sql`: 정보센터 공지 테이블 생성
- `create_faqs_table.sql`: FAQ 테이블 생성
- `create_inquiries_table.sql`: 견적 문의 테이블 생성
- `create_quote_notification_recipients_table.sql`: 견적 알림 수신자 테이블 생성
- `add_public_query_indexes.sql`: 공개 조회 성능 최적화용 인덱스 추가
- `create_reorder_products_display_order_rpc.sql`: 상품 정렬 저장용 RPC 생성
