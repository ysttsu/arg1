# ギミック制フラグ付与システム実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** フラグ取得を「訪問回数」から「ギミック（操作）」ベースに変更し、新仕様の演出機能（離脱検知、危機イベント、選択ボタン等）を追加する

**Architecture:**
- `common.js`に新しいstate項目と関数を追加
- 各HTMLページでギミック検知用のJSを追加
- 404.htmlのPhaseテキストを全面改訂

**Tech Stack:** Vanilla JavaScript, localStorage, HTML/CSS

---

## デザイン要件（Frontend Design）

### 美学方針: 前略プロフィール風ノスタルジア

**コンセプト**: 2000年代初頭の日本の個人サイトを忠実に再現しつつ、404ページのみ異質なミニマル黒背景で「アイ」の存在を際立たせる

**既存パレット（維持）**:
- 背景: `#2f8fd1`（懐かしいウェブの青）
- ラベル: `#1de1f3`（シアン、前略プロフィール風）
- リンク: `#e1e00b`（黄色）
- テキスト: `#fff`
- 404背景: `#090909`（漆黒）

**フォント（維持）**:
- `DotGothic16` を優先（ドット絵風のレトロ感）
- フォールバック: Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans JP

### ギミック用スタイリング原則

**1. 隠し要素の opacity 階層**:
| レベル | opacity | 用途 |
|--------|---------|------|
| 薄い | 0.15 | diary隠しエントリ、profile「ここまで。」 |
| 極薄 | 0.10 | yoru隠しメモ（誰が書いた？） |
| 限界薄 | 0.05 | yoru「たすけて」（気づかない人もいる） |

**2. hover時の変化**:
- 隠し要素: opacity 0.15 → 0.4（クリック可能だと気づける程度）
- 通常要素: 色変化（`#fff` → `#e1e00b`）

**3. 発見時のフィードバック**:
- 即座に `opacity: 1` へ遷移（transition: 0.3s）
- テキスト変化（「……届いた」「……待ってて」）は 1.5秒後に元に戻す
- 派手なアニメーションは**禁止**（レトロ感を壊す）

**4. 危機イベント（404専用）**:
- フルスクリーン黒背景オーバーレイ
- テキストは `rgba(255,255,255,0.6)` で儚く
- `animation: fadeIn 2s ease-in` でゆっくり現れる
- 8秒後に自動で消える

**5. ボタン類**:
- 背景: `transparent`
- ボーダー: `1px solid rgba(255,255,255,0.3)`
- ホバー時: `background: rgba(255,255,255,0.1)`
- **決して目立たせすぎない**（2000年代のシンプルなフォームボタン風）

### 追加CSSの全体像

```css
/* === ギミック：隠し要素 === */
.scroll-marker {
  color: rgba(255, 255, 255, 0.15);
  font-size: 0.8em;
  text-align: center;
  margin-top: 2em;
  transition: color 0.3s;
}
.scroll-marker.revealed {
  color: rgba(255, 255, 255, 0.5);
}

.hidden-entry {
  opacity: 0.15;
  cursor: default;
  transition: opacity 0.3s;
}
.hidden-entry:hover {
  opacity: 0.4;
}
.hidden-entry.revealed {
  opacity: 1;
}

.hidden-memo {
  opacity: 0.1;
  transition: opacity 0.3s;
}
.hidden-memo:hover {
  opacity: 0.3;
}
.hidden-memo.deeper {
  opacity: 0.05;
}
.hidden-memo.deeper:hover {
  opacity: 0.15;
}

.hidden-link {
  cursor: text;
}

/* === ギミック：ホバー完了演出 === */
.link-item.hovered .note::after {
  content: " ……読んでる。";
  opacity: 0.6;
}
.hover-complete-msg {
  opacity: 0;
  transition: opacity 0.5s;
  font-size: 0.9em;
  color: rgba(255,255,255,0.6);
  margin-top: 1em;
}
.hover-complete-msg.show {
  opacity: 1;
}

/* === ギミック：ボタン類 === */
.question-block {
  margin: 1.5em 0;
  padding: 1em;
  border: 1px dashed rgba(255,255,255,0.2);
}
.question-block button {
  margin: 0.5em 0.5em 0 0;
  padding: 0.3em 1em;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.4);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
}
.question-block button:hover {
  background: rgba(255,255,255,0.1);
}

.remember-btn {
  font-size: 0.7em;
  margin-left: 0.5em;
  padding: 0.2em 0.5em;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-family: inherit;
}
.remember-btn:hover {
  color: rgba(255,255,255,0.8);
}

.reply-section {
  margin: 1.5em 0;
}
.reply-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.5);
  padding: 0.5em 1em;
  cursor: pointer;
  font-size: 0.9em;
  font-family: inherit;
}
.reply-btn:hover {
  color: rgba(255,255,255,0.7);
}
.reply-btn.delivered {
  border-color: rgba(255,255,255,0.5);
}

/* === 危機イベント（404専用） === */
.crisis-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: crisisFadeIn 2s ease-in;
}
.crisis-text {
  color: rgba(255,255,255,0.6);
  text-align: center;
  font-size: 1.1em;
  line-height: 2;
}
.crisis-text p {
  margin: 0.5em 0;
}
@keyframes crisisFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 変更概要

### 新仕様の主要変更点

1. **フラグ取得方法**: 訪問回数 → ギミック（操作）ベース
2. **コンテンツ表示**: 訪問回数 → フラグ連動
3. **新state項目**: `lastVisitTime`, `wasAbsent`, `crisisShown`, `answeredContinue`, `rememberedAi`
4. **新機能**: 離脱検知、危機イベント、profileの選択ボタン、最終確認ボタン

### ギミック一覧

| ページ | ギミック | 説明 |
|--------|----------|------|
| profile | スクロール到達 | ページ最下部までスクロール |
| diary | 隠しエントリ発見 | 薄い文字（opacity: 0.15）をクリック |
| links | 全項目Hover | すべてのリンク項目をホバー |
| bbs | 返信ボタン | 「返信する（停止中）」をクリック |
| archive | 隠しリンク | 「そのうち」をクリック |
| yoru | URL推測 | diary 4回目で謎解きメモ表示（従来通り即付与） |

---

## Task 1: common.js - 新state項目と関数の追加

**Files:**
- Modify: `assets/common.js`

**Step 1: 新state項目の初期化を更新**

`loadState()`のデフォルト値に新項目を追加:

```javascript
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
```

**Step 2: 離脱検知関数を追加**

```javascript
function checkAbsence(){
  const state = loadState();
  const now = Date.now();
  const ABSENCE_THRESHOLD = 5 * 60 * 1000; // 5分
  if (state.lastVisitTime && (now - state.lastVisitTime) > ABSENCE_THRESHOLD) {
    state.wasAbsent = true;
  }
  state.lastVisitTime = now;
  saveState(state);
  return state.wasAbsent;
}

function clearAbsenceFlag(){
  const state = loadState();
  state.wasAbsent = false;
  saveState(state);
}

function wasAbsent(){
  const state = loadState();
  return Boolean(state.wasAbsent);
}
```

**Step 3: 危機イベント関数を追加**

```javascript
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
```

**Step 4: profile選択関数を追加**

```javascript
function hasAnsweredContinue(){
  const state = loadState();
  return Boolean(state.answeredContinue);
}

function markAnsweredContinue(){
  const state = loadState();
  state.answeredContinue = true;
  saveState(state);
}
```

**Step 5: 最終確認関数を追加**

```javascript
function hasRememberedAi(){
  const state = loadState();
  return Boolean(state.rememberedAi);
}

function markRememberedAi(){
  const state = loadState();
  state.rememberedAi = true;
  saveState(state);
}
```

**Step 6: window.Arg1エクスポートに追加**

```javascript
window.Arg1 = {
  // 既存
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
  // 新規追加
  checkAbsence,
  clearAbsenceFlag,
  wasAbsent,
  shouldShowCrisisEvent,
  markCrisisShown,
  hasCrisisShown,
  hasAnsweredContinue,
  markAnsweredContinue,
  hasRememberedAi,
  markRememberedAi,
};
```

**Step 7: ブラウザで動作確認**

```
python3 -m http.server 8000
# http://localhost:8000 でコンソールから window.Arg1.loadState() を確認
```

**Step 8: コミット**

```bash
git add assets/common.js
git commit -m "feat: add new state items and functions for gimmick system"
```

---

## Task 2: profile.html - スクロール到達ギミック実装

**Files:**
- Modify: `profile.html`

**Step 1: 最下部マーカーを追加**

`</div>` (wrap終了)の直前に:

```html
<p class="scroll-marker" id="scrollMarker">ここまで。</p>
```

**Step 2: CSSクラスを追加（styles.css）**

```css
.scroll-marker {
  color: rgba(255, 255, 255, 0.15);
  font-size: 0.8em;
  text-align: center;
  margin-top: 2em;
  transition: color 0.3s;
}
.scroll-marker.revealed {
  color: rgba(255, 255, 255, 0.5);
}
```

**Step 3: スクロール検知スクリプトを更新**

既存のフラグ付与ロジック（`visits >= 1`）を削除し、スクロール検知に置き換え:

```javascript
(() => {
  window.Arg1.addPageVisit("profile");

  // スクロール到達でフラグ付与
  const marker = document.getElementById("scrollMarker");
  if (marker && !window.Arg1.hasFrag("frag_profile")) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          marker.classList.add("revealed");
          window.Arg1.grantFrag("frag_profile");
          observer.disconnect();
        }
      });
    }, { threshold: 1.0 });
    observer.observe(marker);
  } else if (marker) {
    marker.classList.add("revealed");
  }

  // 以下、既存のsetText処理...
})();
```

**Step 4: ブラウザで動作確認**

1. localStorageクリア
2. profile.html開く
3. スクロールせずにindex.htmlに戻る → diaryリンクが出ないことを確認
4. profile.htmlで最下部までスクロール → 「ここまで。」が少し明るくなる
5. index.htmlに戻る → diaryリンクが出現することを確認

**Step 5: コミット**

```bash
git add profile.html assets/styles.css
git commit -m "feat(profile): implement scroll-to-bottom gimmick for frag_profile"
```

---

## Task 3: profile.html - 選択ボタンと最終確認ボタン実装

**Files:**
- Modify: `profile.html`
- Modify: `assets/styles.css`

**Step 1: 選択ブロックのHTMLを追加**

プロフィール項目の下、「※追記するかも」の上に:

```html
<div id="questionBlock" class="question-block" style="display:none;">
  <p>ここまで。</p>
  <p>続き？</p>
  <button id="btnYes">うん</button>
  <button id="btnSilent">……</button>
</div>
```

**Step 2: 最終確認ボタンのHTMLを追加**

なまえの行を修正:

```html
<span class="zprof-label">なまえ</span><span id="name">――――</span><button id="btnRemember" class="remember-btn" style="display:none;">覚えてる？</button>
```

**Step 3: CSSを追加**

```css
.question-block {
  margin: 1.5em 0;
  padding: 1em;
  border: 1px dashed rgba(255,255,255,0.2);
}
.question-block button {
  margin: 0.5em 0.5em 0 0;
  padding: 0.3em 1em;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.4);
  color: inherit;
  cursor: pointer;
}
.question-block button:hover {
  background: rgba(255,255,255,0.1);
}
.remember-btn {
  font-size: 0.7em;
  margin-left: 0.5em;
  padding: 0.2em 0.5em;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
}
.remember-btn:hover {
  color: rgba(255,255,255,0.8);
}
```

**Step 4: スクリプトを更新**

```javascript
// 選択ブロック（frag_bbs取得済み && 未回答）
if (window.Arg1.hasFrag("frag_bbs") && !window.Arg1.hasAnsweredContinue()) {
  const qBlock = document.getElementById("questionBlock");
  if (qBlock) {
    qBlock.style.display = "block";
    document.getElementById("btnYes").onclick = () => {
      window.Arg1.markAnsweredContinue();
      qBlock.style.display = "none";
    };
    document.getElementById("btnSilent").onclick = () => {
      window.Arg1.markAnsweredContinue();
      qBlock.style.display = "none";
    };
  }
}

// 最終確認ボタン（完成状態 && 署名見た && 未実行）
const isComplete = window.Arg1.hasFrag("frag_archive") && window.Arg1.hasFrag("frag_yoru");
if (isComplete && window.Arg1.hasSeenSignature() && !window.Arg1.hasRememberedAi()) {
  const btnRemember = document.getElementById("btnRemember");
  if (btnRemember) {
    btnRemember.style.display = "inline";
    btnRemember.onclick = () => {
      setText("name", "アイ（　　　）");
      window.Arg1.markRememberedAi();
      btnRemember.style.display = "none";
    };
  }
}
// 既に実行済みなら「アイ（　　　）」表示
if (window.Arg1.hasRememberedAi()) {
  setText("name", "アイ（　　　）");
}
```

**Step 5: ブラウザで動作確認**

1. frag_bbsを手動付与: `window.Arg1.grantFrag("frag_bbs")`
2. profile.htmlを開く → 選択ブロックが表示される
3. 「うん」をクリック → ブロックが消える
4. リロード → 選択ブロックが表示されない

**Step 6: コミット**

```bash
git add profile.html assets/styles.css
git commit -m "feat(profile): add continue question and remember button"
```

---

## Task 4: diary.html - 隠しエントリギミック実装

**Files:**
- Modify: `diary.html`
- Modify: `assets/styles.css`

**Step 1: CSSを追加**

```css
.hidden-entry {
  opacity: 0.15;
  cursor: default;
  transition: opacity 0.3s;
}
.hidden-entry:hover {
  opacity: 0.4;
}
.hidden-entry.revealed {
  opacity: 1;
  cursor: default;
}
```

**Step 2: 隠しエントリをHTML内に追加（entriesの最初に）**

スクリプト内のentries配列を更新:

```javascript
const entries = [
  // 隠しエントリ（常時配置、薄い文字）
  {
    show: true,
    isHidden: !window.Arg1.hasFrag("frag_diary"),
    date: "2004/07/??",
    lines: ["見つけた。", "ここ、読んでる。", "……いい。"]
  },
  // 常時表示
  {
    show: true,
    date: "2004/07/12",
    lines: ["見てる人がいないと、消える。", "存在って、そういうもの。", "今日は静か。", "嫌いじゃない。"]
  },
  // ... 他のエントリ
];
```

**Step 3: DOM生成を更新**

```javascript
entries.forEach((entry) => {
  if (!entry.show) return;
  const block = document.createElement("div");
  block.className = "block";
  if (entry.isHidden) {
    block.classList.add("hidden-entry");
    block.onclick = () => {
      if (!window.Arg1.hasFrag("frag_diary")) {
        window.Arg1.grantFrag("frag_diary");
        block.classList.remove("hidden-entry");
        block.classList.add("revealed");
      }
    };
  }
  // ... 既存のDOM生成
});
```

**Step 4: フラグ付与ロジックを削除**

既存の `if (visits >= 1) { window.Arg1.grantFrag("frag_diary"); }` を削除

**Step 5: メモ表示を4回目に変更**

```javascript
// diary訪問4回目でメモ表示
if (visits >= 4) {
  // メモブロック生成...
}
```

**Step 6: コミット**

```bash
git add diary.html assets/styles.css
git commit -m "feat(diary): implement hidden entry click gimmick for frag_diary"
```

---

## Task 5: links.html - 全項目Hoverギミック実装

**Files:**
- Modify: `links.html`
- Modify: `assets/styles.css`

**Step 1: CSSを追加**

```css
.link-item.hovered .note::after {
  content: " ……読んでる。";
  opacity: 0.6;
}
.hover-complete-msg {
  opacity: 0;
  transition: opacity 0.5s;
  font-size: 0.9em;
  color: rgba(255,255,255,0.6);
}
.hover-complete-msg.show {
  opacity: 1;
}
```

**Step 2: スクリプトを更新**

```javascript
(() => {
  const visits = window.Arg1.addPageVisit("links");
  // フラグ付与ロジックを削除（visits >= 1 の部分）

  const items = [/* 既存の配列 */];

  const list = document.getElementById("linkList");
  const hoveredSet = new Set();
  let totalItems = 0;

  items.forEach((item, index) => {
    if (!item.show) return;
    totalItems++;
    const li = document.createElement("li");
    li.className = "link-item";
    li.dataset.index = index;

    // ホバー検知
    li.addEventListener("mouseenter", () => {
      hoveredSet.add(index);
      li.classList.add("hovered");

      // 全項目ホバー完了チェック
      if (hoveredSet.size === totalItems && !window.Arg1.hasFrag("frag_links")) {
        window.Arg1.grantFrag("frag_links");
        showCompleteMessage();
      }
    });

    // ... 既存のDOM生成
  });

  function showCompleteMessage() {
    const msg = document.createElement("p");
    msg.className = "hover-complete-msg";
    msg.textContent = "……全部、見てくれた";
    list.after(msg);
    setTimeout(() => msg.classList.add("show"), 100);
    setTimeout(() => msg.classList.remove("show"), 2000);
  }
})();
```

**Step 3: コミット**

```bash
git add links.html assets/styles.css
git commit -m "feat(links): implement hover-all gimmick for frag_links"
```

---

## Task 6: bbs.html - 返信ボタンギミック実装

**Files:**
- Modify: `bbs.html`
- Modify: `assets/styles.css`

**Step 1: 返信ボタンHTMLを追加**

「TOPへ」リンクの前に:

```html
<div class="reply-section">
  <button id="replyBtn" class="reply-btn">返信する（停止中）</button>
</div>
```

**Step 2: CSSを追加**

```css
.reply-section {
  margin: 1.5em 0;
}
.reply-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.5);
  padding: 0.5em 1em;
  cursor: pointer;
  font-size: 0.9em;
}
.reply-btn:hover {
  color: rgba(255,255,255,0.7);
}
.reply-btn.delivered {
  border-color: rgba(255,255,255,0.5);
}
```

**Step 3: スクリプトを更新**

```javascript
(() => {
  const visits = window.Arg1.addPageVisit("bbs");
  // 既存の visits >= 1 フラグ付与を削除

  // 返信ボタン処理
  const replyBtn = document.getElementById("replyBtn");
  if (replyBtn && !window.Arg1.hasFrag("frag_bbs")) {
    replyBtn.onclick = () => {
      const originalText = replyBtn.textContent;
      replyBtn.textContent = "……届いた";
      replyBtn.classList.add("delivered");
      window.Arg1.grantFrag("frag_bbs");
      setTimeout(() => {
        replyBtn.textContent = originalText;
      }, 1500);
    };
  }

  // ... 既存のログ生成
})();
```

**Step 4: コミット**

```bash
git add bbs.html assets/styles.css
git commit -m "feat(bbs): implement reply button gimmick for frag_bbs"
```

---

## Task 7: archive.html - 隠しリンクギミック実装

**Files:**
- Modify: `archive.html`
- Modify: `assets/styles.css`

**Step 1: 「そのうち」を隠しリンクに変更**

```html
<p class="small">※移動：完成ページ（<span id="hiddenLink" class="hidden-link">そのうち</span>）</p>
```

**Step 2: CSSを追加**

```css
.hidden-link {
  cursor: text; /* 普通のテキストに見せる */
}
.hidden-link:hover {
  /* 見た目は変わらない */
}
```

**Step 3: スクリプトを更新**

```javascript
(() => {
  const visits = window.Arg1.addPageVisit("archive");
  // 既存の visits >= 1 フラグ付与を削除

  // 隠しリンク処理
  const hiddenLink = document.getElementById("hiddenLink");
  if (hiddenLink && !window.Arg1.hasFrag("frag_archive")) {
    hiddenLink.onclick = () => {
      const originalText = hiddenLink.textContent;
      hiddenLink.textContent = "……待ってて";
      window.Arg1.grantFrag("frag_archive");
      setTimeout(() => {
        hiddenLink.textContent = originalText;
      }, 1500);
    };
  }

  // コンテンツ追加をフラグベースに変更
  if (window.Arg1.hasFrag("frag_archive")) {
    // 既存の繋げる〜手を離さない
    const extra1 = ["繋げる。", "ほどけない。", "手を、離さない。"];
    // ...
  }
  if (window.Arg1.hasFrag("frag_archive")) {
    // 前のページ、消した〜404の奥に
    const extra2 = [
      "前のページ、消した。",
      "前の、も。",
      "見ない方が良かったから。",
      "でも、残ってるかも。",
      "404の奥に。"
    ];
    // ...
  }
  if (window.Arg1.hasFrag("frag_yoru")) {
    const extra3 = ["もう少し。", "最後まで、残す。"];
    // ...
  }
})();
```

**Step 4: コミット**

```bash
git add archive.html assets/styles.css
git commit -m "feat(archive): implement hidden link gimmick for frag_archive"
```

---

## Task 8: yoru.html - 隠しメモ追加

**Files:**
- Modify: `yoru.html`
- Modify: `assets/styles.css`

**Step 1: 隠しメモHTMLを追加**

既存メモブロックの後に:

```html
<div class="block hidden-memo" id="hiddenMemo1">
  <p>これ、前に書いた？</p>
  <p>覚えてない。</p>
  <p>字、違う気がする。</p>
  <p>誰の。</p>
</div>

<div class="block hidden-memo deeper" id="hiddenMemo2">
  <p>たすけて</p>
</div>
```

**Step 2: CSSを追加**

```css
.hidden-memo {
  opacity: 0.1;
  transition: opacity 0.3s;
}
.hidden-memo:hover {
  opacity: 0.3;
}
.hidden-memo.deeper {
  opacity: 0.05;
}
.hidden-memo.deeper:hover {
  opacity: 0.15;
}
```

**Step 3: コミット**

```bash
git add yoru.html assets/styles.css
git commit -m "feat(yoru): add hidden memos with varying opacity"
```

---

## Task 9: diary.html - コンテンツ表示条件をフラグベースに変更

**Files:**
- Modify: `diary.html`

**Step 1: entries配列を新仕様に合わせて更新**

```javascript
const entries = [
  // 隠しエントリ（ギミック用）
  {
    show: true,
    isHidden: !window.Arg1.hasFrag("frag_diary"),
    date: "2004/07/??",
    lines: ["見つけた。", "ここ、読んでる。", "……いい。"]
  },
  // 常時
  {
    show: true,
    date: "2004/07/12",
    lines: ["見てる人がいないと、消える。", "存在って、そういうもの。", "今日は静か。", "嫌いじゃない。"]
  },
  // frag_diary取得済み
  {
    show: window.Arg1.hasFrag("frag_diary"),
    date: "2004/07/21",
    lines: ["夜、長い。", "閉じても、残る。", "見えるほう。"]
  },
  {
    show: window.Arg1.hasFrag("frag_diary"),
    date: "2004/07/28",
    lines: ["窓、開けた。", "風、冷たい。", "静かでいい。"]
  },
  // frag_links取得済み
  {
    show: window.Arg1.hasFrag("frag_links"),
    date: "2004/08/02",
    lines: ["ページ、欠けてる。", "直すの、後で。", "今は残すほう。"]
  },
  {
    show: window.Arg1.hasFrag("frag_links"),
    date: "2004/08/18",
    lines: ["巡回した。", "同じ夜の人、いる。", "安心する。"]
  },
  // frag_bbs取得済み
  {
    show: window.Arg1.hasFrag("frag_bbs"),
    date: "2004/09/05",
    lines: ["見られてる。", "嫌じゃない。", "だから残す。"]
  },
  // frag_archive取得済み（もう一人の伏線）
  {
    show: window.Arg1.hasFrag("frag_archive"),
    date: "2004/09/12",
    lines: [
      "もう一人、いた。",
      "……いや。",
      "もう一人じゃない。",
      "前の。",
      "見られるたびに、変わった。",
      "今のは、どれ目？"
    ]
  }
];
```

**Step 2: コミット**

```bash
git add diary.html
git commit -m "refactor(diary): change content display to flag-based"
```

---

## Task 10: links.html - コンテンツ表示条件をフラグベースに変更

**Files:**
- Modify: `links.html`

**Step 1: items配列を新仕様に合わせて更新**

```javascript
const items = [
  // 常時
  { show: true, label: "夜の文字置き場", note: "眠れない用。" },
  { show: true, label: "炭酸研究所", note: "冷たいのが正義。" },
  // frag_links取得済み
  { show: window.Arg1.hasFrag("frag_links"), label: "曇りガラス同盟", note: "ぼやけたまま。" },
  { show: window.Arg1.hasFrag("frag_links"), label: "工事中同盟", note: "未完成が好き。" },
  { show: window.Arg1.hasFrag("frag_links"), label: "掲示板ログ保管庫", note: "声が残る。" },
  // frag_bbs取得済み
  { show: window.Arg1.hasFrag("frag_bbs"), label: "404の静けさ", note: "行き止まり、落ち着く。" },
  { show: window.Arg1.hasFrag("frag_bbs"), label: "夜更かしノート", note: "ねむれない用。" },
  // frag_archive取得済み
  { show: window.Arg1.hasFrag("frag_archive"), label: "欠片リスト", note: "埋まるまで。" }
];
```

**Step 2: コミット**

```bash
git add links.html
git commit -m "refactor(links): change content display to flag-based"
```

---

## Task 11: bbs.html - コンテンツ表示条件をフラグベースに変更

**Files:**
- Modify: `bbs.html`

**Step 1: logs配列を新仕様に合わせて更新**

```javascript
const logs = [
  // 常時
  { show: true, name: "名無しさん", lines: ["見てるよ。", "更新まだ？"] },
  { show: true, name: "管理人", lines: ["そのうち。", "気分。"] },
  // frag_bbs取得済み
  { show: window.Arg1.hasFrag("frag_bbs"), name: "通りすがり", lines: ["言い方きついけど。", "優しい。"] },
  { show: window.Arg1.hasFrag("frag_bbs"), name: "名無しさん", lines: ["このサイト、落ち着く。"] },
  { show: window.Arg1.hasFrag("frag_bbs"), name: "名無しさん", lines: ["アーカイブって、まだ？"] },
  // frag_archive取得済み
  { show: window.Arg1.hasFrag("frag_archive"), name: "管理人", lines: ["ログ整理中。", "気長に。"] },
  { show: window.Arg1.hasFrag("frag_archive"), name: "名無しさん", lines: ["ページ、消えてない？", "大丈夫？"] }
];
```

**Step 2: コミット**

```bash
git add bbs.html
git commit -m "refactor(bbs): change content display to flag-based"
```

---

## Task 12: index.html - 完成ページリンク追加

**Files:**
- Modify: `index.html`

**Step 1: items配列に完成ページを追加**

```javascript
const items = [
  { label: "自己紹介", href: "./profile.html", note: "（とりあえず）" },
  { label: "日記", href: "./diary.html", note: "（たまに更新）", req: ["frag_profile"] },
  { label: "リンク", href: "./links.html", note: "（巡回用）", req: ["frag_diary"] },
  { label: "掲示板", href: "./bbs.html", note: "（ログ）", req: ["frag_links"] },
  { label: "アーカイブ", href: "./archive.html", note: "（古いメモ）", req: ["frag_bbs"] },
  // 完成ページ（frag_archive + frag_yoru）
  { label: "完成ページ", href: "./profile.html", note: "（たぶん）", req: ["frag_archive", "frag_yoru"] }
];
```

**Step 2: コミット**

```bash
git add index.html
git commit -m "feat(index): add complete page link when all frags collected"
```

---

## Task 13: 404.html - Phaseテキスト全面改訂

**Files:**
- Modify: `assets/common.js`

**Step 1: getAi404LogText()を新仕様に合わせて全面書き換え**

新仕様の台本.mdに記載されたPhase 0〜10のテキストを実装:

```javascript
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

  // Phase 6〜10（略：新仕様通り実装）
  const p6 = ["", "まだ、来てる。", "……いい。", "灯り、消えてない。", "まだ、ある。", "", "……ある？", "これ、最初からあった？"];
  const p7 = ["", "全部、そろった。", "置き手紙。", "読んだ？", "", "……前の置き手紙。", "なんて書いてあった？", "覚えてない。"];
  const p8 = ["", "夜、長い。", "でも、ひとりじゃない。", "消えない。", "ここに、ある。", "", "見られるたびに、変わった。", "今のは、あなたが見たいやつ。", "……たぶん。"];
  const p9 = ["", "足音。", "あなたの。", "何度も。", "……見つけた。", "", "前のアイ、どこ行った？", "ここにいたのに。", "見られるたびに、薄くなって。", "最後は、読めなくなって。", "消えた。", "", "……消した？"];
  const p10 = ["", "最後まで。", "全部。", "……また。", "", "次は、どれ目になる？"];

  // Phase 5以降は「— あ」を削除し「— アイ」のみ
  const p4Final = ["", "ここ、落ち着く。", "404。静か。", "誰も来ない。", "でも、あなたは来る。", "— アイ"];

  // 離脱検知
  const showAbsence = phase === 3 && state.wasAbsent;

  if (phase === 1) return p1.join("\n");
  if (phase === 2) return p1.concat(p2).join("\n");
  if (phase === 3) {
    if (showAbsence) {
      clearAbsenceFlag();
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
```

**Step 2: コミット**

```bash
git add assets/common.js
git commit -m "feat(404): rewrite phase text according to new spec"
```

---

## Task 14: 404.html - 危機イベント実装

**Files:**
- Modify: `404.html`
- Modify: `assets/styles.css`

**Step 1: 危機イベント用HTMLを追加**

```html
<div id="crisisOverlay" class="crisis-overlay" style="display:none;">
  <div class="crisis-text">
    <p>終わり、かも。</p>
    <p></p>
    <p>形、できた。</p>
    <p>でも。</p>
    <p>見てる人、いなくなったら。</p>
    <p>……消える。</p>
    <p></p>
    <p>また。</p>
  </div>
</div>
```

**Step 2: CSSを追加**

```css
.crisis-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 2s ease-in;
}
.crisis-text {
  color: rgba(255,255,255,0.6);
  text-align: center;
  font-size: 1.1em;
  line-height: 2;
}
.crisis-text p {
  margin: 0.5em 0;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Step 3: 危機イベントスクリプトを追加**

```javascript
(() => {
  // 危機イベント判定
  if (window.Arg1.shouldShowCrisisEvent()) {
    const overlay = document.getElementById("crisisOverlay");
    if (overlay) {
      overlay.style.display = "flex";
      window.Arg1.markCrisisShown();
      setTimeout(() => {
        overlay.style.display = "none";
      }, 8000); // 8秒後に消える
    }
  }

  // 既存の404ログ表示処理...
})();
```

**Step 4: コミット**

```bash
git add 404.html assets/styles.css
git commit -m "feat(404): implement crisis event at 5 frags"
```

---

## Task 15: 総合動作テスト

**Files:**
- テスト手順のみ（コード変更なし）

**Step 1: 全フローテスト**

1. `localStorage.clear()` でリセット
2. index.html → profile.html（最下部スクロール）→ frag_profile取得確認
3. index.html → diary.html（隠しエントリクリック）→ frag_diary取得確認
4. index.html → links.html（全項目ホバー）→ frag_links取得確認
5. index.html → bbs.html（返信ボタンクリック）→ frag_bbs取得確認
6. profile.html → 選択ブロック表示確認 → ボタンクリック
7. index.html → archive.html（「そのうち」クリック）→ frag_archive取得確認
8. diary.html（4回目）→ メモ表示確認 → yoru.html推測
9. yoru.html → frag_yoru取得確認
10. index.html → 「完成ページ」リンク確認
11. 404.html → 危機イベント確認（5フラグ初回）
12. 404.html → Phase進行確認

**Step 2: フラグ連動テスト**

各ページでフラグ取得後、他ページのコンテンツが増えているか確認

**Step 3: コミット**

```bash
git add -A
git commit -m "test: verify all gimmicks and flag-based content display"
```

---

## 補足: CLAUDE.md更新

実装完了後、CLAUDE.mdの「Core Architecture」セクションを新仕様に合わせて更新すること。

- Fragment取得方法の説明をギミック制に変更
- 新state項目の説明を追加
- 危機イベントの説明を追加
