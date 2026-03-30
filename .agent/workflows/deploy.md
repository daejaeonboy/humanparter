---
description: 홈페이지 수동 배포 방법
---

# 수동 배포 규칙

**중요: GitHub Actions를 통한 Firebase 자동 배포는 사용하지 않습니다.**

수정이 완료되면 아래 단계를 수동으로 실행합니다:

## 배포 단계

// turbo
1. 빌드 실행
```bash
npm run build
```

2. 필요 시 Firebase Hosting 수동 배포
```bash
firebase deploy --only hosting
```

## 배포 URL
- Firebase 프로젝트: `humanpartner-77b4c`
- Hosting 사이트: https://humanpartner-ent.web.app

## 주의사항
- 빌드 에러가 없는지 확인
- 배포 후 사이트 접속 확인
- GitHub Actions 기반 Firebase 자동 배포는 비활성화 상태를 유지
