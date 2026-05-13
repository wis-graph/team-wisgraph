# Wisgraph 배포 가이드

> 맥미니 + 도메인 연결 시나리오 기준. 정적 단일 HTML 사이트.

---

## 0. 전제

- 산출물: `index.html` + `assets/` 디렉토리 (총 ~150KB)
- 서버: 맥미니 (macOS), 공인 IP 또는 포트 포워딩 가능
- 도메인: 보유 (`wisgraph.kr` 등). DNS 관리 권한
- HTTPS 필수 (브라우저 신뢰 + Open Graph 미리보기)

---

## 1. 권장 스택: **Caddy**

### 이유

- 자동 HTTPS (Let's Encrypt 자동 발급/갱신, 별도 설정 없음)
- 설정 파일 단순 (`Caddyfile` 5줄)
- 정적 파일 서빙 빠름
- macOS Homebrew 1줄 설치

### 대안 비교

| 옵션 | 장점 | 단점 |
|---|---|---|
| **Caddy** ⭐ | 자동 HTTPS, 단순 | macOS 서비스 등록 약간 |
| Nginx | 표준, 자료 많음 | HTTPS 수동 (certbot 별도) |
| Cloudflare Tunnel | 포트 포워딩 불필요 | Cloudflare 종속 |
| Vercel/Netlify | 0설정 배포 | 맥미니 활용 안 함 |

---

## 2. Caddy 설치 + 실행

### 설치
```bash
brew install caddy
```

### Caddyfile 생성

프로젝트 디렉토리에 `Caddyfile` 추가:

```
wisgraph.kr, www.wisgraph.kr {
    root * /Users/saisiot/code_workshop/team-portfolio-2605
    file_server
    encode gzip zstd

    # Cache static assets
    @static {
        path *.svg *.css *.png *.jpg *.webp *.woff2
    }
    header @static Cache-Control "public, max-age=2592000, immutable"

    # HTML — short cache
    header /index.html Cache-Control "public, max-age=300"

    # Security headers
    header {
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "interest-cohort=()"
    }
}
```

### 실행 (포그라운드 테스트)
```bash
cd /Users/saisiot/code_workshop/team-portfolio-2605
caddy run
```

### macOS 서비스로 등록 (영구 실행)
```bash
brew services start caddy
```

설정 변경 후 reload:
```bash
brew services restart caddy
```

---

## 3. DNS 설정

도메인 등록업체(가비아/Cloudflare/AWS Route53 등)에서:

```
A     wisgraph.kr      → <맥미니 공인 IP>
A     www.wisgraph.kr  → <맥미니 공인 IP>
```

전파 5분~24시간. 확인:
```bash
dig wisgraph.kr +short
```

---

## 4. 포트 포워딩

### 가정 공유기 (대부분 시나리오)

공유기 관리 페이지 (보통 `192.168.0.1` 또는 `192.168.1.1`) 에서:

| 외부 포트 | 내부 IP | 내부 포트 | 프로토콜 |
|---|---|---|---|
| 80 | 맥미니 LAN IP | 80 | TCP |
| 443 | 맥미니 LAN IP | 443 | TCP |

맥미니 LAN IP 확인:
```bash
ipconfig getifaddr en0   # 유선
ipconfig getifaddr en1   # 무선
```

### macOS 방화벽
시스템 설정 > 네트워크 > 방화벽 — caddy 허용.

---

## 5. HTTPS 자동 발급 확인

Caddyfile에 `wisgraph.kr` 적으면 첫 요청시 Let's Encrypt에서 자동 발급.

로그 확인:
```bash
tail -f /opt/homebrew/var/log/caddy/access.log
# 또는
brew services log caddy
```

성공 로그 예:
```
certificate obtained successfully {"identifier": "wisgraph.kr"}
```

---

## 6. 콘텐츠 업데이트 절차

```bash
cd /Users/saisiot/code_workshop/team-portfolio-2605
git pull              # 또는 직접 편집
# Caddy reload 자동 — 파일만 바뀌면 즉시 반영 (HTML 캐시 5분 후)
```

캐시 즉시 무효화 필요시:
```bash
brew services restart caddy
```

---

## 7. 모니터링 (선택)

### 접속 로그
```bash
tail -f /opt/homebrew/var/log/caddy/access.log
```

### 헬스체크 cron (선택)
```bash
*/5 * * * * curl -fsSL https://wisgraph.kr > /dev/null || echo "wisgraph down" | mail -s "alert" admin@example.com
```

---

## 8. 보안 체크리스트

- [ ] HTTPS 자동 발급 확인 (https:// 접속 OK)
- [ ] http:// → https:// 자동 리디렉트 (Caddy 기본 동작)
- [ ] 80/443만 외부 노출, SSH(22)는 외부 차단 또는 키 인증 only
- [ ] 맥미니 시스템 업데이트 정기
- [ ] `.env`/credential 파일 사이트 디렉토리에 두지 말 것

---

## 9. 폼 처리

현재 `<form action="mailto:contact@wisgraph.kr">` — 사용자 메일 클라이언트 열림.

업그레이드 옵션:
- **Formspree**: 무료 50/월. `action="https://formspree.io/f/xxxx"` 변경
- **Web3Forms**: 무료 250/월. JS 비동기 제출
- **자체 API**: 맥미니에 Node.js Express 추가 → SMTP 발송

---

## 10. 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| HTTPS 발급 실패 | 80 포트 외부 미개방. Let's Encrypt가 HTTP-01 챌린지 사용 |
| DNS 미적용 | TTL 대기. `dig` 확인. 캐시 플러시 `sudo killall -HUP mDNSResponder` |
| 폰트 안 뜸 | CDN (Google Fonts, jsDelivr) 차단 환경. self-host로 전환 필요 |
| Caddy 권한 에러 | macOS 첫 실행시 80 포트 권한 — sudo로 1회 실행 후 brew services 등록 |
| 한글 깨짐 | `<meta charset="utf-8">` 확인 (이미 적용됨) |

---

## 11. 파일 트리

```
team-portfolio-2605/
├── index.html                  ← 메인 페이지 (단일 HTML)
├── Caddyfile                   ← Caddy 설정 (배포 후 생성)
├── DEPLOY.md                   ← 이 문서
├── brand-spec.md
├── assets/
│   ├── css/
│   │   └── tokens.css
│   └── logos/                  ← 16 SVG (8 기존 + 8 추가)
└── docs/
    ├── team_portfolio_integrated_content_design.md
    └── website_development_spec.md
```

---

## 12. 향후 옵션

- **CDN 앞단**: Cloudflare 무료 플랜 → DDoS 보호 + 글로벌 캐시
- **분석**: Plausible/Umami self-host (맥미니 같이) — Google Analytics 회피
- **PR/CI**: GitHub Actions → SSH 자동 배포 (`rsync` 또는 `git pull`)
- **백업**: 정기 `git push` to 원격 (GitHub private)
