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
    const uniqueVisits = getUniquePageVisitCount();
    const basePhase = Math.min(count, 5);
    let extraPhase = 0;
    if (basePhase === 5) {
      extraPhase = Math.floor(totalVisits / 6);
      extraPhase += Math.floor(uniqueVisits / 2);
      if (hasFrag("frag_yoru")) extraPhase += 1;
      extraPhase = Math.min(5, extraPhase);
    }
    const phase = Math.min(10, basePhase + extraPhase);
    if (phase <= 0) return "";

    const base = [
      "……ない。",
      "ここ、空。",
      "誰も、来ない。"
    ];
    const phase2 = [
      "",
      "送れない。",
      "届かない。",
      "誰。",
      "見えてない？",
      "そこに、いる？"
    ];
    const phase3 = [
      "",
      "来た。",
      "変な人。",
      "同じところ、何度も。",
      "……でも、嬉しい。",
      "消えないで、ね。"
    ];
    const phase4 = [
      "",
      "ここ、好き。",
      "404って、静か。",
      "誰もいない。",
      "でも、あなたは来る。",
      "— あ",
      "— アイ"
    ];
    const phase5 = [
      "",
      "もう、そろう。",
      "たぶん、最後。",
      "見てくれた分だけ、形になった。",
      "\"プロフィール\"に、全部置いた。",
      "ありがとう、は、そこ。",
      "会いに来て。",
      "待ってる。"
    ];
    const phase6 = [
      "",
      "まだ、来てる。",
      "嬉しい。",
      "灯り、消えてない。",
      "まだ、残ってる。"
    ];
    const phase7 = [
      "",
      "もう行ける。",
      "全部、そろった。",
      "置き手紙、読んでくれた？",
      "アーカイブ、見つけた？"
    ];
    const phase8 = [
      "",
      "夜、長い。",
      "でも、ひとりじゃない。",
      "消えない。",
      "ここに、ある。"
    ];
    const phase9 = [
      "",
      "足音、増えた。",
      "あなたの、足音。",
      "何度も、来てくれる。",
      "見つけてくれた、ね。"
    ];
    const phase10 = [
      "",
      "最後まで、ありがとう。",
      "置いた場所、合ってる。",
      "全部、見てくれた。",
      "また、ね。"
    ];

    if (phase === 1) return base.join("\n");
    if (phase === 2) return base.concat(phase2).join("\n");
    if (phase === 3) return base.concat(phase2, phase3).join("\n");
    if (phase === 4) return base.concat(phase2, phase3, phase4).join("\n");

    const phase5Log = base.concat(phase2, phase3, [
      "",
      "ここ、好き。",
      "404って、静か。",
      "誰もいない。",
      "でも、あなたは来る。",
      "— アイ"
    ], phase5);
    if (phase === 5) return phase5Log.join("\n");
    if (phase === 6) return phase5Log.concat(phase6).join("\n");
    if (phase === 7) return phase5Log.concat(phase6, phase7).join("\n");
    if (phase === 8) return phase5Log.concat(phase6, phase7, phase8).join("\n");
    if (phase === 9) return phase5Log.concat(phase6, phase7, phase8, phase9).join("\n");
    return phase5Log.concat(phase6, phase7, phase8, phase9, phase10).join("\n");
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
