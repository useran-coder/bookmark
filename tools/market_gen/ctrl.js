(function(){
  'use strict';
  var H=document.documentElement, OK={'market-con':1,'market-fd':1,'market-steel':1};
  var inFrame=false; try{ inFrame=window.self!==window.top; }catch(_e){ inFrame=true; }
  if(inFrame)H.classList.add('inframe');
  if(/[?&]in=sales/.test(location.search))H.classList.add('insales');
  function pick(){ var m=/[?&#]act=(market-[a-z]+)/.exec(location.search+location.hash)||/^#(market-[a-z]+)$/.exec(location.hash); return (m&&OK[m[1]])?m[1]:'market-fd'; }
  var cur=pick(), shown=false;
  function post(m){ try{ if(inFrame)window.parent.postMessage(m, location.origin); }catch(_e){} }
  function tabs(){ document.querySelectorAll('#mkpTabs [data-mkt]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-mkt')===cur); }); }
  function render(){
    if(H.classList.contains('gate'))return;
    if(!OK[state.act])state.act=cur;
    cur=state.act; tabs();
    try{
      if(cur==='market-con')marketConstruction(); else if(cur==='market-steel')marketSteel(); else marketFiredoor();
    }catch(e){ try{ console.error('mkp',e); }catch(_){} }
    if(!shown){ shown=true; post({type:'mkReady',act:cur}); }
  }
  function show(a){ if(!OK[a])return; cur=a; state.act=a; render(); try{ window.scrollTo(0,0); }catch(_e){} if(!inFrame){ try{ history.replaceState(null,'','#'+a); }catch(_e){} } }
  window.MKP={render:render, show:show};
  /* 매출분석도구 안(iframe)에서는 높이를 알려 바깥 페이지가 스크롤하게 함 */
  if(inFrame&&H.classList.contains('insales')){ var lastH=0; function sendH(){ var h=Math.ceil(document.querySelector('.wrap.mkp').getBoundingClientRect().height); if(Math.abs(h-lastH)>2){ lastH=h; post({type:'mkH',h:h}); } }
    try{ new ResizeObserver(sendH).observe(document.querySelector('.wrap.mkp')); }catch(_e){ setInterval(sendH,500); } }
  window.addEventListener('message',function(ev){ if(ev.origin!==location.origin)return; var d=ev.data||{}; if(d.type==='mkAct'&&OK[d.act])show(d.act); });
  document.getElementById('mkpTabs').addEventListener('click',function(ev){ var b=ev.target.closest&&ev.target.closest('[data-mkt]'); if(b)show(b.getAttribute('data-mkt')); });
  window.addEventListener('hashchange',function(){ var a=pick(); if(a!==cur)show(a); });
  /* 화면 안 링크 등으로 시장 화면이 아닌 곳으로 바뀌면 되돌림 */
  setInterval(function(){ if(!OK[state.act]&&!H.classList.contains('gate'))show(cur); },800);

  /* ── 로그인 : 매출분석도구(IndexedDB auth_v1)·홈페이지(sessionStorage dbfHomeAu_v1) 로그인을 그대로 씀 ── */
  var AU_URL_DEFAULT='https://script.google.com/macros/s/AKfycbxSlND4ZKOpxISNQMRdV2d-LA5YxXS1BDe0k2TXKq6g7Tfm6PZ1Rse3mp0Nm4ndZXZdiQ/exec';
  var AU_KEY='dbang2026!', SS_KEY='dbfHomeAu_v1';
  function auUrl(){ try{ var v=String(localStorage.getItem('au_url_override_v745')||'').trim(); if(/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec/.test(v)&&v.indexOf('AKfycbyEjIY0')<0)return v; }catch(_e){} return AU_URL_DEFAULT; }
  function valid(a){ return !!(a&&a.token&&a.exp&&Date.now()<a.exp); }
  function readSales(){ return new Promise(function(res){ try{ var created=false, rq=indexedDB.open('dbpastec_sales');
    rq.onupgradeneeded=function(){ created=true; try{ rq.transaction.abort(); }catch(_e){} };
    rq.onerror=function(){ res(null); };
    rq.onsuccess=function(){ var db=rq.result; if(created||!db.objectStoreNames.contains('kv')){ db.close(); return res(null); }
      try{ var g=db.transaction('kv','readonly').objectStore('kv').get('auth_v1'); g.onsuccess=function(){ db.close(); res(g.result||null); }; g.onerror=function(){ db.close(); res(null); }; }catch(_e){ db.close(); res(null); } };
  }catch(_e){ res(null); } }); }
  function getOwn(){ try{ return JSON.parse(sessionStorage.getItem(SS_KEY)||'null'); }catch(_e){ return null; } }
  function call(p){ p.key=AU_KEY; var ctl=window.AbortController?new AbortController():null, t=ctl?setTimeout(function(){ ctl.abort(); },25000):null;
    return fetch(auUrl(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p),signal:ctl?ctl.signal:undefined})
      .then(function(r){ return r.text(); }).then(function(tx){ if(t)clearTimeout(t); var d; try{ d=JSON.parse(tx); }catch(_e){ throw new Error('서버 응답을 읽지 못함'); } if(d&&d.error)throw new Error(String(d.error)); return d; },
        function(e){ if(t)clearTimeout(t); throw new Error(e&&e.name==='AbortError'?'서버 응답 없음(25초)':'서버 연결 실패'); }); }
  function gate(msg){ H.classList.add('gate'); document.getElementById('mkpMsg').textContent=msg||''; post({type:'mkGate'}); setTimeout(function(){ var i=document.getElementById('mkpId'); if(i&&!inFrame)i.focus(); },50); }
  function open(){ H.classList.remove('gate'); render(); }
  /* 최신 자료(market_feed.json)가 반영된 뒤 처음 그림 — 이 PC에 받아 둔 게 있으면 바로, 없으면 최대 4초 */
  function whenData(fn){ var t0=Date.now(); (function w(){ if((state.market&&state.market.contentFeedV1540)||Date.now()-t0>4000)return fn(); setTimeout(w,40); })(); }
  document.getElementById('mkpGate').addEventListener('submit',function(ev){ ev.preventDefault();
    var id=document.getElementById('mkpId').value.trim(), pw=document.getElementById('mkpPw').value, b=document.getElementById('mkpBtn'); if(!id||!pw)return;
    b.disabled=true; b.textContent='확인 중…'; document.getElementById('mkpMsg').textContent='';
    call({action:'auLogin',id:id,pw:pw}).then(function(d){ if(!d||!d.token||!d.user)throw new Error('로그인 실패');
      var a={token:d.token,id:d.user.id,name:d.user.name,role:d.user.role,exp:d.exp,src:'own'}; try{ sessionStorage.setItem(SS_KEY,JSON.stringify(a)); }catch(_e){} open();
    }).catch(function(e){ document.getElementById('mkpMsg').textContent=e.message; }).then(function(){ b.disabled=false; b.textContent='로그인'; });
  });
  /* 저장된 로그인이 유효하면 바로 보여주고, 서버 확인은 뒤에서 — 거절되면 로그인 화면 */
  var own=getOwn();
  (valid(own)?Promise.resolve(own):readSales()).then(function(a){
    if(!valid(a))return gate('');
    state.act=cur; whenData(open);
    call({action:'auMe',token:a.token}).then(function(d){ if(!d||!d.user)throw new Error('로그인 만료'); })
      .catch(function(e){ if(/토큰|로그인|만료|권한|token|auth/i.test(e.message)){ try{ sessionStorage.removeItem(SS_KEY); }catch(_e){} gate('로그인이 만료됨 · 다시 로그인'); } });
  });
})();
