(() => {
  const STORAGE_KEY = "arg1_memory_v1";

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { frags: {}, visits: 0 };
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

  function getAi404LogText(){
    const count = countFrags();
    const phase = Math.min(count, 5);
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
      "“完成したページ”に、置いた。",
      "ありがとう、は、そこ。"
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
    return phase5Log.join("\n");
  }

  function softRedirectToIndexIfNeeded(requiredFrags){
    if (!requiredFrags || requiredFrags.length === 0) return true;
    for (const id of requiredFrags) {
      if (!hasFrag(id)) {
        location.replace("/arg1/index.html");
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
    getAi404LogText,
    softRedirectToIndexIfNeeded,
  };
})();
