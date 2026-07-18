// Distribution queue (growth-impl.md W1-D4, CJK-first) — the OUTBOUND half the loop
// was missing for its #1 market. The CN/CJK audience arrives via Chinese AI chats
// (doubao/yuanbao ≈ half of AI referrals) and WeChat/app webviews — channels no
// on-site SEO tweak can reach. This module lets the loop PROPOSE and TRACK
// distribution posts; a human writes/approves/POSTS them.
//
//   ⚠ INVARIANT: the loop NEVER auto-posts. This file only manages queue state.
//
// Queue items live in data/distribution.json. Statuses:
//   proposed → drafted (asset in docs/posts/) → posted (postedUrl set by human) → measured
// `dropped` retires an item. Human-set fields (status, postedUrl, notes) are never
// overwritten by refresh(); lockHold is recomputed every run from the Experiment
// Ledger — if a target page is under an in-flight experiment, the item shows a hold
// (posting would muddy attribution on that page's measurement).
//
//   node scripts/growth/distribution.mjs   (or: npm run growth:distribution)

import path from 'node:path';
import { DATA_DIR, readJson, writeJsonAtomic, todayStr, pathOf, isMain } from './lib.mjs';
import { ExperimentLedger } from './ledger.mjs';

const FILE = () => path.join(DATA_DIR(), 'distribution.json');
const load = () => readJson(FILE(), { version: 1, note: 'Human-in-the-loop distribution queue — the loop proposes/tracks, a HUMAN posts. Edit status/postedUrl/notes freely; refresh() preserves them.', items: [] });
const save = (d) => writeJsonAtomic(FILE(), d);

// Deterministic seed items. Drafts already written in docs/posts/ enter as `drafted`;
// ideas without an asset enter as `proposed` (the /growth-loop agent drafts them on
// request). Adding a seed here is how the loop suggests a new outbound channel.
const SEED_ITEMS = [
  {
    id: 'wechat-zh-changtu',
    market: 'CN', channel: 'WeChat 公众号 / 小红书 / 知乎专栏',
    title: 'Markdown 一键转长图 — 公众号/小红书排版 workflow post',
    asset: 'docs/posts/wechat-zh-markdown-changtu.md',
    targets: ['/zh-Hans/markdown-zhuan-tupian', '/zh-Hans/markdown-zhuanhuan-word', '/zh-Hans/markdown-pdf-zhuanhuan'],
    angle: 'CN is the #1 audience and 100% referrer-less (WeChat webviews / AI chats) — 长图 shares natively where downloads break. Add real screenshots before posting.',
    status: 'drafted',
  },
  {
    id: 'qiita-ja-henkan',
    market: 'JP', channel: 'Qiita',
    title: 'Markdown を PDF/Word/画像に変換 — 文字化けなし how-to',
    asset: 'docs/posts/qiita-ja-markdown-henkan.md',
    targets: ['/ja/markdown-pdf-henkan', '/ja/markdown-word-henkan', '/ja/markdown-gazou-henkan'],
    angle: 'JP is the top Google-channel rescue market; Qiita ranks fast and AI assistants cite it. Add screenshots before posting.',
    status: 'drafted',
  },
  {
    id: 'velog-ko-byeonhwan',
    market: 'KR', channel: 'velog / Tistory / OKKY',
    title: '마크다운 PDF·Word·이미지 변환 — 한글 안 깨짐 how-to',
    asset: 'docs/posts/velog-ko-markdown-byeonhwan.md',
    targets: ['/ko/markdown-pdf-byeonhwan', '/ko/markdown-word-byeonhwan', '/ko/markdown-imiji-byeonhwan'],
    angle: '한글 깨짐 (tofu) pain + image hook. Add screenshots before posting.',
    status: 'drafted',
  },
  {
    id: 'zhihu-answers-zh',
    market: 'CN', channel: '知乎 answers',
    title: 'Answer live 知乎 questions on markdown转word/转pdf/转长图',
    asset: null,
    targets: ['/zh-Hans/markdown-zhuan-tupian', '/zh-Hans'],
    angle: 'Genuinely helpful step-by-step answers with ONE link — Chinese AI assistants train on 知乎, so answers compound into AI-chat visibility (doubao/yuanbao already refer users).',
    status: 'proposed',
  },
];

// Recompute experiment-lock holds for an item: any target under an in-flight
// experiment (target OR control) puts the item on hold until that measurement lands.
function lockHoldOf(item, locks) {
  const held = [];
  let until = null;
  for (const t of item.targets || []) {
    const lock = locks.get(pathOf(t));
    if (lock) {
      held.push({ target: t, expId: lock.id, measureOn: lock.measure_on });
      if (!until || (lock.measure_on || '') > until) until = lock.measure_on;
    }
  }
  return held.length ? { until, held } : null;
}

export function refreshQueue() {
  const d = load();
  const today = todayStr();
  for (const seed of SEED_ITEMS) {
    let item = d.items.find((x) => x.id === seed.id);
    if (!item) {
      d.items.push({ ...seed, added: today, updated: today, postedUrl: null, notes: null });
    } else {
      // auto fields only — never touch human-set status/postedUrl/notes
      item.asset = item.asset ?? seed.asset;
      item.targets = item.targets?.length ? item.targets : seed.targets;
    }
  }
  const locks = ExperimentLedger.lockedKeys();
  for (const item of d.items) item.lockHold = lockHoldOf(item, locks);
  save(d);
  const items = d.items.filter((x) => x.status !== 'dropped');
  const counts = {};
  for (const x of items) counts[x.status] = (counts[x.status] || 0) + 1;
  return { items, counts, pending: items.filter((x) => x.status === 'proposed' || x.status === 'drafted').length };
}

function main() {
  console.log('📣 distribution queue — human posts, the loop never auto-posts\n');
  const { items, counts } = refreshQueue();
  console.log(`   ${items.length} item(s): ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' · ') || '(empty)'}\n`);
  for (const x of items) {
    const icon = { proposed: '💡', drafted: '📝', posted: '🚀', measured: '📏' }[x.status] || '·';
    console.log(`   ${icon} [${x.market}] ${x.title}`);
    console.log(`      ${x.channel} · status ${x.status}${x.asset ? ` · draft ${x.asset}` : ''}${x.postedUrl ? ` · ${x.postedUrl}` : ''}`);
    if (x.lockHold) console.log(`      ⏸ hold until ${x.lockHold.until}: ${x.lockHold.held.map((h) => `${h.target} (exp ${h.expId})`).join(', ')} — drop those links or wait`);
  }
  console.log('\n   next: pick a drafted item, add screenshots, post it, then set status:"posted" + postedUrl in data/distribution.json');
}

if (isMain(import.meta.url)) main();
