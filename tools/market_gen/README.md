# 시장 동향 원본 페이지(market.html) 처음 만든 방법 (2026-11-23)

- market.html = 매출분석도구(sales/index.html v1707)에서 시장 화면 묶음 18개(gen.js IDS) + 공통 함수(state·esc·won) + 모든 style 만 뽑아 만든 페이지
- 앞으로 시장 화면 수정은 **market.html 을 직접** 고침(이 생성기를 다시 돌리면 덮어씀)
- 자료: ../sales/market_feed.json (매일·매주 자동 갱신) → v1540 묶음이 적용 · 이 PC localStorage dbfMarketStateV1 에 저장
- 로그인: 매출분석도구(IndexedDB dbpastec_sales/kv/auth_v1) 또는 홈페이지(sessionStorage dbfHomeAu_v1) 로그인을 그대로 씀, 없으면 로그인 창
- 다시 만들 때: npm i acorn acorn-walk eslint-scope@8 → node gen.js ../../market.html
