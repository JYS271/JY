"use strict";

/* ===== 운세 데이터 (이모지 10종 = 운세 10종) ===== */
const FORTUNES = [
  { emoji: "🦆", text: "물 흐르듯 술술 풀리는 하루, 서두르지 않아도 돼요.", item: "따뜻한 차 한 잔" },
  { emoji: "🧸", text: "곁에 있는 사람이 큰 힘이 되는 날. 고맙다고 말해봐요.", item: "포근한 니트" },
  { emoji: "🐰", text: "기회가 깡총 뛰어 들어와요. 망설이지 말고 잡으세요.", item: "흰색 운동화" },
  { emoji: "🍀", text: "작은 행운이 곳곳에 숨어 있는 날이에요.", item: "초록색 펜" },
  { emoji: "⭐", text: "어디서든 눈에 띄는 하루. 자신감을 가져요.", item: "마음에 드는 액세서리" },
  { emoji: "🎈", text: "마음이 가벼워지는 하루. 미뤄둔 걸 시작해봐요.", item: "탄산음료" },
  { emoji: "🍓", text: "달콤한 소식이 찾아올지도. 디저트를 챙겨보세요.", item: "딸기 우유" },
  { emoji: "🐱", text: "느긋해도 괜찮아요. 쉬어가는 것도 실력이에요.", item: "부드러운 담요" },
  { emoji: "🌈", text: "흐림 뒤 맑음. 오후로 갈수록 좋아져요.", item: "작은 우산" },
  { emoji: "🍡", text: "차근차근 쌓아온 것이 결실을 맺는 날.", item: "달달한 간식" },
];

const STORAGE_KEY = "todays-fortune-v1";
const CRACKS_NEEDED = 5;

/* ===== 애플 스타일 이모지 (어느 기기에서나 동일하게) ===== */
const EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/";
function emojiCode(e) {
  return [...e].map((ch) => ch.codePointAt(0).toString(16)).filter((c) => c !== "fe0f").join("-");
}
function emojiUrl(e) {
  return `url("${EMOJI_BASE}${emojiCode(e)}.png")`;
}
function setEmoji(el, e) {
  el.style.backgroundImage = e ? emojiUrl(e) : "none";
}

/* ===== DOM ===== */
const crane = document.getElementById("crane");
const cable = document.getElementById("cable");
const claw = document.getElementById("claw");
const grabbed = document.getElementById("grabbed");
const pile = document.getElementById("pile");
const caseFrame = document.querySelector(".case-frame");

const stage = document.getElementById("stage");
const stageBall = document.getElementById("stageBall");
const stageEmoji = document.getElementById("stageEmoji");
const crackLayer = document.getElementById("crackLayer");
const shardsBox = document.getElementById("shards");
const tapBadge = document.getElementById("tapBadge");

const slip = document.getElementById("slip");
const slipEmoji = document.getElementById("slipEmoji");
const slipFortune = document.getElementById("slipFortune");
const slipItem = document.getElementById("slipItem");
const slipDate = document.getElementById("slipDate");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const dropBtn = document.getElementById("dropBtn");
const resetBtn = document.getElementById("resetBtn");
const hint = document.getElementById("hint");
const creditCount = document.getElementById("creditCount");

/* ===== 상태 ===== */
const COUNT = FORTUNES.length;       // 10
/* 바닥 절반을 꽉 채운 더미 (x: 가로 %, y: 바닥에서 띄운 px, s: 크기 px) — 왼→오 순서 */
const PILE = [
  { x: 11, y: 2,   s: 74 },  // 🦆 오리
  { x: 20, y: 66,  s: 68 },  // 🧸 곰돌이
  { x: 29, y: 2,   s: 82 },  // 🐰 토끼
  { x: 38, y: 70,  s: 57 },  // 🍀 클로버
  { x: 47, y: 2,   s: 89 },  // ⭐ 별
  { x: 56, y: 66,  s: 84 },  // 🎈 풍선
  { x: 65, y: 2,   s: 70 },  // 🍓 딸기
  { x: 74, y: 70,  s: 60 },  // 🐱 고양이
  { x: 83, y: 4,   s: 74 },  // 🌈 무지개
  { x: 91, y: 62,  s: 49 },  // 🍡 경단
];
const MIN_PCT = 10;
const MAX_PCT = 90;
let index = Math.floor(COUNT / 2);
let busy = false;                    // 애니메이션 진행 중 (입력 차단)
let crackMode = false;               // 5번 두드리기 단계
let crackCount = 0;
let pendingFortune = null;
let toys = [];
let credits = 0;                     // 코인으로 충전되는 뽑기 가능 횟수

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const posOf = (i) => MIN_PCT + (i * (MAX_PCT - MIN_PCT)) / (COUNT - 1);
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ===== 바닥 더미 ===== */
function buildPile() {
  pile.innerHTML = "";
  toys = [];
  const jitter = [3, -4, 2, -3, 0, 4, -2, 3, -4, 2];
  FORTUNES.forEach((f, i) => {
    const el = document.createElement("span");
    el.className = "toy";
    setEmoji(el, f.emoji);
    el.style.left = PILE[i].x + "%";
    el.style.bottom = PILE[i].y + "px";
    el.style.width = PILE[i].s + "px";
    el.style.height = PILE[i].s + "px";
    el.style.setProperty("--rot", jitter[i] + "deg");
    el.style.zIndex = String(Math.round(PILE[i].y / 10) + 2); // 위층이 앞으로 오게 쌓인 느낌
    pile.appendChild(el);
    toys.push(el);
  });
  highlight();
}

function highlight() {
  toys.forEach((t, i) => t.classList.toggle("target", i === index));
}

function moveCrane() {
  crane.style.left = PILE[index].x + "%";
  highlight();
}

function move(dir) {
  if (busy || crackMode) return;
  index = Math.min(COUNT - 1, Math.max(0, index + dir));
  moveCrane();
}

/* ===== 먼지 입자 (은은하게) ===== */
function puff() {
  const rect = stage.getBoundingClientRect();
  const hostRect = caseFrame.getBoundingClientRect();
  const cx = rect.left - hostRect.left + rect.width / 2;
  const cy = rect.top - hostRect.top + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    const d = document.createElement("span");
    d.className = "dust";
    d.style.left = cx + "px";
    d.style.top = cy + "px";
    const ang = (Math.PI * 2 * i) / 8 + 0.3;
    d.style.setProperty("--dx", Math.cos(ang) * 38 + "px");
    d.style.setProperty("--dy", Math.sin(ang) * 32 + 12 + "px");
    caseFrame.appendChild(d);
    setTimeout(() => d.remove(), 600);
  }
}

/* ===== 집게 다리 제어 =====
   다리는 2단(윗마디 LEG_L1, 아랫마디 LEG_L2, 아랫마디 상대각 LEG_LOWER_DEG)으로 꺾여 있어
   다리 각도 θ1 에 따라 양쪽 손끝 사이 거리(span)가 달라진다. CSS 값과 일치시켜야 함. */
const legL = document.querySelector(".leg-l");
const legR = document.querySelector(".leg-r");
const LEG_L1 = 55;      // .strut height
const LEG_L2 = 46;      // .bone 길이(손끝까지)
const LEG_LOWER_DEG = 58; // .lower 상대 회전
const OPEN_DEG = 60;    // 활짝(양다리 사이 120°)

function legTipSpan(theta1) {
  const t1 = (theta1 * Math.PI) / 180;
  const phi = ((theta1 - LEG_LOWER_DEG) * Math.PI) / 180;
  const tipX = LEG_L1 * Math.sin(t1) + LEG_L2 * Math.sin(phi);
  return Math.abs(tipX) * 2;
}
// 손끝 사이 거리가 span(px)이 되는 다리 각도 θ1 (이분 탐색, 벌어진 구간 30~64°)
function legAngleForSpan(span) {
  let lo = 30, hi = 64;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (legTipSpan(mid) < span) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
function setLegs(deg) {
  legL.style.transform = `rotate(${-deg}deg)`;
  legR.style.transform = `rotate(${deg}deg)`;
}
function clearLegs() {
  legL.style.transform = "";
  legR.style.transform = "";
  grabbed.style.width = "";
  grabbed.style.height = "";
  grabbed.style.top = "";
}

/* ===== 뽑기 시퀀스 ===== */
async function drawFortune() {
  if (busy || crackMode || credits <= 0) return;
  busy = true;
  credits -= 1;                 // 뽑기 1회 사용
  creditCount.textContent = credits;
  setControls(false);

  // 이전 결과/더미 정리 (반복 뽑기)
  slip.classList.remove("show");
  slip.hidden = true;
  buildPile();
  moveCrane();

  hint.textContent = "집게가 내려가요…";

  // 캡슐(이모지)은 내가 고른 것, 그 안의 운세 종이는 매번 랜덤
  const capsule = index;
  const fortuneIdx = Math.floor(Math.random() * COUNT);
  const result = {
    emoji: FORTUNES[capsule].emoji,
    text: FORTUNES[fortuneIdx].text,
    item: FORTUNES[fortuneIdx].item,
    c: capsule,
    f: fortuneIdx,
  };

  // 1) 하강하며 120°로 활짝 벌리기
  setLegs(OPEN_DEG);
  const descend = Math.max(150, 318 - PILE[capsule].y);
  cable.style.height = descend + "px";
  await sleep(620);

  // 2) 이모지 끝과 끝까지만 오므려 잡기
  const grabSize = PILE[capsule].s;
  setLegs(legAngleForSpan(grabSize));
  toys[capsule].classList.add("gone");
  setEmoji(grabbed, result.emoji);
  grabbed.style.width = grabSize + "px";
  grabbed.style.height = grabSize + "px";
  grabbed.style.top = (100 - grabSize / 2) + "px"; // 손끝 위치에 맞춰 가운데 정렬
  claw.classList.add("holding");
  await sleep(280);

  // 3) 잡은 채로 올라가기
  cable.style.height = "26px";
  await sleep(620);

  // 4) 중앙으로
  hint.textContent = "집게가 이모지를 들고 왔어요!";
  crane.style.left = "50%";
  await sleep(420);

  // 5) 무대로 넘기고 → 5번 두드리기 단계
  claw.classList.remove("holding");
  setEmoji(grabbed, "");
  clearLegs(); // 다리 원위치
  enterCrackMode(result);
  busy = false;
}

/* ===== 5번 두드리기 ===== */
function enterCrackMode(fortune) {
  pendingFortune = fortune;
  crackCount = 0;
  crackMode = true;

  setEmoji(stageEmoji, fortune.emoji);
  stageEmoji.style.opacity = "1";
  crackLayer.innerHTML = "";
  crackLayer.style.opacity = "1";
  shardsBox.innerHTML = "";

  stage.classList.add("active");
  stageBall.classList.remove("hidden");
  stageBall.classList.add("tappable");
  tapBadge.classList.remove("hidden");

  dropBtn.disabled = false;
  dropBtn.classList.add("cracking");
  updateCrackHint();
}

function updateCrackHint() {
  const left = CRACKS_NEEDED - crackCount;
  hint.textContent = `톡톡! 이모지를 ${left}번 더 두드려 깨보세요`;
  tapBadge.textContent = `${crackCount} / ${CRACKS_NEEDED}`;
}

function doCrack() {
  if (!crackMode || busy) return;
  crackCount += 1;

  // 두드림 반동
  stageBall.classList.remove("knock");
  void stageBall.offsetWidth;
  stageBall.classList.add("knock");

  if (crackCount < CRACKS_NEEDED) {
    addCrackLine(crackCount);
    updateCrackHint();
  } else {
    addCrackLine(crackCount);
    shatter();
  }
}

function addCrackLine(n) {
  const angles = [-18, 64, -120, 150, 20];
  const line = document.createElement("span");
  line.className = "crack";
  line.style.transform = `translate(-50%, 0) rotate(${angles[(n - 1) % angles.length]}deg)`;
  crackLayer.appendChild(line);
}

async function shatter() {
  crackMode = false;
  busy = true;
  stage.classList.remove("active");
  stageBall.classList.remove("tappable");
  tapBadge.classList.add("hidden");
  dropBtn.classList.remove("cracking");
  dropBtn.disabled = true;
  hint.textContent = "와장창! 🍪";

  const f = pendingFortune;
  stageEmoji.style.opacity = "0";
  crackLayer.style.opacity = "0";
  spawnShards(f.emoji);
  puff();
  await sleep(700);

  shardsBox.innerHTML = "";
  crackLayer.innerHTML = "";
  stageBall.classList.add("hidden");

  showSlip(f);
  busy = false;
  setControls(true);
  hint.textContent = credits > 0
    ? "운세가 나왔어요! ✨ 남은 횟수로 또 뽑을 수 있어요"
    : "운세가 나왔어요! ✨ 코인을 넣으면 또 뽑을 수 있어요";
}

/* 이모지를 쿠키 조각처럼 6등분해서 흩뿌리기 */
function spawnShards(emoji) {
  const N = 6;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const pt = (ang, r) => `${50 + r * Math.cos(ang)}% ${50 + r * Math.sin(ang)}%`;
    const clip = `polygon(50% 50%, ${pt(a0, 78)}, ${pt(am, 85)}, ${pt(a1, 78)})`;

    const shard = document.createElement("span");
    shard.className = "shard";
    setEmoji(shard, emoji);
    shard.style.clipPath = clip;
    shard.style.webkitClipPath = clip;
    const dist = 30 + (i % 2) * 12;
    shard.style.setProperty("--dx", Math.cos(am) * dist + "px");
    shard.style.setProperty("--dy", Math.sin(am) * dist + 26 + "px");
    shard.style.setProperty("--rot", (i % 2 ? 1 : -1) * (40 + i * 8) + "deg");
    shardsBox.appendChild(shard);
  }
}

/* ===== 결과 슬립 ===== */
function showSlip(f) {
  setEmoji(slipEmoji, f.emoji);
  slipFortune.textContent = f.text;
  slipItem.textContent = f.item;
  slipDate.textContent = todayStr().replace(/-/g, ".");
  slip.hidden = false;
  void slip.offsetWidth;
  slip.classList.add("show");
}

/* ===== 저장 / 복원 ===== */
function save(result) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), c: result.c, f: result.f }));
  } catch (e) { /* 무시 */ }
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.date !== todayStr()) return null;
    if (typeof data.c === "number" && typeof data.f === "number") return { c: data.c, f: data.f };
    if (typeof data.index === "number") return { c: data.index, f: data.index }; // 이전 버전 호환
  } catch (e) { /* 무시 */ }
  return null;
}

function showLockedResult(saved) {
  const c = saved.c, f = saved.f;
  toys[c].classList.add("gone");
  crane.style.left = "50%";
  index = c;
  highlight();
  showSlip({ emoji: FORTUNES[c].emoji, text: FORTUNES[f].text, item: FORTUNES[f].item });
  hint.textContent = "오늘은 이미 뽑았어요 🌙 내일 다시 만나요";
  setControls(false);
  resetBtn.style.display = "block";
}

/* ===== 컨트롤 ===== */
function setControls(enabled) {
  leftBtn.disabled = !enabled;
  rightBtn.disabled = !enabled;
  // 뽑기 버튼은 크레딧이 있어야 활성화
  dropBtn.disabled = !enabled || credits <= 0;
}

/* 남은 뽑기 횟수 표시 + 뽑기 버튼 활성화 갱신 (대기 중일 때만) */
function updateCredits() {
  creditCount.textContent = credits;
  if (!busy && !crackMode) dropBtn.disabled = credits <= 0;
}

/* ===== 리셋 ===== */
function reset() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* 무시 */ }
  slip.classList.remove("show");
  slip.hidden = true;

  crackMode = false;
  crackCount = 0;
  pendingFortune = null;
  busy = false;

  stage.classList.remove("active");
  stageBall.classList.add("hidden");
  stageBall.classList.remove("tappable");
  tapBadge.classList.add("hidden");
  crackLayer.innerHTML = "";
  shardsBox.innerHTML = "";
  dropBtn.classList.remove("cracking");

  index = Math.floor(COUNT / 2);
  buildPile();
  moveCrane();
  cable.style.height = "26px";
  claw.classList.remove("closed");
  clearLegs();
  setControls(true);
  hint.textContent = "← → 로 집게를 옮기고, 핑크 버튼으로 뽑아보세요";
  resetBtn.style.display = "none";
}

/* ===== 이벤트 ===== */
leftBtn.addEventListener("click", () => move(-1));
rightBtn.addEventListener("click", () => move(1));
dropBtn.addEventListener("click", () => (crackMode ? doCrack() : drawFortune()));
stage.addEventListener("click", () => { if (crackMode) doCrack(); });
resetBtn.addEventListener("click", reset);

/* 창 크기가 바뀌면 집게를 선택 이모지에 다시 정렬 (뽑는 중이 아닐 때만) */
window.addEventListener("resize", () => {
  if (!busy && !crackMode && slip.hidden) moveCrane();
});

/* 코인 투입구 — 클릭하면 동전이 슬롯으로 쏙 */
const coin = document.getElementById("coin");
function insertCoin() {
  const token = document.createElement("span");
  token.className = "coin-token";
  coin.appendChild(token);
  setTimeout(() => token.remove(), 560);
  // 코인 1개 = 뽑기 1회 충전
  credits += 1;
  updateCredits();
  if (!busy && !crackMode && slip.hidden) {
    hint.textContent = "코인 충전! 핑크 버튼으로 뽑아보세요";
  }
}
coin.addEventListener("click", insertCoin);
coin.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); insertCoin(); }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { move(-1); }
  else if (e.key === "ArrowRight") { move(1); }
  else if (e.key === " " || e.key === "Enter") {
    if (crackMode) { e.preventDefault(); doCrack(); }
    else if (!busy && !dropBtn.disabled) { e.preventDefault(); drawFortune(); }
  }
});

/* ===== 초기화 ===== */
function init() {
  // 배경 흐릿한 인형들
  setEmoji(document.querySelector(".plush-1"), "🐰");
  setEmoji(document.querySelector(".plush-2"), "🐻");
  setEmoji(document.querySelector(".plush-3"), "🦙");
  buildPile();
  moveCrane();
  resetBtn.style.display = "none";
  credits = 0;
  updateCredits();          // 0회 → 뽑기 버튼 비활성
  setControls(true);        // 좌우 버튼은 사용 가능
  hint.textContent = "코인을 넣어 뽑기 횟수를 충전하세요";
}

init();
