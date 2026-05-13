# Team Portfolio · Brand Spec

> 수집일: 2026-05-13
> 자산 소스: docs/ + Wikimedia Commons
> 자산 완정도: 부분 (8/14 로고 SVG 확보)

## 🎯 핵심 자산

### Logo (팀 자체 로고)

- 상태: **없음** (팀 자체 브랜드 미정)
- 대체: 텍스트 워드마크 — `team.` 또는 풀 영문명
- 후속 결정 사항으로 분류

### Client Logos (클라이언트)

| 클라이언트 | 파일 | 상태 |
|---|---|---|
| LG U+ | `assets/logos/lg-uplus.svg` | ✓ SVG (1.7KB) |
| SKT | `assets/logos/skt.svg` | ✓ SVG (102KB) |
| SK On | `assets/logos/sk.svg` | △ SK Group 로고로 대체 |
| 현대차 | `assets/logos/hyundai.svg` | ✓ SVG (4.7KB) |
| LH | `assets/logos/lh.svg` | ✓ SVG (2.9KB) |
| 국민은행 | `assets/logos/kb.svg` | ✓ SVG (4.8KB) |
| 병무청 | `assets/logos/mma.svg` | ✓ SVG (5.2KB) |
| NRC | `assets/logos/nrc.svg` | ✓ SVG (2.4KB) |
| 국민건강보험공단 | — | ✗ 텍스트 |
| SGI서울보증 | — | ✗ 텍스트 |
| 마켓컬리 | — | ✗ 텍스트 |
| 멀티캠퍼스 | — | ✗ 텍스트 |
| 제주특별자치도개발공사 | — | ✗ 텍스트 |
| 동그라미재단 AI Academy | — | ✗ 텍스트 |

**처리 원칙**: SVG 확보 8개 + 텍스트 워드마크 6개를 동일 그리드에 배치. 모두 모노톤(흰색/회색) 통일. CSS `filter: grayscale(1) brightness(0) invert(1)` 또는 SVG fill 직접 변경.

## 🎨 색 토큰 (spec §7 source-of-truth)

| 변수 | HEX | 용도 |
|---|---|---|
| `--bg` | `#05070A` | 메인 배경 (Near Black) |
| `--bg-secondary` | `#0B1020` | 보조 배경 (Deep Navy) |
| `--surface` | `#171B26` | 카드 표면 (Graphite) |
| `--text-primary` | `#E8EDF2` | 본문 텍스트 (Off White) |
| `--text-secondary` | `#8B95A1` | 보조 텍스트 (Cool Gray) |
| `--accent-primary` | `#3B82F6` | 강조 (Electric Blue) |
| `--accent-secondary` | `#20C997` | 보조 강조 (Muted Cyan) |
| `--border` | `#293241` | 보더 (Slate Gray) |

**사용 원칙**:
- 강조색은 1~2개만, 컬러풀 아이콘 금지
- 카드는 얇은 border, 그림자보다 대비로 경계 해결

## 🔤 타입

- 영문: Inter (Google Fonts) — 권위/엔터프라이즈
- 한글: Pretendard — 한국 B2B 표준
- Mono (다이어그램 레이블): JetBrains Mono fallback

## ✨ 시그니처 디테일 (120% 정밀도 항목)

- **시스템 아키텍처 다이어그램**: SVG. 5레이어, 얇은 라인, Ontology+Agent 노드 강조
- **Method 6단계**: 타임라인 진행 모션, 스크롤 reveal
- **로고 그리드**: 모노톤 통일, 동일 박스, 6열

## 🚫 금지 영역 (spec §13)

- 귀여운 캐릭터, AI 로봇 이미지, 클립아트 아이콘
- 과한 그라디언트, 보라색 SaaS 톤
- 컬러풀한 SaaS 일러스트
- 말랑한 둥근 버튼
- 가벼운 마이크로 모션 반복
- 이모지 아이콘
- "공식 파트너", "Trusted by" 단독 문구

## 🎭 기질 키워드

Dark · Technical · Architectural · Enterprise · Precise · Structured · Operational
