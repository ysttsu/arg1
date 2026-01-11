(() => {
  const STORAGE_KEY = "arg1_memory_v1";

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { frags: {}, visits: 0, pageVisits: {} };
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
    return state.frags ? Object.keys(state.frags).length : 0;
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
  function resetState(){
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function getAi404LogText(){
    const count = countFrags();
    const state = loadState();
    const totalVisits = Number(state.visits || 0) + getTotalPageVisits();
    const basePhase = Math.min(count, 5);
    let extraPhase = basePhase === 5 ? Math.floor(totalVisits / 6) : 0;
    if (hasFrag("frag_yoru")) extraPhase += 1;
    extraPhase = Math.min(5, extraPhase);
    const phase = Math.min(10, basePhase + extraPhase);
    if (phase <= 0) return "";

    const base = [
      "……ない。",
      "ここ、空。"
    ];
    const phase2 = [
      "",
      "送れない。",
      "だれ。",
      "まだ、見えてない？"
    ];
    const phase3 = [
      "",
      "来るんだ。",
      "変な人。",
      "……でも、嬉しい。"
    ];
    const phase4 = [
      "",
      "ここ、好き。",
      "404って、静か。",
      "— あ",
      "— アイ"
    ];
    const phase5 = [
      "",
      "もう、そろう。",
      "たぶん、最後。",
      "“プロフィール”に、置いた。",
      "ありがとう、は、そこ。"
    ];
    const phase6 = [
      "",
      "まだ、少し。",
      "灯り、残ってる。"
    ];
    const phase7 = [
      "",
      "もう行ける。",
      "置き手紙、待ってる。"
    ];
    const phase8 = [
      "",
      "夜、長い。",
      "でも、消えない。"
    ];
    const phase9 = [
      "",
      "足音、増えた。",
      "ここ、ちゃんとある。"
    ];
    const phase10 = [
      "",
      "最後まで、見て。",
      "置いた場所、そこで合ってる。"
    ];

    if (phase === 1) return base.join("\n");
    if (phase === 2) return base.concat(phase2).join("\n");
    if (phase === 3) return base.concat(phase2, phase3).join("\n");
    if (phase === 4) return base.concat(phase2, phase3, phase4).join("\n");

    const phase5Log = base.concat(phase2, phase3, [
      "",
      "ここ、好き。",
      "404って、静か。",
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
    resetState,
    getAi404LogText,
    softRedirectToIndexIfNeeded,
  };
})();
