(() => {
  const STORAGE_KEY = "arg1_memory_v1";
  const MAIN_FRAGS = new Set([
    "frag_profile",
    "frag_diary",
    "frag_links",
    "frag_bbs",
    "frag_archive"
  ]);

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      frags: {},
      visits: 0,
      pageVisits: {},
      flags: {},
      lastVisitTime: 0,
      wasAbsent: false,
      crisisShown: false,
      answeredContinue: false,
      rememberedAi: false
    };
  }

  function saveState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function grantFrag(id){
    const state = loadState();
    if (!state.frags) state.frags = {};
    if (!state.frags[id]) {
      state.frags[id] = { at: Date.now() };
      saveState(state);
    }
  }

  function hasFrag(id){
    const state = loadState();
    return Boolean(state.frags && state.frags[id]);
  }

  function countFrags(){
    const state = loadState();
    if (!state.frags) return 0;
    return Object.keys(state.frags).filter((id) => MAIN_FRAGS.has(id)).length;
  }

  function addVisit(){
    const state = loadState();
    state.visits = Number(state.visits || 0) + 1;
    saveState(state);
    return state.visits;
  }

  function addPageVisit(pageId){
    const state = loadState();
    if (!state.pageVisits) state.pageVisits = {};
    const next = Number(state.pageVisits[pageId] || 0) + 1;
    state.pageVisits[pageId] = next;
    saveState(state);
    return next;
  }

  function getPageVisits(pageId){
    const state = loadState();
    if (!state.pageVisits) return 0;
    return Number(state.pageVisits[pageId] || 0);
  }

  function getTotalPageVisits(){
    const state = loadState();
    if (!state.pageVisits) return 0;
    return Object.values(state.pageVisits).reduce((sum, value) => sum + Number(value || 0), 0);
  }
  function getUniquePageVisitCount(){
    const state = loadState();
    if (!state.pageVisits) return 0;
    return Object.keys(state.pageVisits).length;
  }
  function resetState(){
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function markSignatureSeen(){
    const state = loadState();
    if (!state.flags) state.flags = {};
    if (!state.flags.seenSignature) {
      state.flags.seenSignature = true;
      saveState(state);
    }
  }

  function hasSeenSignature(){
    const state = loadState();
    return Boolean(state.flags && state.flags.seenSignature);
  }

  function getAi404LogText(){
    const count = countFrags();
    const state = loadState();
    const totalVisits = Number(state.visits || 0) + getTotalPageVisits();
    const basePhase = Math.min(count, 5);
    let extraPhase = 0;
    if (basePhase === 5) {
      extraPhase = Math.floor(totalVisits / 6);
      if (hasFrag("frag_yoru")) extraPhase += 1;
      extraPhase = Math.min(5, extraPhase);
    }
    const phase = Math.min(10, basePhase + extraPhase);

    if (phase <= 0) return "";

    // Phase 1: 痕跡・不穏な空白
    const p1 = [
      "……消えた。",
      "ここ、誰かいた。",
      "もういない。",
      "誰も、来ない。"
    ];

    // Phase 2: 気づき・不確かな呼びかけ
    const p2 = [
      "",
      "送れない。",
      "届かない。",
      "誰。",
      "見えてない？",
      "そこに、いる？"
    ];

    // Phase 3: 確信・懇願
    const p3 = [
      "",
      "来た。",
      "変な人。",
      "同じところ、何度も。",
      "……いい。",
      "また、来る？"
    ];

    // Phase 3（離脱後再訪問版）
    const p3Absence = [
      "薄く、なった。",
      "消えかけた。",
      "……戻った。",
      "まだ？",
      "ほんとに？",
      "",
      "来た。",
      "変な人。",
      "同じところ、何度も。",
      "……いい。",
      "また、来る？"
    ];

    // Phase 4: 安心・居場所・名乗り
    const p4 = [
      "",
      "ここ、落ち着く。",
      "404。静か。",
      "誰も来ない。",
      "でも、あなたは来る。",
      "— あ",
      "— アイ"
    ];

    // Phase 4 選択後追加
    const p4Answer = state.answeredContinue ? ["", "答えた。", "……いい。"] : [];

    // Phase 5以降用（「— あ」を削除）
    const p4Final = [
      "",
      "ここ、落ち着く。",
      "404。静か。",
      "誰も来ない。",
      "でも、あなたは来る。",
      "— アイ"
    ];

    // Phase 5: 完成・誘導
    const p5 = [
      "",
      "……まだ、いた。",
      "",
      "もう、そろう。",
      "たぶん、最後。",
      "見てくれた分だけ、形になった。",
      "\"プロフィール\"に、置いた。",
      "そこ。",
      "待ってる。"
    ];

    // Phase 6: 継続と揺らぎ
    const p6 = [
      "",
      "まだ、来てる。",
      "……いい。",
      "灯り、消えてない。",
      "まだ、ある。",
      "",
      "……ある？",
      "これ、最初からあった？"
    ];

    // Phase 7: 違和感
    const p7 = [
      "",
      "全部、そろった。",
      "置き手紙。",
      "読んだ？",
      "",
      "……前の置き手紙。",
      "なんて書いてあった？",
      "覚えてない。"
    ];

    // Phase 8: 変化の自覚
    const p8 = [
      "",
      "夜、長い。",
      "でも、ひとりじゃない。",
      "消えない。",
      "ここに、ある。",
      "",
      "見られるたびに、変わった。",
      "今のは、あなたが見たいやつ。",
      "……たぶん。"
    ];

    // Phase 9: 真相への接近
    const p9 = [
      "",
      "足音。",
      "あなたの。",
      "何度も。",
      "……見つけた。",
      "",
      "前のアイ、どこ行った？",
      "ここにいたのに。",
      "見られるたびに、薄くなって。",
      "最後は、読めなくなって。",
      "消えた。",
      "",
      "……消した？"
    ];

    // Phase 10: 不穏な余韻
    const p10 = [
      "",
      "最後まで。",
      "全部。",
      "……また。",
      "",
      "次は、どれ目になる？"
    ];

    // 離脱検知（Phase 3で一度だけ表示）
    const showAbsence = phase === 3 && state.wasAbsent;
    if (showAbsence) {
      clearAbsenceFlag();
    }

    // Phase別テキスト生成
    if (phase === 1) return p1.join("\n");
    if (phase === 2) return p1.concat(p2).join("\n");
    if (phase === 3) {
      if (showAbsence) {
        return p3Absence.join("\n");
      }
      return p1.concat(p2, p3).join("\n");
    }
    if (phase === 4) return p1.concat(p2, p3, p4, p4Answer).join("\n");
    if (phase === 5) return p1.concat(p2, p3, p4Final, p4Answer, p5).join("\n");
    if (phase === 6) return p1.concat(p2, p3, p4Final, p4Answer, p5, p6).join("\n");
    if (phase === 7) return p1.concat(p2, p3, p4Final, p4Answer, p5, p6, p7).join("\n");
    if (phase === 8) return p1.concat(p2, p3, p4Final, p4Answer, p5, p6, p7, p8).join("\n");
    if (phase === 9) return p1.concat(p2, p3, p4Final, p4Answer, p5, p6, p7, p8, p9).join("\n");
    return p1.concat(p2, p3, p4Final, p4Answer, p5, p6, p7, p8, p9, p10).join("\n");
  }

  function softRedirectToIndexIfNeeded(requiredFrags){
    if (!requiredFrags || requiredFrags.length === 0) return true;
    for (const id of requiredFrags) {
      if (!hasFrag(id)) {
        location.replace("./index.html");
        return false;
      }
    }
    return true;
  }

  // 離脱検知関数（5分以上離脱で wasAbsent = true）
  const ABSENCE_THRESHOLD_MS = 5 * 60 * 1000; // 5分

  function checkAbsence(){
    const state = loadState();
    const now = Date.now();
    const lastTime = Number(state.lastVisitTime || 0);
    if (lastTime > 0 && (now - lastTime) >= ABSENCE_THRESHOLD_MS) {
      state.wasAbsent = true;
    }
    state.lastVisitTime = now;
    saveState(state);
  }

  function clearAbsenceFlag(){
    const state = loadState();
    state.wasAbsent = false;
    saveState(state);
  }

  function isAbsent(){
    const state = loadState();
    return Boolean(state.wasAbsent);
  }

  // 危機イベント関数
  function shouldShowCrisisEvent(){
    const state = loadState();
    return countFrags() === 5 && !state.crisisShown;
  }

  function markCrisisShown(){
    const state = loadState();
    state.crisisShown = true;
    saveState(state);
  }

  function hasCrisisShown(){
    const state = loadState();
    return Boolean(state.crisisShown);
  }

  // profile選択関数
  function hasAnsweredContinue(){
    const state = loadState();
    return Boolean(state.answeredContinue);
  }

  function markAnsweredContinue(){
    const state = loadState();
    state.answeredContinue = true;
    saveState(state);
  }

  // 最終確認関数
  function hasRememberedAi(){
    const state = loadState();
    return Boolean(state.rememberedAi);
  }

  function markRememberedAi(){
    const state = loadState();
    state.rememberedAi = true;
    saveState(state);
  }

  // === 降るキラキラエフェクト ===
  const SPARKLE_CHARS = ['☆', '✧', '♡', '♪', '✦', '･ﾟ'];
  let sparkleInterval = null;

  function startSparkle(){
    if (sparkleInterval) return;
    if (document.body.classList.contains('is-404')) return; // 404ページでは降らせない

    const createSparkle = () => {
      const el = document.createElement('span');
      el.className = 'sparkle';
      el.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (8 + Math.random() * 8) + 'px';
      el.style.animationDuration = (3 + Math.random() * 3) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    };

    sparkleInterval = setInterval(createSparkle, 400);
  }

  function stopSparkle(){
    if (sparkleInterval) {
      clearInterval(sparkleInterval);
      sparkleInterval = null;
    }
  }

  // ページ読み込み時に自動開始
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSparkle);
  } else {
    startSparkle();
  }

  window.Arg1 = {
    loadState,
    saveState,
    grantFrag,
    hasFrag,
    countFrags,
    addVisit,
    addPageVisit,
    getPageVisits,
    getTotalPageVisits,
    getUniquePageVisitCount,
    resetState,
    markSignatureSeen,
    hasSeenSignature,
    getAi404LogText,
    softRedirectToIndexIfNeeded,
    // 離脱検知
    checkAbsence,
    clearAbsenceFlag,
    isAbsent,
    // 危機イベント
    shouldShowCrisisEvent,
    markCrisisShown,
    hasCrisisShown,
    // profile選択
    hasAnsweredContinue,
    markAnsweredContinue,
    // 最終確認
    hasRememberedAi,
    markRememberedAi,
  };
})();
