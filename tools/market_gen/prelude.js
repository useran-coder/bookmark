/* 시장 동향 원본 페이지 — 매출분석도구에서 시장 화면에 필요한 것만 가져옴.
   매출 자료(CUR 등)는 없음 · 설정 저장은 이 PC(localStorage)에만 */
var MKP_LS='dbfMarketStateV1';
var CUR=[];
function dataYears(){ return []; }
function saveSettings(){ try{ localStorage.setItem(MKP_LS, JSON.stringify(state.market||{})); }catch(_e){} return Promise.resolve(); }
function runAct(){ if(window.MKP&&MKP.render)MKP.render(); }
window.__V718_RESTORED=true;   /* 매출분석도구의 «서버 설정 복원 끝» 신호 — 여기선 서버 설정이 없으니 바로 */
var MKP_FEED=(/\/sales\//.test(location.pathname)?'':'../sales/')+'market_feed.json';   /* 원본 자료: GitHub sales/market_feed.json(매일·매주 자동 갱신) */
/* 처음 열 때 갱신 묶음(v727~v1540)이 0.3~9초 간격으로 차례로 적용됨 → 순서는 그대로 두고 기다리는 시간만 1/40로 줄임(첫 3초만) */
var MKP_FAST=true;
(function(){ var st=window.setTimeout;
  window.setTimeout=function(f,d){ var a=Array.prototype.slice.call(arguments); if(MKP_FAST&&+d>=100)a[1]=Math.max(1,Math.round(+d/40)); return st.apply(window,a); };
  st(function(){ MKP_FAST=false; },3000); })();
