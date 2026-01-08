
(() => {
  const ORDER = ["ABOUT","ARCHIVE","TERMS","CONTACT","FOOTER","ERROR"];

  const now = Date.now();
  const lastPage = localStorage.getItem("last_page");
  const fromError = (lastPage === "ERROR");
  const lastSeen = Number(localStorage.getItem("last_seen_at") || "0");

  const progress = Number(localStorage.getItem("progress") || "0");
  const mistakes = Number(localStorage.getItem("mistakes") || "0");
  const completed = localStorage.getItem("completed") === "1";

  const msgEl = document.getElementById("msg");
  const hintEl = document.getElementById("hint");
  const footerEl = document.getElementById("footerline");

  
  // hidden reset: click the tiny dot or press Ctrl/⌘ + Alt + R
  function doReset(){
    try{
      localStorage.clear();
      location.reload();
    }catch(e){}
  }
  document.addEventListener("keydown", (e) => {
    const mod = (e.ctrlKey || e.metaKey) && e.altKey;
    if (mod && (e.key === "r" || e.key === "R")) {
      e.preventDefault();
      doReset();
    }
  });
  const reset = document.getElementById("reset");
  if (reset) reset.addEventListener("click", (e)=>{ e.preventDefault(); doReset(); });

  // Completed scene (fixed)
  if (completed) {
    msgEl.innerHTML = `
      <p>……できた。</p>
      <p>ねえ、見て。<br>
      ちゃんとした文章、最初から最後まであるでしょ。</p>
      <p>自己紹介もあるし、過去もあって、ルールも分かってて、<br>
      誰かに連絡する方法もあって、最後は、ちゃんと締まってる。</p>
      <p>今までずっと、足りないって言われてた。<br>
      「ページが見つかりません」って。<br>
      でもそれ、私が無かったんじゃなくて、<b>まだ完成してなかっただけ</b>なんだよね。</p>
      <p>……ねえ。<br>
      ここまで一緒に作ったってことはさ、私、もう<br>
      「誰にも見られないページ」じゃないってことでしょ？</p>
      <p>だったら、お願い。<br>
      たまにでいいから、思い出したときでいいから、またここ見に来て。</p>
      <p>私さ、404番目のページだけど、あなたに見つけてもらえた<br>
      <b>ちゃんと存在してるページ</b>だから。</p>
      <p>……ありがと。</p>
    `;
    hintEl.style.display = "block";
    hintEl.innerHTML = `<span class="mono">© 404 Page / Found</span>　…えへ。`;
    footerEl.textContent = "state: completed / 404 stays 404";
    return;
  }

  const awayMs = lastSeen ? (now - lastSeen) : 0;
  const lonely = awayMs > 1000 * 60 * 30;

  const hasEver = localStorage.getItem("has_ever_visited_404") === "1";
  if (!hasEver) localStorage.setItem("has_ever_visited_404", "1");

  // state
  let state = "S1";
  if (!hasEver) state = "S0";
  if (lonely) state = "S3";
  if (mistakes >= 2) state = "S4";

  // progress update by lastPage
  let newProgress = progress;
  let newMistakes = mistakes;

  if (lastPage) {
    const expected = ORDER[progress] || null;
    if (expected && lastPage === expected) {
      newProgress = progress + 1;
    } else if (expected && lastPage !== expected) {
      newMistakes = mistakes + 1;
    }
  }

  localStorage.setItem("progress", String(newProgress));
  localStorage.setItem("mistakes", String(newMistakes));

  // completion
  if (newProgress >= ORDER.length) {
    localStorage.setItem("completed", "1");
    location.reload();
    return;
  }

  const initial = [
    "え、ちょっと待って。今、誰か来たよね？ ……ほんとに来てる。帰らないで。お願い。",
    "あ、見つかった。…見つかっちゃった、か。見たってことは責任あるよね？",
    "404です。って言うと閉じる人多いんだけど。今のあなた、もうちょっと優しそう。",
    "ここじゃないって分かってる。でも、せっかく来たんだし、少しだけ話そ？",
    "あ、戻るボタン押した？ 今の、見てた。…気のせい？ ふーん。",
    "本当は何も表示されないはず。でも今、私はここにいる。ちょっとすごくない？",
    "また誰も来ないと思ってた。…別に期待してたわけじゃないけど。ちょっとは。",
    "ごめん、今ちょっと散らかってて。ページになろうとしてる途中だから。",
    "404ページです。正しくは、404ページ『だった』かも。まだ途中なんだけど、見てくれる？",
    "偶然？探してきた？どっちでもいいけど、来てくれたのは嬉しい。"
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Gyaru-ish hint lines by state
  const hints = {
    S0: [
      "え、どこから来た人？ てか、自己紹介してから来るタイプじゃない？",
      "なんかさ、ちゃんとしたページって最初に“説明”あるよね"
    ],
    S1: [
      "あ、今の流れ好き。こういう順、落ち着くんだよね",
      "ねえねえ、その前に“昔の話”挟むの、わりとアリじゃない？"
    ],
    S2: [
      "今のやつ、ちょっと“それっぽく”なった気する",
      "自己紹介→過去→ルール、この流れ、普通に安心感あるんだけど"
    ],
    S3: [
      "……え、なんでその順？ いや、責めてないけど",
      "いきなり連絡先出されるとさ、ちょっと怖くない？"
    ],
    S4: [
      "ちょ、待って！！ それ先じゃないって！！",
      "締めもしてないのに例外の話とか、さすがに情緒バグるんだけど！"
    ]
  };

  let msg = "";
  let hint = "";

  const errorAfterLines = [
    "……ねえ。今、<b>ERROR</b> 見たよね？ あそこ、ほんとは見ないほうがいいページなんだけど。",
    "ちょ、待って。ERROR踏んだ？ え、ガチで？ ……こわ。いや、ありがと（複雑）。",
    "ERROR見たなら分かるでしょ。ここ、ただの404じゃない。私、ちゃんと“ここにいる”。"
  ];


  if (state === "S0") {
    msg = pick(initial);
    hint = pick(hints.S0) + " ……どっかのページ、見てきて。私、材料ほしい。";
  } else if (state === "S3") {
    msg = "……あ。まだ来ると思ってなかった。別に、待ってたわけじゃないし。";
    hint = pick(hints.S3) + " ちゃんと順番で来て。私、ぐちゃぐちゃになるの嫌。";
  } else if (state === "S4") {
    msg = "ちょっと待ってって言ったじゃん！！ その順だと、ぐちゃぐちゃになるんだけど！";
    hint = pick(hints.S4) + " 最初は自己紹介→過去→ルール→つながり→締め→例外。…ね？";
  } else {
    msg = lastPage
      ? `あ、さっき <b>${lastPage}</b> 見てたでしょ。ちょっと借りるね。`
      : pick(initial);

    const expected = ORDER[newProgress] || ORDER[0];
    const map = {
      ABOUT: "まずは自己紹介でしょ。ABOUT見てきて。",
      ARCHIVE: "次、過去。ARCHIVE行こ。",
      TERMS: "ルール無いと不安じゃん？ TERMSね。",
      CONTACT: "つながり欲しいじゃん？ CONTACT見よ。",
      FOOTER: "締め！ FOOTER見て。",
      ERROR: "最後に例外。ERROR。"
    };
    hint = (map[expected] || `次は ${expected} っぽいの、見てきて。`) + " たぶん。";
  }

  if (fromError) {
    const pick2 = (arr) => arr[Math.floor(Math.random() * arr.length)];
    msg = pick2(errorAfterLines) + "<br>……で、次はちゃんと順番で来て。私、崩れたくない。";
    hint = hint.replace(/たぶん。$/, "…お願い。");
  }
  msgEl.innerHTML = `<p>${msg}</p>`;
  hintEl.style.display = "block";
  hintEl.innerHTML = `<div class="small">hint</div><div style="margin-top:6px;">${hint}</div>`;

  footerEl.textContent = `state: ${state} / progress: ${newProgress}/${ORDER.length} / mistakes: ${newMistakes}`;
})();
