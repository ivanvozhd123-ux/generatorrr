/* Генератор номеров — автономная локальная игра */

const CONFIG = {
  saveVersion: 1,
  start: { rubles: 100000, dollars: 100, collection: 50, vault: 10 },
  rarities: [
    { id: 'common', name: 'Обычный', chance: 65, color: '#8b96a8', min: 100, max: 5000, xp: 4 },
    { id: 'uncommon', name: 'Необычный', chance: 22, color: '#43c776', min: 5000, max: 20000, xp: 8 },
    { id: 'rare', name: 'Редкий', chance: 9, color: '#4c9dff', min: 20000, max: 100000, xp: 22 },
    { id: 'epic', name: 'Эпический', chance: 3, color: '#b66cff', min: 100000, max: 9000000, xp: 70 },
    { id: 'legendary', name: 'Легендарный', chance: .8, color: '#ffc947', min: 9000000, max: 100000000, xp: 250 },
    { id: 'mythic', name: 'Мифический', chance: .18, color: '#f05260', min: 100000000, max: 500000000, xp: 750 },
    { id: 'ultra', name: 'Ультра', chance: .02, color: '#ff5ee7', min: 500000000, max: 5000000000000000, xp: 2500 }
  ],

  countries: {
    russia: {
      name: 'Россия', flag: '🇷🇺', base: 9000, unlock: 0,
      regions: {
        'Москва (77)': 1, 'Санкт-Петербург (78)': 1.04, 'Московская область (50)': 1.02,
        'Краснодарский край (23)': .96, 'Свердловская область (66)': .98,
        'Татарстан (16)': 1.02, 'Новосибирск (54)': .95
      },
      types: { civil: 1, taxi: 1.12, police: 1.55, military: 1.45, special: 1.7, diplomatic: 2 }
    },
    belarus: {
      name: 'Беларусь', flag: '🇧🇾', base: 10500, unlock: 0,
      regions: {
        'Минск (7)': 1, 'Минская область (6)': .96, 'Брестская область (1)': .92,
        'Гомельская область (3)': .94, 'Гродненская область (4)': .94,
        'Витебская область (2)': .93, 'Могилёвская область (5)': .93
      },
      types: { civil: 1, taxi: 1.12, special: 1.5, service: 1.35 }
    },
    kazakhstan: {
      name: 'Казахстан', flag: '🇰🇿', base: 15000, unlock: 175000,
      regions: { 'Астана (01)': 1.1, 'Алматы (02)': 1.15, 'Караганда (09)': .96 },
      types: { civil: 1, commercial: 1.15, special: 1.55 }
    },
    usa: {
      name: 'США', flag: '🇺🇸', base: 26000, unlock: 420000,
      regions: { California: 1.15, 'New York': 1.2, Texas: 1, Florida: 1.04 },
      types: { civil: 1, commercial: 1.2, service: 1.55 }
    },
    germany: {
      name: 'Германия', flag: '🇩🇪', base: 37000, unlock: 800000,
      regions: { Berlin: 1.2, Bayern: 1.15, Hamburg: 1.08 },
      types: { civil: 1, commercial: 1.18, special: 1.5 }
    },
    uk: {
      name: 'Великобритания', flag: '🇬🇧', base: 49000, unlock: 1500000,
      regions: { London: 1.25, Scotland: 1.05, Wales: 1.04 },
      types: { civil: 1, commercial: 1.15, special: 1.45 }
    },
    japan: {
      name: 'Япония', flag: '🇯🇵', base: 63000, unlock: 2800000,
      regions: { Tokyo: 1.3, Osaka: 1.12, Hokkaido: 1.04 },
      types: { civil: 1, commercial: 1.18, special: 1.5 }
    }
  },

  upgrades: {
    collection: { name: 'Стеллажи коллекции', desc: 'Увеличивает место для новых номеров на 10.', base: 45000, step: 10, max: 15 },
    vault: { name: 'Укрепление сейфа', desc: 'Добавляет 5 защищённых ячеек.', base: 90000, step: 5, max: 12 },
    luck: { name: 'Сканер красоты', desc: 'Слегка увеличивает надбавку за подтверждённые признаки.', base: 110000, step: 0, max: 10 },
    income: { name: 'Экспертная оценка', desc: 'Увеличивает цену продажи на 3%.', base: 135000, step: 0, max: 10 }
  },

  dailyReward: { rubles: 30000, dollars: 5 },

  types: {
    civil: 'Гражданский', taxi: 'Такси', police: 'Полиция',
    military: 'Военный', special: 'Специальный', diplomatic: 'Дипломатический',
    service: 'Служебный', commercial: 'Коммерческий'
  }
};

if (Math.abs(CONFIG.rarities.reduce((s, r) => s + r.chance, 0) - 100) > .001) {
  throw Error('Сумма редкостей должна быть 100%');
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.floor(n));
const escapeHTML = value => String(value ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));

const LocalizationManager = {
  dict: {
    ru: { home:'Главная',collection:'Коллекция',vault:'Сейф',upgrades:'Улучшения',rarities:'Редкости',quests:'Задания',achievements:'Достижения',countries:'Страны',stats:'Статистика',settings:'Настройки' },
    en: { home:'Home',collection:'Collection',vault:'Vault',upgrades:'Upgrades',rarities:'Rarities',quests:'Quests',achievements:'Achievements',countries:'Countries',stats:'Statistics',settings:'Settings' }
  },
  apply() {
    let d = this.dict[settings.language] || this.dict.ru;
    document.documentElement.lang = settings.language;
    $$('[data-t]').forEach(e => { e.textContent = d[e.dataset.t] || e.textContent; });
  }
};

const defaultState = () => ({
  saveVersion: 1, rubles: CONFIG.start.rubles, dollars: CONFIG.start.dollars,
  collection: [], vault: [],
  capacity: { collection: CONFIG.start.collection, vault: CONFIG.start.vault },
  upgrades: { collection: 0, vault: 0, luck: 0, income: 0 },
  unlocked: ['russia', 'belarus'],
  selected: { country: 'russia', region: 'Москва (77)', type: 'civil' },
  level: 1, xp: 0, adminFreeAll: false,
  stats: { rolls: 0, spent: 0, earned: 0, sold: 0, rarities: {}, best: 0, unique: [], lastDaily: '', lastTime: Date.now(), firstSeen: [], countriesOpened: 2 },
  quests: { date: '', items: [], claimed: [] },
  achievements: [], events: [], tutorial: false, last: null
});

const defaultSettings = () => ({ theme: 'dark', language: 'ru', volume: 60, sound: true, animations: true, reduced: false, confirmRare: true, music: false });

let state; let settings; let busy = false; let revealReady = false; let selected = new Set(); let rarityMotion = 0;
let adminAuthorized = false, sandboxMode = false, sandboxBackup = null, sandboxChanceBackup = null, pendingRevealedPlate = null, debugOverlayTimer = null;

const StorageManager = {
  key: 'plate_rng_save_v1', settings: 'plate_rng_settings_v1',
  load() {
    try {
      let v = JSON.parse(localStorage.getItem(this.key));
      if (v && v.saveVersion === 1) {
        const base = defaultState();
        return Object.assign(base, v, { stats: Object.assign(base.stats, v.stats || {}), capacity: Object.assign(base.capacity, v.capacity || {}), upgrades: Object.assign(base.upgrades, v.upgrades || {}) });
      }
    } catch (e) {
      try { let b = JSON.parse(localStorage.getItem(this.key + '_backup')); if (b) return b; } catch (_) {}
      toast('Сохранение повреждено: создана новая игра');
    }
    return defaultState();
  },
  save() {
    if (sandboxMode) { setDebugOutput('Sandbox Mode активен: сохранение отключено, изменения останутся временными.'); return; }
    try { localStorage.setItem(this.key + '_backup', localStorage.getItem(this.key) || ''); localStorage.setItem(this.key, JSON.stringify(state)); } catch (e) { toast('Не удалось сохранить прогресс'); }
  },
  loadSettings() { try { return Object.assign(defaultSettings(), JSON.parse(localStorage.getItem(this.settings)) || {}); } catch (e) { return defaultSettings(); } },
  saveSettings() { localStorage.setItem(this.settings, JSON.stringify(settings)); }
};

const AudioManager = {
  ctx: null,
  play(type = 'click') {
    if (!settings.sound) return;
    try {
      this.ctx ??= new AudioContext();
      let o = this.ctx.createOscillator(); let g = this.ctx.createGain();
      o.frequency.value = type === 'rare' ? 660 : type === 'sell' ? 220 : 440;
      g.gain.value = settings.volume / 100 * .035;
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + (type === 'rare' ? .25 : .06));
    } catch (e) {}
  }
};


const RaritySystem = {

  /*
   * Пороги beautyScore для «апгрейда» редкости.
   * Если выпала редкость X, но beautyScore номера очень высок,
   * есть шанс получить редкость X+1.
   * Это делает «красивые» номера действительно ценнее.
   */
  UPGRADE_TABLE: [
    // [fromId,  minScore, chanceOfUpgrade]
    ['common',   6,  0.35],   // красивый обычный → может стать необычным
    ['common',   14, 0.70],
    ['uncommon', 8,  0.25],   // красивый необычный → редкий
    ['uncommon', 16, 0.55],
    ['rare',     10, 0.20],
    ['rare',     22, 0.45],
    ['epic',     14, 0.15],
    ['epic',     26, 0.35],
    ['legendary',18, 0.10],
    ['legendary',28, 0.25],
    ['mythic',   22, 0.08],
  ],

  pick() {
    let x = Math.random() * 100;
    for (const r of CONFIG.rarities) {
      x -= r.chance;
      if (x <= 0) return r;
    }
    return CONFIG.rarities[0];
  },

  /* Применяет возможный апгрейд на основе beautyScore */
  applyBeautyUpgrade(rarity, beautyScore) {
    const idx = CONFIG.rarities.findIndex(r => r.id === rarity.id);
    if (idx < 0 || idx >= CONFIG.rarities.length - 1) return rarity;

    // Ищем лучшее подходящее правило для этой редкости
    const rules = this.UPGRADE_TABLE
      .filter(([from, minScore]) => from === rarity.id && beautyScore >= minScore)
      .sort((a, b) => b[2] - a[2]); // сортируем по убыванию шанса

    if (!rules.length) return rarity;

    const [, , chance] = rules[0];
    if (Math.random() < chance) {
      return CONFIG.rarities[idx + 1]; // апгрейд на одну ступень
    }

    return rarity;
  },

  get(id) {
    return CONFIG.rarities.find(r => r.id === id) || CONFIG.rarities[0];
  },

  /* bands используются только для совместимости со старым кодом */
  bands: [
    ['common',    0,   4],
    ['uncommon',  4,   8],
    ['rare',      8,  12],
    ['epic',     12,  18],
    ['legendary',18,  24],
    ['mythic',   24,  28],
    ['ultra',    28, Infinity]
  ],

  band(id) {
    return this.bands.find(x => x[0] === id) || this.bands[0];
  },

  classify(analysis) {
    const score = analysis?.beautyScore || 0;
    const b = this.bands.find(([, min, max]) => score >= min && score < max) || this.bands[0];
    return this.get(b[0]);
  }
};

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function choice(a) { return a[Math.floor(Math.random() * a.length)]; }
function chars(n, alphabet = 'ABEKMHOPCTYX') { return Array.from({ length: n }, () => choice(alphabet)).join(''); }
function digits(n) { return Array.from({ length: n }, () => rand(0, 9)).join(''); }
function differentChars(n, alphabet = 'ABEKMHOPCTYX') { let pool = [...alphabet]; let result = ''; while (result.length < n && pool.length) { result += pool.splice(rand(0, pool.length - 1), 1)[0]; } return result; }

function analyzeNumber(number) {
  const value = String(number ?? '').trim();
  const parts  = value.split(/\s+/);
  const last   = parts.at(-1) || '';

  /* Определяем регион и ядро */
  const isRuRegion =
    parts.length > 1 &&
    /^\d{1,3}$/.test(last) &&
    (
      parts.length >= 3 ||
      /^[A-ZА-ЯЁ]\d{3}[A-ZА-ЯЁ]{2}$/i.test(parts[0]) ||
      /^\d{4}$/.test(parts[0]) ||
      /^[A-ZА-ЯЁ]{2}\d{3}$/i.test(parts[0])
    );

  const hyphenRegion = parts.length > 1 && /-\d{1,3}$/.test(last);

  const region = isRuRegion
    ? last
    : hyphenRegion
      ? (last.match(/-(\d{1,3})$/) || [])[1] || ''
      : '';

  const core = isRuRegion
    ? parts.slice(0, -1).join(' ')
    : hyphenRegion
      ? [...parts.slice(0, -1), last.replace(/-\d{1,3}$/, '')].join(' ')
      : value;

  /* Нормализуем кириллицу → латиница для единообразия */
  const cyr2lat = {
    А:'A', В:'B', Е:'E', К:'K', М:'M', Н:'H',
    О:'O', Р:'P', С:'C', Т:'T', У:'Y', Х:'X'
  };
  const normCore = core.toUpperCase()
    .replace(/[АВЕКМНОРСТУХ]/g, c => cyr2lat[c] || c);

  const numberDigits = (core.match(/\d/g) || []).join('');
  const letters      = (normCore.match(/[A-Z]/g) || []).join('');

  /* ── счётчики ── */
  const dCount = {};
  for (const d of numberDigits) dCount[d] = (dCount[d] || 0) + 1;
  const lCount = {};
  for (const l of letters)      lCount[l] = (lCount[l] || 0) + 1;

  const maxDigitRep  = Math.max(0, ...Object.values(dCount));
  const maxLetterRep = Math.max(0, ...Object.values(lCount));

  /* ── признаки ── */

  // Фулл-блат: ВСЕ цифры одинаковы И все буквы одинаковы (не одна)
  // Пример А111АА: цифры «111» (одна уникальная), буквы «А»+«АА» = «ААА» (одна уникальная) ✓
  const fullHouse =
    numberDigits.length >= 3 &&
    letters.length >= 2 &&
    new Set(numberDigits).size === 1 &&
    new Set(letters).size === 1;

  const quadDigit  = maxDigitRep >= 4;
  const tripleDigit = !quadDigit && maxDigitRep === 3;
  // пара — только если нет трёх и нет квада
  const pairDigit  = !tripleDigit && !quadDigit && maxDigitRep === 2;

  const tripleLetter = maxLetterRep >= 3;
  const pairLetter   = !tripleLetter && maxLetterRep === 2;

  // Палиндром цифр (минимум 3 цифры)
  const digitPalindrome =
    numberDigits.length >= 3 &&
    numberDigits === [...numberDigits].reverse().join('');

  // Зеркало букв
  const letterPalindrome =
    letters.length >= 3 &&
    letters === [...letters].reverse().join('');

  // Последовательность (возр. или убыв.), минимум 3 цифры подряд
  const sequence =
    numberDigits.length >= 3 &&
    (
      /012|123|234|345|456|567|678|789/.test(numberDigits) ||
      /987|876|765|654|543|432|321|210/.test(numberDigits)
    );

  // Повторяющийся блок AABB или ABAB (4 цифры)
  const blockPattern =
    numberDigits.length === 4 && (
      /^(..)(\1)$/.test(numberDigits) ||   // ABAB
      /^(.)\1(.)\2$/.test(numberDigits)    // AABB
    );

  // Повтор цифр вообще (любой)
  const digitRepeated  = maxDigitRep >= 2;
  const letterRepeated = maxLetterRep >= 2;

  // Красивый регион (111, 77, 99, 777…)
  const regionPattern =
    region.length > 0 && (
      /^(\d)\1+$/.test(region) ||           // 77, 99, 777
      /^(\d)\1\d$/.test(region) ||          // 779
      ['77','78','97','98','99','177','178','197','198','199',
       '777','797','799','977'].includes(region)
    );

  // Коллекционные серии АМР, ЕКХ, ООО, МММ
  const brand =
    /^A\d{3}MP$/i.test(normCore.replace(/\s/g,'')) ? 'АМР' :
    /^E\d{3}KH$/i.test(normCore.replace(/\s/g,'')) ? 'ЕКХ' :
    /^M\d{3}MM$/i.test(normCore.replace(/\s/g,'')) ? 'МММ' :
    /^O\d{3}OO$/i.test(normCore.replace(/\s/g,'')) ? 'ООО' :
    null;

  const officialRF =
    brand === 'АМР' &&
    ['77','97','99','177','197','199','777','797','799','977'].includes(region);

  /* ── итоговый список признаков (в порядке приоритета) ── */
  const FEATURE_DEFS = [
    { id:'fullHouse',      flag: fullHouse,      score: 28, label: 'Фуллблат — все символы одинаковы' },
    { id:'officialRF',     flag: officialRF,     score: 22, label: 'Коллекционная серия АМР (Москва)' },
    { id:'quadDigit',      flag: quadDigit,      score: 18, label: 'Четыре одинаковые цифры' },
    { id:'brand',          flag: !!brand && !officialRF, score: 14, label: brand ? `Специальная серия ${brand}` : '' },
    { id:'digitPalindrome',flag: digitPalindrome, score: 10, label: 'Цифровой палиндром' },
    { id:'tripleDigit',    flag: tripleDigit,    score: 8,  label: 'Три одинаковые цифры' },
    { id:'tripleLetter',   flag: tripleLetter,   score: 6,  label: 'Три одинаковые буквы' },
    { id:'letterPalindrome',flag:letterPalindrome,score:5,  label: 'Зеркальные буквы' },
    { id:'blockPattern',   flag: blockPattern,   score: 5,  label: 'Повторяющийся блок цифр' },
    { id:'sequence',       flag: sequence,       score: 4,  label: 'Цифровая последовательность' },
    { id:'pairDigit',      flag: pairDigit,      score: 2,  label: 'Повторяющиеся цифры' },
    { id:'pairLetter',     flag: pairLetter,     score: 1,  label: 'Повторяющиеся буквы' },
    { id:'regionPattern',  flag: regionPattern,  score: 2,  label: 'Красивый код региона' },
  ];

  // Берём только сработавшие признаки
  const features = FEATURE_DEFS.filter(f => f.flag);

  // beautyScore = сумма очков сработавших признаков
  // НО: исключаем «малые» если есть «большой» того же класса
  // (не суммируем pairDigit + tripleDigit + quadDigit — берём только лучший)
  const digitClass  = features.filter(f => ['pairDigit','tripleDigit','quadDigit','fullHouse'].includes(f.id));
  const letterClass = features.filter(f => ['pairLetter','tripleLetter','fullHouse'].includes(f.id));
  const palindromeClass = features.filter(f => ['digitPalindrome','letterPalindrome'].includes(f.id));

  // Из каждого класса берём только лучший (с наибольшим score)
  const pick = arr => arr.length ? [arr.reduce((a,b) => b.score > a.score ? b : a)] : [];

  const dedupedIds = new Set([
    ...pick(digitClass).map(f=>f.id),
    ...pick(letterClass).map(f=>f.id),
    ...pick(palindromeClass).map(f=>f.id),
    // остальные признаки — без дедупликации
    ...features
      .filter(f => !['pairDigit','tripleDigit','quadDigit',
                     'pairLetter','tripleLetter',
                     'digitPalindrome','letterPalindrome'].includes(f.id))
      .map(f=>f.id)
  ]);

  const finalFeatures = FEATURE_DEFS.filter(f => dedupedIds.has(f.id) && f.flag);

  const beautyScore = finalFeatures.reduce((s, f) => s + f.score, 0);

  const primary = finalFeatures[0] || { id:'ordinary', label:'Стандартная комбинация' };
  const additional = finalFeatures.slice(1).map(f => f.label).filter(Boolean);

  /* ── описание в зависимости от суммарного балла ── */
  let description;
  if (beautyScore === 0) {
    description = 'Обычная комбинация без особых признаков';
  } else if (beautyScore <= 3) {
    description = primary.label + ' — небольшая коллекционная ценность';
  } else if (beautyScore <= 8) {
    description = primary.label + ' — заметная комбинация';
  } else if (beautyScore <= 15) {
    description = primary.label + ' — редкая визуально привлекательная комбинация';
  } else if (beautyScore <= 22) {
    description = primary.label + ' — высоко ценится коллекционерами';
  } else {
    description = primary.label + ' — исключительная коллекционная ценность';
  }

  /* Сборка итогового объекта — сохраняем все старые поля для совместимости */
  const checks = Object.fromEntries(FEATURE_DEFS.map(f => [f.id, f.flag]));

  return {
    number: value, core, digits: numberDigits, letters, region,
    checks,
    features:            finalFeatures,
    primaryDescription:  primary.label,
    additionalFeatures:  additional,
    description,
    beautyScore,
    brand, officialRF,
    /* legacy-поля (используются в коде) */
    digitRepeated,  letterRepeated,
    digitPair:  pairDigit,   letterPair: pairLetter,
    digitPalindrome, digitMirror: digitPalindrome,
    letterPalindrome,
    tripleDigit, quadDigit, tripleLetter,
    fullHouse, sequence, blockPattern, regionPattern,
  };
}

function runNumberAnalysisTests() {
  const cases = [['491',a=>!a.digitPalindrome&&!a.digitRepeated&&!a.letterRepeated],['121',a=>a.digitPalindrome&&a.digitRepeated],['777',a=>a.digitPalindrome&&a.tripleDigit&&a.digitRepeated],['1221',a=>a.digitPalindrome&&a.digitRepeated],['С491ЕЕ 77',a=>a.letterRepeated&&!a.digitRepeated&&!a.digitPalindrome&&a.primaryDescription==='Повторяющиеся буквы'],['А111АА 77',a=>a.fullHouse&&a.digitRepeated&&a.letterRepeated],['А398СР 77',a=>!a.digitRepeated&&!a.digitPalindrome&&!a.tripleDigit&&!a.fullHouse],['А517СУ 77',a=>!a.digitRepeated&&!a.digitPalindrome&&!a.tripleDigit&&!a.fullHouse],['T971BY 77',a=>!a.digitRepeated&&!a.digitPalindrome&&!a.tripleDigit&&!a.fullHouse],['М879ММ 77',a=>a.tripleLetter&&a.letterPalindrome&&!a.digitPalindrome&&!a.tripleDigit]];
  const failures = cases.filter(([sample,check]) => !check(analyzeNumber(sample))).map(([sample]) => sample);
  return { passed: cases.length - failures.length, total: cases.length, failures };
}
if (typeof window !== 'undefined') { window.runNumberAnalysisTests = runNumberAnalysisTests; }

const NumberGenerator = {
  generate(country, type, region, target = 'common') {
    let num; let style = { bg: '#f7f7f7', fg: '#111' };
    let code = (region.match(/\(([^)]+)\)/) || [])[1] || region.slice(0, 2).toUpperCase();
    if (country === 'russia') {
      const alphabet = 'ABEKMHOPCTYX';
      const single = () => differentChars(1, alphabet);
      const plain = () => single() + differentChars(3, '0123456789') + differentChars(2, alphabet);
      const pair = () => { let a = String(rand(0,9)); let b = String(rand(0,9)); while(a===b)b=String(rand(0,9)); return a+a+b; };
      const palindrome = () => { let a = String(rand(0,9)); let b = String(rand(0,9)); while(a===b)b=String(rand(0,9)); return a+b+a; };
      const same = () => String(rand(0,9)).repeat(3);
      const official = ['77','97','99','177','197','199','777','797','799','977'].includes(code);
      if (type === 'civil') {
        if (target==='uncommon') num=single()+pair()+differentChars(2,alphabet)+' '+code;
        else if (target==='rare') num=single()+palindrome()+differentChars(2,alphabet)+' '+code;
        else if (target==='epic') num=single()+same()+differentChars(2,alphabet)+' '+code;
        else if (target==='legendary') num=official?'A'+differentChars(3,'0123456789')+'MP '+code:'E'+same()+'KH '+code;
        else if (target==='mythic') num=official?'A'+same()+'MP '+code:'E'+same()+'KH '+code;
        else if (target==='ultra') { let l=single(); let d=String(rand(0,9)); num=l+d.repeat(3)+l+l+' '+code; }
        else num=plain()+' '+code;
      } else if (type==='diplomatic') num='CD '+digits(3)+' '+code;
      else if (type==='police') num=(target==='mythic'?String(rand(0,9)).repeat(4):digits(4))+' '+code;
      else if (type==='military') num=chars(2)+digits(3)+' '+code;
      else num=plain()+' '+code;
      style = { bg: '#f5f5f2', fg: '#161616' };
    } else if (country==='belarus') { num=chars(2,'ABEKMHTX')+' '+digits(4)+'-'+code; style={bg:'#fff',fg:'#151515'}; }
    else if (country==='usa') { num=type==='commercial'?digits(3)+'-'+chars(3):chars(3,'ABCDEFGHJKLMNPRSTUVWXYZ')+' '+digits(3); style={bg:'#e8f1fb',fg:'#153d78'}; }
    else if (country==='germany') { num=code.slice(0,2).toUpperCase()+' '+chars(rand(1,2),'ABCDEFGHJKLMNPRSTUVWXYZ')+' '+digits(rand(1,4)); style={bg:'#f4f4f4',fg:'#111'}; }
    else if (country==='uk') { num=chars(2,'ABCDEFGHJKLMNPRSTUVWXYZ')+digits(2)+' '+chars(3,'ABCDEFGHJKLMNPRSTUVWXYZ'); style={bg:'#ffe736',fg:'#111'}; }
    else if (country==='japan') { num=choice(['品川','大阪','札幌'])+' '+digits(3)+' '+digits(2)+'-'+digits(2); style={bg:'#fafafa',fg:'#18202c'}; }
    else { num=digits(3)+' '+chars(3,'ABEKMHOPCTYX')+' '+code; style={bg:'#f5f5f5',fg:'#141414'}; }
    let beauty = analyzeNumber(num);
    return { combination: num, style, beauty };
  }
};

const PriceCalculator = {

  value(rarity, analysis, country, type, combination = '') {
    /* Детерминированный хэш — одна и та же комбинация всегда даёт одинаковую цену */
    let hash = 2166136261;
    for (const char of `${country}|${type}|${combination}`) {
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
    }

    const score = Number(analysis?.beautyScore) || 0;
    const [, bandMin, bandMax] = RaritySystem.band(rarity.id);

    /*
     * position: 0..1 — где внутри ценового диапазона находится номер.
     * Используем S-образную кривую (сглаженную), а не линейную —
     * большинство номеров в средней части, исключительные на краях.
     */
    const bandSpan  = bandMax === Infinity ? 30 : (bandMax - bandMin);
    const rawPos    = bandSpan > 0
      ? Math.max(0, Math.min(1, (score - bandMin) / bandSpan))
      : 0.5;

    // Сглаживание: smoothstep
    const smoothPos = rawPos * rawPos * (3 - 2 * rawPos);

    // Случайный разброс ±8% на основе хэша (детерминирован)
    const noise = ((hash % 10007) / 10007 - 0.5) * 0.16;

    // Бонус за прокачку улучшения «luck»
    const luckBonus = (state.upgrades.luck || 0) * 0.005;

    const position = Math.max(0.02, Math.min(0.98, smoothPos + noise + luckBonus));

    /* Для ultra используем логарифмическую шкалу (диапазон огромный) */
    let raw;
    if (rarity.id === 'ultra') {
      raw = Math.floor(
        rarity.min * Math.pow(rarity.max / rarity.min, position)
      );
    } else {
      raw = Math.floor(rarity.min + (rarity.max - rarity.min) * position);
    }

    /* Красивое округление — реальные коллекционеры ценят «круглые» числа */
    const tail = 37 + (hash % 963);

    return Math.max(rarity.min, Math.min(rarity.max, raw + tail));
  },

  sell(v) {
    /* Продажная цена: 28–34% от коллекционной, бонус за income-улучшение */
    const base = 0.28 + (state.upgrades.income || 0) * 0.03;
    return Math.max(1, Math.floor(v * Math.min(base, 0.55)));
  }
};

const EconomyManager = {
  can(v) { return Number.isFinite(v) && v >= 0 && state.rubles >= v; },
  add(v, why) {
    const requested = Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
    const before = state.rubles;
    state.rubles = Math.min(Number.MAX_SAFE_INTEGER, before + requested);
    const gained = state.rubles - before;
    state.stats.earned = Math.min(Number.MAX_SAFE_INTEGER, (state.stats.earned || 0) + gained);
    if (why) { log(gained < requested ? `${why} (достигнут лимит игрового баланса)` : why); }
    return gained;
  },
  spend(v) {
    if (!Number.isFinite(v) || v < 0 || !this.can(v)) return false;
    state.rubles -= v; state.stats.spent = Math.min(Number.MAX_SAFE_INTEGER, (state.stats.spent || 0) + v);
    return true;
  }
};

function cost() { let s = state.selected; let c = CONFIG.countries[s.country]; return Math.round(c.base * c.regions[s.region] * c.types[s.type]); }
function xpNeed() { return 100 + state.level * 70; }
function gainXP(n) {
  if (!Number.isFinite(n) || n <= 0) return;
  state.xp += Math.floor(n);
  let levelsGained = 0;
  let rewardTotal = 0;
  while (state.xp >= xpNeed()) {
    state.xp -= xpNeed();
    state.level++;
    levelsGained++;
    rewardTotal += state.level * 6000;
  }
  if (levelsGained) {
    EconomyManager.add(rewardTotal, `Награда за ${levelsGained} уровн. прогресса: +${fmt(rewardTotal)} ₽`);
    toast(`Новый уровень: ${state.level}! +${fmt(rewardTotal)} ₽`);
    AudioManager.play('rare');
  }
  updateLevelUI();
}

function makePlate() {
  const s = state.selected;
  const baseRarity = RaritySystem.pick();
  const g = NumberGenerator.generate(s.country, s.type, s.region, baseRarity.id);
  const beauty = analyzeNumber(g.combination);
  const rarity = RaritySystem.applyBeautyUpgrade(baseRarity, beauty.beautyScore);
  const val = PriceCalculator.value(rarity, beauty, s.country, s.type, g.combination);
  const comboKey = `${s.country}|${g.combination}`;
  const duplicate = state.stats.unique.includes(comboKey);
  return {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    country: s.country,
    region: s.region,
    type: s.type,
    rarity: rarity.id,
    value: val,
    date: new Date().toISOString(),
    duplicate,
    description: (duplicate ? 'Дубликат. ' : '') + beauty.description,
    additionalFeatures: beauty.additionalFeatures,
    beautyScore: beauty.beautyScore,
    wasUpgraded: rarity.id !== baseRarity.id,
    baseRarityId: baseRarity.id,
    baseChance: baseRarity.chance,
    ...g,
    beauty
  };
}

function updateRarityScale(id, animate = false, duration = 120) {
  let root = $('#rarityScale'); let labels = $('#rarityScaleLabels');
  if (!root || !labels) return;
  const run = ++rarityMotion;
  const index = CONFIG.rarities.findIndex(r => r.id === id);
  const target = index < 0 ? 0 : (index + .5) / CONFIG.rarities.length * 100;
  labels.innerHTML = CONFIG.rarities.map((r, i) => `<span class="rarity-scale__label" style="--step-color:${r.color}" title="${r.name}"><span class="rarity-scale__full">${r.name}</span><span class="rarity-scale__short">${['Обыч.','Необыч.','Редкий','Эпик','Легенд.','Миф','Ультра'][i]}</span></span>`).join('');
  root.dataset.rarity = id || '';
  root.style.setProperty('--rarity-color', index >= 0 ? CONFIG.rarities[index].color : '#8b96a8');
  root.style.setProperty('--scale-duration', `${duration}ms`);
  root.classList.toggle('is-sweeping', animate);
  root.style.setProperty('--scale-progress', animate ? '0%' : `${target}%`);
  labels.querySelectorAll('.rarity-scale__label').forEach((node, i) => { node.classList.toggle('is-passed', index >= i && index >= 0); node.classList.toggle('is-current', index === i); });
  if (animate) { requestAnimationFrame(() => { if (run === rarityMotion) root.style.setProperty('--scale-progress', `${target}%`); }); setTimeout(() => { if (run === rarityMotion) root.classList.remove('is-sweeping'); }, duration); }
}

function finishRoll(p) {
  const comboKey = `${p.country}|${p.combination}`;
  p.duplicate = state.stats.unique.includes(comboKey);
  if (!p.duplicate) state.stats.unique.push(comboKey);
  const baseDescription = p.beauty?.description || p.description || 'Стандартная комбинация';
  p.description = (p.duplicate ? 'Дубликат. ' : '') + baseDescription.replace(/^Дубликат\.\s*/, '');
  state.collection.push(p); state.last = p;
  state.stats.rolls++; state.stats.rarities[p.rarity] = (state.stats.rarities[p.rarity] || 0) + 1; state.stats.best = Math.max(state.stats.best, p.value);
  if (!state.stats.firstSeen.includes(p.rarity)) state.stats.firstSeen.push(p.rarity);
  gainXP(RaritySystem.get(p.rarity).xp);
  log(`Найден номер ${p.combination} (${RaritySystem.get(p.rarity).name})`);
  progress(); checkAchievements(); StorageManager.save();
  busy = false; $('#rollStage').classList.remove('is-rolling');
  render();
  AudioManager.play(['epic','legendary','mythic','ultra'].includes(p.rarity) ? 'rare' : 'click');
  if (['epic','legendary','mythic','ultra'].includes(p.rarity)) { reveal(p); } else { toast(`Новый номер: ${p.combination}`); }
}

function roll() {
  if (busy || $('#rareReveal').classList.contains('show')) return;
  if (state.collection.length >= state.capacity.collection) return toast('В коллекции нет места — продайте номер или улучшите стеллажи.');
  let c = pendingRevealedPlate?._rollCost ?? cost();
  if (!state.adminFreeAll && !EconomyManager.spend(c)) return toast('Недостаточно рублей для выбивания.');
  if (state.adminFreeAll) log('Free All: генерация без списания рублей');
  busy = true; $('#rollBtn').disabled = true;
  let p = pendingRevealedPlate || makePlate();
  pendingRevealedPlate = null;
  if (p._rollCost != null) delete p._rollCost;
  let duration = settings.reduced ? 60 : settings.animations ? 120 : 0;
  updateRarityScale(p.rarity, duration > 0, duration);
  finishRoll(p);
}

const InventoryManager = {
  move(id, from, to) {
    let a = state[from]; let b = state[to]; let cap = state.capacity[to];
    let i = a.findIndex(x => x.id === id);
    if (i < 0) return;
    if (b.length >= cap) return toast(to === 'vault' ? 'Сейф заполнен.' : 'Коллекция заполнена.');
    b.push(a.splice(i, 1)[0]);
    log(to === 'vault' ? 'Номер помещён в сейф' : 'Номер возвращён в коллекцию');
    checkAchievements(); saveRender();
  },
  sell(ids) {
    let items = state.collection.filter(p => ids.includes(p.id));
    if (!items.length) return;
    if (settings.confirmRare && items.some(p => ['epic','legendary','mythic','ultra'].includes(p.rarity)) && !confirm('Среди выбранного есть редкие номера. Продать?')) return;
    let sum = items.reduce((s, p) => s + PriceCalculator.sell(p.value), 0);
    state.collection = state.collection.filter(p => !ids.includes(p.id));
    items.forEach(p => selected.delete(p.id));
    EconomyManager.add(sum, `Продано номеров: ${items.length}`);
    state.stats.sold += items.length;
    gainXP(items.length * 3); progress(); checkAchievements();
    toast(`Продано за ${fmt(sum)} ₽`); AudioManager.play('sell');
    saveRender();
  }
};

function upgradeCost(id) { let u = CONFIG.upgrades[id]; let l = state.upgrades[id]; return Math.floor(u.base * Math.pow(1.7, l)); }
function buyUpgrade(id) {
  let u = CONFIG.upgrades[id]; let l = state.upgrades[id]; let price = upgradeCost(id);
  if (l >= u.max) return toast('Максимальный уровень улучшения.');
  if (!state.adminFreeAll && !EconomyManager.spend(price)) return toast('Недостаточно рублей.');
  state.upgrades[id]++;
  if (id === 'collection') state.capacity.collection += u.step;
  if (id === 'vault') state.capacity.vault += u.step;
  gainXP(30); log(`Улучшение «${u.name}» повышено`); checkAchievements(); saveRender();
}

function today() { return new Date().toISOString().slice(0, 10); }
function quests() {
  let d = today();
  if (state.quests.date !== d) {
    state.quests = { date: d, claimed: [], items: [{ id:'roll',name:'Смена в генераторе',desc:'Выбейте 5 номеров.',target:5,reward:25000 },{ id:'sell',name:'Чистая коллекция',desc:'Продайте 3 номера.',target:3,reward:18000 },{ id:'rare',name:'Охота за цветом',desc:'Получите необычный или редкий номер.',target:1,reward:30000 }] };
    StorageManager.save();
  }
  return state.quests.items;
}

function questProgress(q) {
  if (q.id==='roll') return state.stats.rolls;
  if (q.id==='sell') return state.stats.sold;
  return (state.stats.rarities.uncommon||0)+(state.stats.rarities.rare||0)+(state.stats.rarities.epic||0)+(state.stats.rarities.legendary||0)+(state.stats.rarities.mythic||0)+(state.stats.rarities.ultra||0);
}

function claimQuest(id) {
  let q = quests().find(x => x.id === id);
  if (!q || state.quests.claimed.includes(id) || questProgress(q) < q.target) return;
  state.quests.claimed.push(id);
  EconomyManager.add(q.reward, `Награда за задание «${q.name}»`); gainXP(40); toast(`Получено ${fmt(q.reward)} ₽`); saveRender();
}

function daily() {
  let t = today();
  if (state.stats.lastDaily === t) return toast('Ежедневная награда уже получена.');
  let now = Date.now();
  if (now + 3600000 < state.stats.lastTime) return toast('Проверка времени: награда временно недоступна.');
  state.stats.lastDaily = t; state.stats.lastTime = now;
  EconomyManager.add(CONFIG.dailyReward.rubles, 'Ежедневная награда'); state.dollars += CONFIG.dailyReward.dollars;
  gainXP(25); toast(`Ежедневная награда: ${fmt(CONFIG.dailyReward.rubles)} ₽ и $${CONFIG.dailyReward.dollars}`); saveRender();
}

const ACH = [
  ['first','Первый номер','Получите первый номер.',s=>s.stats.rolls>=1,5000],
  ['roll10','Разгон','Сделайте 10 генераций.',s=>s.stats.rolls>=10,10000],
  ['roll100','Сотня находок','Сделайте 100 генераций.',s=>s.stats.rolls>=100,50000],
  ['roll500','Настоящий искатель','Сделайте 500 генераций.',s=>s.stats.rolls>=500,250000],
  ['sell','Первая сделка','Продайте номер.',s=>s.stats.sold>=1,5000],
  ['vault','Под защитой','Поместите номер в сейф.',s=>s.vault.length>=1,10000],
  ['rare','Редкое везение','Найдите редкий номер.',s=>(s.stats.rarities.rare||0)>=1,25000],
  ['epic','Эпический миг','Найдите эпический номер.',s=>(s.stats.rarities.epic||0)>=1,100000],
  ['legend','Золотая удача','Найдите легендарный номер.',s=>(s.stats.rarities.legendary||0)>=1,500000],
  ['myth','Красная аура','Найдите мифический номер.',s=>(s.stats.rarities.mythic||0)>=1,1000000],
  ['ultra','За гранью шанса','Найдите ультра номер.',s=>(s.stats.rarities.ultra||0)>=1,5000000],
  ['million','Миллионер','Накопите миллион рублей.',s=>s.rubles>=1e6,100000],
  ['capital','Капитал','Накопите 10 миллионов рублей.',s=>s.rubles>=1e7,500000],
  ['col25','Коллекционер','Храните 25 номеров.',s=>s.collection.length>=25,30000],
  ['col50','Архивариус','Храните 50 номеров.',s=>s.collection.length>=50,75000],
  ['safe','Полный сейф','Заполните сейф.',s=>s.vault.length>=s.capacity.vault,80000],
  ['countries','Путешественник','Откройте все страны.',s=>s.unlocked.length===Object.keys(CONFIG.countries).length,500000],
  ['unique','Неповторимый стиль','Соберите 25 уникальных комбинаций.',s=>s.stats.unique.length>=25,50000],
  ['types','Мастер форматов','Найдите 5 разных типов.',s=>new Set([...s.collection,...s.vault].map(x=>x.type)).size>=5,50000],
  ['upgrades','Инфраструктура','Купите 10 улучшений.',s=>Object.values(s.upgrades).reduce((a,b)=>a+b,0)>=10,150000],
  ['maxup','Максимум места','Полностью улучшите стеллажи.',s=>s.upgrades.collection>=CONFIG.upgrades.collection.max,1000000]
];

function checkAchievements() {
  ACH.forEach(([id,name,desc,test,reward]) => {
    if (!state.achievements.includes(id) && test(state)) {
      state.achievements.push(id); EconomyManager.add(reward, `Достижение «${name}»`); log(`Открыто достижение: ${name}`); toast(`★ Достижение: ${name}`);
    }
  });
}

function progress() { quests(); state.stats.lastTime = Math.max(state.stats.lastTime || 0, Date.now()); }
function log(t) { state.events.unshift({ t, time: Date.now() }); state.events = state.events.slice(0, 25); }
function saveRender() { StorageManager.save(); render(); }

function plateMarkup(p, large = false) {
  let isRu = p.country === 'russia';
  let parts = String(p.combination || '').trim().split(/\s+/);
  let body = parts.slice(0, -1).join(' ') || parts[0] || '';
  let region = parts.length > 1 ? parts.at(-1) : '';
  if (isRu) {
    return `<div class="platevisual realplate ${large ? 'plate-xl' : ''}"><span class="plate-main">${escapeHTML(body)}</span><span class="plate-region"><b>${escapeHTML(region)}</b><em>RUS</em><i class="flag-ru"></i></span></div>`;
  }
  return `<div class="platevisual ${large ? 'plate-xl' : ''}" style="--platebg:${escapeHTML(p.style?.bg || '#f5f5f5')};--platefg:${escapeHTML(p.style?.fg || '#111')}">${escapeHTML(p.combination)}</div>`;
}

function plateCard(p, place) {
  let r = RaritySystem.get(p.rarity);
  let locked = place === 'vault';
  let move = locked ? 'Вернуть' : 'В сейф';
  let actions = locked ? `<button data-move="${p.id}" data-from="vault" data-to="collection">${move}</button>` : `<button data-move="${p.id}" data-from="collection" data-to="vault">${move}</button><button data-sell="${p.id}" class="danger">Продать</button>`;
  return `<article class="platecard rarity-${p.rarity} ${selected.has(p.id) ? 'selected' : ''}" style="--rarity:${r.color}">${!locked?`<input type="checkbox" data-check="${p.id}" ${selected.has(p.id)?'checked':''}>`:''}
    <b style="color:${r.color}">${r.name}</b>${plateMarkup(p)}<div class="plateinfo"><span>${CONFIG.countries[p.country].name} · ${CONFIG.types[p.type]}</span><span>${new Date(p.date).toLocaleDateString('ru-RU')}</span></div><div class="platevalue">${fmt(p.value)} ₽ ${p.duplicate?'· Дубликат':''}</div><small>${p.description}</small><div class="plateactions">${actions}</div></article>`;
}

function render() {
  document.body.querySelector('#app').className = `theme-${settings.theme}`;
  LocalizationManager.apply();
  $('#rubles').textContent = fmt(state.rubles); $('#dollars').textContent = fmt(state.dollars);
  $('#level').textContent = state.level; $('#xpBar').style.width = `${state.xp / xpNeed() * 100}%`;
  updateLevelUI();
  $('#capacity').textContent = `${state.collection.length} / ${state.capacity.collection}`;
  renderSelectors();
  $('#rollCost').textContent = `${fmt(cost())} ₽`; $('#rollBtn').disabled = busy;
  let country = CONFIG.countries[state.selected.country];
  let region = (state.selected.region.match(/\(([^)]+)\)/) || [])[1] || '';
  $('#stageCountry').textContent = `${country.flag} ${country.name} · ${region}`;
  const isUltraLast = state.last?.rarity === 'ultra';
  $('#rollStage').classList.toggle('is-ultra', isUltraLast);
  $('#stageRarity').classList.toggle('ultra-rainbow-text', isUltraLast);
  $('#stageValue').classList.toggle('ultra-rainbow-text', isUltraLast);
  if (state.last) {
    let r = RaritySystem.get(state.last.rarity);
    $('#stagePlate').innerHTML = plateMarkup(state.last, true); $('#stageRarity').textContent = r.name.toUpperCase(); $('#stageRarity').style.color = r.color; $('#stageValue').textContent = `${fmt(state.last.value)} ₽`; $('#stageValue').style.color = r.color; $('#stageDescription').textContent = state.last.description; $('#rollStage').style.setProperty('--glow', r.color);
  } else {
    $('#stagePlate').innerHTML = '<div class="stage-placeholder">Коснитесь экрана,<br>чтобы выбить номер</div>'; $('#stageRarity').textContent = 'ГОТОВ К ВЫПУСКУ'; $('#stageRarity').style.color = ''; $('#stageValue').textContent = '— ₽'; $('#stageDescription').textContent = 'Каждый бросок — новая комбинация'; $('#rollStage').style.setProperty('--glow', '#2bc875');
  }
  $('#chanceList').innerHTML = CONFIG.rarities.map(r => `<div class="chance" style="--c:${r.color}"><i></i><span>${r.name}</span><b>${r.chance}%</b></div>`).join('');
  $('#eventLog').innerHTML = state.events.length ? state.events.slice(0,6).map(e => `<div class="event"><time>${new Date(e.time).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</time>${e.t}</div>`).join('') : 'Пока тихо. Сделайте первый бросок.';
  let qs = quests();
  $('#questPreview').innerHTML = qs.slice(0,2).map(q => `<div class="event">${q.name}: ${Math.min(questProgress(q),q.target)}/${q.target}</div>`).join('');
  $('#colCount').textContent = `${state.collection.length}/${state.capacity.collection}`;
  $('#vaultCount').textContent = `${state.vault.length}/${state.capacity.vault}`;
  $('#collectionGrid').innerHTML = state.collection.length ? state.collection.map(p => plateCard(p,'collection')).join('') : '<p class="empty">Коллекция пуста — загляните в генератор.</p>';
  $('#vaultGrid').innerHTML = state.vault.length ? state.vault.map(p => plateCard(p,'vault')).join('') : '<p class="empty">Сейф пока пуст.</p>';
  renderOther(qs); bindDynamic();
}

const renderWithRarityScale = render;
render = function () { renderWithRarityScale(); if (!$('#rarityScale').classList.contains('is-sweeping')) { updateRarityScale(state.last?.rarity || null, false); } };

function renderSelectors() {
  let c = $('#country'); let old = state.selected.country;
  c.innerHTML = state.unlocked.map(id => `<option value="${id}">${CONFIG.countries[id].flag} ${CONFIG.countries[id].name}</option>`).join('');
  if (!state.unlocked.includes(old)) state.selected.country = state.unlocked[0];
  c.value = state.selected.country;
  let x = CONFIG.countries[state.selected.country];
  if (!x.regions[state.selected.region]) state.selected.region = Object.keys(x.regions)[0];
  $('#region').innerHTML = Object.keys(x.regions).map(v => `<option>${v}</option>`).join('');
  $('#region').value = state.selected.region;
  if (!x.types[state.selected.type]) state.selected.type = Object.keys(x.types)[0];
  $('#plateType').innerHTML = Object.keys(x.types).map(v => `<option value="${v}">${CONFIG.types[v]}</option>`).join('');
  $('#plateType').value = state.selected.type;
}

function renderOther(qs) {
  $('#upgradeList').innerHTML = Object.entries(CONFIG.upgrades).map(([id,u]) => { let l=state.upgrades[id]; let max=l>=u.max; return `<article class="upgrade"><p class="eyebrow">УРОВЕНЬ ${l}/${u.max}</p><h3>${u.name}</h3><p>${u.desc}</p><button data-upgrade="${id}" ${max?'disabled':''}>${max?'Максимум':`Улучшить · ${fmt(upgradeCost(id))} ₽`}</button></article>`; }).join('');
  $('#rarityList').innerHTML = CONFIG.rarities.map(r => `<article class="raritycard rarity-${r.id}" style="--rarity:${r.color}"><b>${r.name}</b><p>Шанс выпадения: <strong>${r.chance}%</strong></p><p>Стоимость: ${fmt(r.min)}–${fmt(r.max)} ₽</p><small>Найдено: ${state.stats.rarities[r.id]||0}</small></article>`).join('');
  $('#questList').innerHTML = qs.map(q => { let p=questProgress(q); let done=p>=q.target; let claimed=state.quests.claimed.includes(q.id); return `<article class="quest ${done?'done':''}"><h3>${q.name}</h3><p>${q.desc}</p><div class="progress"><i style="width:${Math.min(100,p/q.target*100)}%"></i></div><b>${Math.min(p,q.target)}/${q.target}</b><p>Награда: ${fmt(q.reward)} ₽</p><button data-quest="${q.id}" ${!done||claimed?'disabled':''}>${claimed?'Получено':'Забрать'}</button></article>`; }).join('');
  $('#dailyHint').textContent = state.stats.lastDaily === today() ? 'Ежедневная награда уже получена.' : 'Раз в календарный день: 30 000 ₽ и $5.';
  $('#dailyClaim').disabled = state.stats.lastDaily === today();
  $('#achievementList').innerHTML = ACH.map(([id,name,desc,test,reward]) => { let got=state.achievements.includes(id); return `<article class="achievement ${got?'':'locked'}"><span class="iconach">${got?'★':'☆'}</span><h3>${name}</h3><p>${desc}</p><b>${got?'Получено':`Награда: ${fmt(reward)} ₽`}</b></article>`; }).join('');
  $('#countryList').innerHTML = Object.entries(CONFIG.countries).map(([id,c]) => { let open=state.unlocked.includes(id); return `<article class="countrycard"><h3>${c.flag} ${c.name}</h3><p>Базовая стоимость: ${fmt(c.base)} ₽<br>${Object.keys(c.regions).length} регионов · ${Object.keys(c.types).length} типов</p><button data-country="${id}" ${open?'disabled':''}>${open?'Открыто':`Открыть · ${fmt(c.unlock)} ₽`}</button></article>`; }).join('');
  let found=CONFIG.rarities.map((r,i)=>(state.stats.rarities[r.id]||0)>0?i:-1).filter(i=>i>=0);
  let rar=found.length?Math.max(...found):-1;
  let held=[...state.collection,...state.vault].reduce((s,p)=>s+p.value,0);
  let stats=[['Генераций',state.stats.rolls],['Потрачено',fmt(state.stats.spent)+' ₽'],['Заработано',fmt(state.stats.earned)+' ₽'],['Продано',state.stats.sold],['В коллекции',state.collection.length],['В сейфе',state.vault.length],['Самый дорогой',fmt(state.stats.best)+' ₽'],['Самая редкая',rar<0?'—':CONFIG.rarities[rar].name],['Открыто стран',state.unlocked.length],['Стоимость хранения',fmt(held)+' ₽']];
  $('#statsGrid').innerHTML = stats.map(x => `<article class="stat">${x[0]}<b>${x[1]}</b></article>`).join('');
  $('#language').value=settings.language; $('#theme').value=settings.theme; $('#volume').value=settings.volume; $('#sound').checked=settings.sound; $('#animations').checked=settings.animations; $('#reduced').checked=settings.reduced; $('#confirmRare').checked=settings.confirmRare;
}

function bindDynamic() {
  $$('[data-move]').forEach(b => { b.onclick = () => InventoryManager.move(b.dataset.move, b.dataset.from, b.dataset.to); });
  $$('[data-sell]').forEach(b => { b.onclick = () => InventoryManager.sell([b.dataset.sell]); });
  $$('[data-check]').forEach(i => { i.onchange = () => { i.checked ? selected.add(i.dataset.check) : selected.delete(i.dataset.check); render(); }; });
  $$('[data-upgrade]').forEach(b => { b.onclick = () => buyUpgrade(b.dataset.upgrade); });
  $$('[data-quest]').forEach(b => { b.onclick = () => claimQuest(b.dataset.quest); });
  $$('[data-country]').forEach(b => { b.onclick = () => unlock(b.dataset.country); });
}

function unlock(id) {
  let c = CONFIG.countries[id];
  if (state.unlocked.includes(id)) return;
  if (state.level < 2) return toast('Для открытия новых стран нужен 2 уровень.');
  if (!state.adminFreeAll && !EconomyManager.spend(c.unlock)) return toast('Недостаточно рублей.');
  state.unlocked.push(id); state.stats.countriesOpened = state.unlocked.length;
  gainXP(100); log(`Открыта страна: ${c.name}`); checkAchievements(); saveRender(); toast(`${c.flag} ${c.name} открыта!`);
}

let revealRun = 0;
function reveal(p) {
  let run = ++revealRun; let r = RaritySystem.get(p.rarity);
  let overlay = $('#rareReveal'); let content = $('#revealContent');
  revealReady = false; overlay.className = p.rarity === 'ultra' ? 'rareReveal ultra-reveal' : 'rareReveal'; overlay.removeAttribute('style'); content.replaceChildren(); content.className = ''; content.removeAttribute('style');
  content.innerHTML = `<section class="reveal calculating ${p.rarity === 'ultra' ? 'is-ultra' : ''}" style="--rarity:${r.color}"><p class="reveal-kicker">РЕДКОСТЬ ОПРЕДЕЛЕНА</p><p class="rarename">${r.name}</p>${plateMarkup(p,true)}<div class="reveal-status">Номер выпал</div><div class="value hidden" id="revealPrice">${fmt(0)} ₽</div><p class="desc hidden">${p.description}</p>${p.additionalFeatures?.length?`<ul class="reveal-features hidden">${p.additionalFeatures.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<small class="skip hidden">Нажмите в любом месте, чтобы продолжить</small></section>`;
  overlay.classList.add('show','revealing'); document.body.classList.add('rare-reveal-open');
  let price = $('#revealPrice'); let duration = settings.reduced ? 700 : 1200;
  function count(now, start) {
    if (run !== revealRun || !overlay.classList.contains('show')) return;
    let progress = Math.min(1, (now - start) / duration); let ease = 1 - Math.pow(1 - progress, 3);
    price.textContent = `${fmt(Math.floor(p.value * ease))} ₽`;
    if (progress < 1) { requestAnimationFrame(t => count(t, start)); return; }
    price.textContent = `${fmt(p.value)} ₽`;
    let box = $('#revealContent .reveal'); box?.classList.remove('calculating');
    $$('#revealContent .hidden').forEach(e => e.classList.remove('hidden'));
    $('#revealContent .reveal-status').textContent = 'Стоимость рассчитана';
    overlay.classList.remove('revealing'); revealReady = true;
  }
  setTimeout(() => { if (run !== revealRun || !overlay.classList.contains('show')) return; $('#revealContent .reveal-status').textContent = 'Считаем стоимость номера'; price.classList.remove('hidden'); requestAnimationFrame(t => count(t, performance.now())); }, 1000);
}

let toastTimer;
function toast(s) { let e=$('#toast'); e.textContent=s; e.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>e.classList.remove('show'),3200); }
function navigate(id) { $$('.page').forEach(x=>x.classList.toggle('active',x.id===id)); $$('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===id)); $('#nav').classList.remove('open'); window.scrollTo(0,0); }

function migratePriceModel() {
  if (localStorage.getItem('plate_rng_price_model') === '7') return false;
  let items = [...state.collection, ...state.vault];
  for (const p of items) { let beauty=analyzeNumber(p.combination); p.value=PriceCalculator.value(RaritySystem.get(p.rarity),beauty,p.country,p.type,p.combination); p.description=(p.duplicate?'Дубликат. ':'')+beauty.primaryDescription; p.additionalFeatures=beauty.additionalFeatures; p.beauty=beauty; }
  if (state.last) { let saved=items.find(p=>p.id===state.last.id); if(saved){state.last={...saved};}else if(state.last.combination){state.last.beauty=analyzeNumber(state.last.combination);state.last.description=(state.last.duplicate?'Дубликат. ':'')+state.last.beauty.primaryDescription;state.last.additionalFeatures=state.last.beauty.additionalFeatures;state.last.value=PriceCalculator.value(RaritySystem.get(state.last.rarity),state.last.beauty,state.last.country,state.last.type,state.last.combination);} }
  localStorage.setItem('plate_rng_price_model','7'); log('Оценка стоимости и описания обновлены по подтверждённым признакам'); StorageManager.save(); return true;
}

function init() {
  loadAdminConfiguration();
  state = StorageManager.load(); settings = StorageManager.loadSettings(); quests(); render();
  if (!state.tutorial) { $('#tutorial').classList.add('show'); }
  $$('[data-nav]').forEach(b => { b.onclick = () => navigate(b.dataset.nav); });
  $('#menuBtn').onclick = () => $('#nav').classList.toggle('open');
  $('#rollBtn').onclick = roll;
  $('#country').onchange = e => { state.selected.country=e.target.value; render(); StorageManager.save(); };
  $('#region').onchange = e => { state.selected.region=e.target.value; StorageManager.save(); render(); };
  $('#plateType').onchange = e => { state.selected.type=e.target.value; StorageManager.save(); render(); };
  $('#sellSelected').onclick = () => InventoryManager.sell([...selected]);
  $('#selectAll').onclick = () => { state.collection.forEach(p=>selected.add(p.id)); render(); };
  $('#dailyClaim').onclick = daily;
  $('#rareReveal').onclick = () => { if (revealReady) { $('#rareReveal').classList.remove('show'); revealReady = false; } };
  $('#tutorialClose').onclick = () => { state.tutorial=true; $('#tutorial').classList.remove('show'); StorageManager.save(); };
  $('.close').onclick = () => $('#modal').classList.remove('show');
  $('#theme').onchange = e => { settings.theme=e.target.value; StorageManager.saveSettings(); render(); };
  ['language','volume','sound','animations','reduced','confirmRare'].forEach(id => { $('#'+id).onchange = e => { settings[id]=e.target.type==='checkbox'?e.target.checked:e.target.value; StorageManager.saveSettings(); render(); }; });
  $('#clearLog').onclick = () => { state.events=[]; saveRender(); };
  $('#resetTutorial').onclick = () => { $('#tutorial').classList.add('show'); };
  $('#newGame').onclick = () => { if(confirm('Это безвозвратно удалит весь игровой прогресс. Продолжить?')&&confirm('Подтвердите начало новой игры.')){state=defaultState();selected.clear();StorageManager.save();render();$('#tutorial').classList.add('show');} };
  document.addEventListener('click', e => { let blocked=e.target.closest('button,select,input,label,aside,.modal,.rareReveal'); if(blocked||!$('#home').classList.contains('active')||$('#tutorial').classList.contains('show'))return; roll(); });
  document.addEventListener('keydown', e => { if((e.code==='Space'||e.key==='Enter')&&!$('#rareReveal').classList.contains('show')&&document.activeElement.tagName!=='SELECT'){e.preventDefault();roll();}else if(e.key==='Enter'&&$('#rareReveal').classList.contains('show')&&revealReady){$('#rareReveal').classList.remove('show');revealReady=false;} });
  window.debugRarityTest = n => { let x={};let total=n||100000;for(let i=0;i<total;i++){let r=RaritySystem.pick().id;x[r]=(x[r]||0)+1;}console.table(Object.fromEntries(CONFIG.rarities.map(r=>[r.name,`${((x[r.id]||0)/total*100).toFixed(3)}%`]))); };
}

document.addEventListener('DOMContentLoaded', () => { init(); if (migratePriceModel()) render(); });

document.addEventListener('DOMContentLoaded', () => {
  let scrim=$('#drawerScrim'); let menu=$('#menuBtn');
  menu.addEventListener('click',()=>{scrim.classList.toggle('visible');});
  scrim.addEventListener('click',e=>{e.stopPropagation();scrim.classList.remove('visible');$('#nav').classList.remove('open');});
  $$('#nav [data-nav]').forEach(b=>{b.addEventListener('click',()=>{scrim.classList.remove('visible');});});
});

document.addEventListener('DOMContentLoaded', () => {
  let overlay=$('#rareReveal');
  overlay.onclick=()=>{if(!revealReady)return;overlay.classList.remove('show','revealing');document.body.classList.remove('rare-reveal-open');revealReady=false;};
  document.addEventListener('keydown',e=>{if(!overlay.classList.contains('show'))return;if(overlay.classList.contains('revealing')){e.preventDefault();e.stopImmediatePropagation();return;}if(e.key==='Enter'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();overlay.classList.remove('show');document.body.classList.remove('rare-reveal-open');revealReady=false;}},true);
});

/* ========================================================================
   ADMIN PANEL + DEBUG LAB + LEVEL UI
   Client-only developer tools. The password is a convenience gate, not
   secure authentication: anyone with DevTools can inspect local JS/storage.
   ======================================================================== */
const ADMIN_SETTINGS_KEY = 'plate_rng_admin_settings_v1';

function loadAdminConfiguration() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY) || '{}');
    if (Array.isArray(saved.chances) && saved.chances.length === CONFIG.rarities.length) {
      const vals = saved.chances.map(Number);
      const sum = vals.reduce((a, b) => a + b, 0);
      if (vals.every(v => Number.isFinite(v) && v >= 0 && v <= 100) && Math.abs(sum - 100) < 0.011) {
        CONFIG.rarities.forEach((r, i) => { r.chance = vals[i]; });
      }
    }
  } catch (e) {
    console.warn('Не удалось загрузить admin-настройки:', e);
  }
}

function saveAdminConfiguration() {
  const payload = { chances: CONFIG.rarities.map(r => r.chance) };
  if (!sandboxMode) {
    try { localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(payload)); }
    catch (e) { toast('Не удалось сохранить шансы.'); }
  }
}

function setDebugOutput(message, append = false) {
  const out = $('#debugOutput');
  if (!out) return;
  const text = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  out.textContent = append && out.textContent ? `${out.textContent}\n${text}` : text;
}

function getPlateStyle(country) {
  const styles = {
    russia: { bg: '#f7f7f5', fg: '#111111' },
    belarus: { bg: '#ffffff', fg: '#111111' },
    kazakhstan: { bg: '#f5fbfa', fg: '#154943' },
    usa: { bg: '#e8f1fb', fg: '#153d78' },
    germany: { bg: '#f4f4f4', fg: '#111111' },
    uk: { bg: '#ffe736', fg: '#111111' },
    japan: { bg: '#fafafa', fg: '#18202c' }
  };
  return styles[country] || { bg: '#f5f5f5', fg: '#141414' };
}

function updateLevelUI() {
  const currentLevel = $('#level');
  const bar = $('#xpBar');
  const need = xpNeed();
  if (currentLevel) currentLevel.textContent = state?.level ?? 1;
  if (bar && state) {
    bar.style.width = `${Math.max(0, Math.min(100, state.xp / need * 100))}%`;
    bar.title = `${fmt(state.xp)} / ${fmt(need)} XP`;
  }
  const label = $('#levelDetailText');
  if (label && state) label.textContent = `Уровень ${state.level} · ${fmt(state.xp)} / ${fmt(need)} XP`;
  const detailBar = $('#levelDetailBar');
  if (detailBar && state) detailBar.style.width = `${Math.max(0, Math.min(100, state.xp / need * 100))}%`;
  const badge = $('#adminLevelCurrent');
  if (badge && state) badge.textContent = `Уровень ${state.level} · ${fmt(state.xp)} / ${fmt(need)} XP`;
}

function injectLevelWidget() {
  const stage = $('.stage-bottom') || $('.roll-stage');
  if (!stage || $('#levelDetail')) return;
  const card = document.createElement('div');
  card.id = 'levelDetail';
  card.className = 'level-detail';
  card.innerHTML = `
    <div class="level-detail__top"><strong id="levelDetailText">Уровень 1</strong><span>XP</span></div>
    <div class="level-detail__track"><i id="levelDetailBar"></i></div>
  `;
  stage.appendChild(card);
}

function injectAdminDebugPages() {
  if ($('#adminPage') || !$('main')) return;
  const main = $('main');
  const admin = document.createElement('section');
  admin.id = 'adminPage';
  admin.className = 'page admin-page';
  admin.innerHTML = `
    <div class="pagehead"><div><p class="eyebrow">DEVELOPER ACCESS</p><h2>Admin Panel <span>локальные инструменты</span></h2></div><button id="adminBack" class="small">← Настройки</button></div>
    <div class="admin-warning">Локальная панель разработчика. Пароль находится в клиентском коде и не защищает игру от изменения через DevTools.</div>
    <section class="admin-grid">
      <article class="admin-card"><p class="eyebrow">ECONOMY</p><h3>Валюты</h3>
        <label>Сумма рублей<input id="adminRublesAmount" type="number" min="0" step="1000" value="100000"></label>
        <div class="admin-actions"><button id="adminAddRubles">+ ₽</button><button id="adminSetRubles">Установить ₽</button></div>
        <label>Сумма долларов<input id="adminDollarsAmount" type="number" min="0" step="10" value="100"></label>
        <div class="admin-actions"><button id="adminAddDollars">+ $</button><button id="adminSetDollars">Установить $</button></div>
        <small id="adminMoneyStatus" class="admin-muted"></small>
      </article>
      <article class="admin-card"><p class="eyebrow">PROGRESSION</p><h3>Уровень и опыт</h3>
        <div id="adminLevelCurrent" class="admin-level-current"></div>
        <label>Количество XP<input id="adminXpAmount" type="number" min="0" step="100" value="1000"></label>
        <div class="admin-actions"><button id="adminAddXp" class="primary">Добавить XP</button><button id="adminSetXp">Установить XP</button></div>
        <label>Установить уровень<input id="adminLevelAmount" type="number" min="1" max="1000000" step="1" value="10"></label>
        <button id="adminSetLevel">Установить уровень</button>
      </article>
      <article class="admin-card admin-card--wide"><p class="eyebrow">CUSTOM ITEM</p><h3>Создать любой номер</h3>
        <div class="admin-form-grid">
          <label>Комбинация<input id="adminPlateText" type="text" maxlength="40" value="А000АА 77" placeholder="А000АА 77"></label>
          <label>Страна<select id="adminPlateCountry">${Object.entries(CONFIG.countries).map(([id,c])=>`<option value="${id}">${c.flag} ${c.name}</option>`).join('')}</select></label>
          <label>Регион<select id="adminPlateRegion"></select></label>
          <label>Тип<select id="adminPlateType"></select></label>
          <label>Редкость<select id="adminPlateRarity">${CONFIG.rarities.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}</select></label>
          <label>Цена (пусто = рассчитать)<input id="adminPlatePrice" type="number" min="0" step="1" placeholder="Автоматически"></label>
          <label>Добавить в<select id="adminPlateDestination"><option value="collection">Коллекцию</option><option value="vault">Сейф</option></select></label>
        </div>
        <button id="adminCreatePlate" class="primary">Создать номер</button><small id="adminCreateStatus" class="admin-muted"></small>
      </article>
      <article class="admin-card admin-card--wide"><p class="eyebrow">RNG CONFIG</p><h3>Шансы выпадения</h3>
        <p class="admin-muted">Это базовые шансы перед возможным повышением редкости за красоту. Сумма обязана быть равна 100%.</p>
        <div id="adminChanceFields" class="admin-chance-grid"></div>
        <div class="admin-chance-footer"><strong id="adminChanceSum">Сумма: 100%</strong><button id="adminSaveChances" class="primary">Сохранить шансы</button><button id="adminResetChances">Сбросить</button></div>
        <div id="adminChanceStatus" class="admin-muted"></div>
      </article>
      <article class="admin-card"><p class="eyebrow">UNLOCKS</p><h3>Free All</h3>
        <p class="admin-muted">Открывает все страны, максимальные уровни улучшений, выдаёт большой запас валюты и отключает оплату генераций/улучшений.</p>
        <button id="adminFreeAll" class="primary">Активировать Free All</button><small id="adminFreeStatus" class="admin-muted"></small>
      </article>
      <article class="admin-card"><p class="eyebrow">RNG INSPECTOR</p><h3>Reveal RNG</h3>
        <p class="admin-muted">Показывает предварительно сгенерированный следующий номер, редкость, базовый шанс и оценку. Нажатие «Выбить номер» использует именно этот результат.</p>
        <button id="adminRevealRng">Reveal RNG — показать следующий результат</button>
        <div id="adminRevealResult" class="admin-reveal-result">Предпросмотр ещё не создан.</div>
        <button id="adminGoDebug">Debug →</button>
      </article>
    </section>
  `;

  const debug = document.createElement('section');
  debug.id = 'debugPage';
  debug.className = 'page admin-page';
  debug.innerHTML = `
    <div class="pagehead"><div><p class="eyebrow">DIAGNOSTICS</p><h2>Debug Lab <span>инструменты проверки</span></h2></div><button id="debugBack" class="small">← Admin Panel</button></div>
    <section class="admin-grid">
      <article class="admin-card"><h3>Notifications test</h3><p class="admin-muted">Проверяет уведомления разных типов.</p><button id="debugNotifications">Запустить тест уведомлений</button></article>
      <article class="admin-card"><h3>Sound test</h3><p class="admin-muted">Тестирует звук интерфейса и редкого выпадения.</p><button id="debugSound">Проиграть звуки</button></article>
      <article class="admin-card"><h3>Sandbox mode</h3><p class="admin-muted">Временные изменения игровой сессии не будут записываться в сохранение.</p><button id="debugSandbox">Включить Sandbox</button><small id="debugSandboxStatus" class="admin-muted"></small></article>
      <article class="admin-card"><h3>DEBUG OVERLAY</h3><p class="admin-muted">Показывает runtime-статус поверх игры.</p><button id="debugOverlayToggle">Включить Debug Overlay</button></article>
      <article class="admin-card"><h3>Stress Test</h3><p class="admin-muted">Проверяет выбор редкостей на 100 000 итерациях без изменения прогресса.</p><button id="debugStress">Запустить Stress Test</button></article>
      <article class="admin-card"><h3>Error overlay</h3><p class="admin-muted">Показывает тестовый экран ошибки, не ломая игру.</p><button id="debugErrorOverlay">Показать Error Overlay</button></article>
      <article class="admin-card"><h3>Analyzer tests</h3><p class="admin-muted">Запускает встроенные проверки комбинаций номерных знаков.</p><button id="debugAnalyzer">Запустить тесты анализа</button></article>
      <article class="admin-card"><h3>Reveal animation test</h3><p class="admin-muted">Проверяет анимацию эпического выпадения без добавления номера в коллекцию.</p><button id="debugRevealTest">Тестировать редкое выпадение</button></article>
      <article class="admin-card"><h3>Storage diagnostics</h3><p class="admin-muted">Показывает объём сохранений и наличие резервной копии.</p><button id="debugStorage">Проверить сохранения</button></article>
      <article class="admin-card"><h3>State audit</h3><p class="admin-muted">Проверяет валюту, ёмкости, дубликаты ID и суммы шансов.</p><button id="debugStateAudit">Проверить состояние игры</button></article>
      <article class="admin-card admin-card--wide"><h3>Console output</h3><pre id="debugOutput" class="debug-output">Готово. Выбери диагностическую функцию.</pre><div class="admin-actions"><button id="debugClearOutput">Очистить вывод</button><button id="debugBackAdmin">Вернуться в Admin Panel</button></div></article>
    </section>
  `;

  main.append(admin, debug);

  // Add the password-gated rng button at the bottom of Settings.
  const settingsPage = $('#settings');
  if (settingsPage && !$('#rngAdminAccess')) {
    const settingsContainer = settingsPage.querySelector('.settings') || settingsPage.querySelector('.card') || settingsPage;
    const access = document.createElement('section');
    access.className = 'card admin-access-card';
    access.innerHTML = `<p class="eyebrow">ADVANCED</p><h3>Расширенные инструменты</h3><p class="admin-muted">Скрытая панель разработчика.</p><button id="rngAdminAccess" class="rng-access-button">rng</button>`;
    settingsContainer.appendChild(access);
  }

  // A level/XP widget in the main screen.
  injectLevelWidget();
  renderAdminChanceFields();
  bindAdminDebugEvents();
  updateLevelUI();
  updateAdminStatus();
}

function renderAdminChanceFields() {
  const box = $('#adminChanceFields');
  if (!box) return;
  box.innerHTML = CONFIG.rarities.map(r => `
    <label class="admin-chance-row"><span style="color:${r.color}">${r.name}</span><input type="number" min="0" max="100" step="0.01" data-admin-chance="${r.id}" value="${r.chance}"><em>%</em></label>
  `).join('');
  $$('[data-admin-chance]').forEach(input => input.addEventListener('input', updateAdminChanceSum));
  updateAdminChanceSum();
}

function updateAdminChanceSum() {
  const sum = $$('[data-admin-chance]').reduce((total, input) => total + (Number(input.value) || 0), 0);
  const target = $('#adminChanceSum');
  if (target) {
    target.textContent = `Сумма: ${sum.toFixed(2)}%`;
    target.classList.toggle('is-invalid', Math.abs(sum - 100) > 0.001);
  }
}

function updateAdminStatus() {
  const m = $('#adminMoneyStatus');
  if (m && state) m.textContent = `Текущий баланс: ${fmt(state.rubles)} ₽ · $${fmt(state.dollars)}`;
  const f = $('#adminFreeStatus');
  if (f && state) {
    f.textContent = state.adminFreeAll ? 'Free All включён: покупки и броски бесплатны.' : 'Free All выключен.';
    const btn = $('#adminFreeAll');
    if (btn) btn.textContent = state.adminFreeAll ? 'Выключить бесплатный режим' : 'Активировать Free All';
  }
  const sandbox = $('#debugSandboxStatus');
  if (sandbox) sandbox.textContent = sandboxMode ? 'Sandbox активен — прогресс не сохраняется.' : 'Sandbox выключен.';
  const sandboxBtn = $('#debugSandbox');
  if (sandboxBtn) sandboxBtn.textContent = sandboxMode ? 'Завершить Sandbox и откатить' : 'Включить Sandbox';
}

function refreshAdminSelects() {
  const countrySelect = $('#adminPlateCountry');
  const regionSelect = $('#adminPlateRegion');
  const typeSelect = $('#adminPlateType');
  if (!countrySelect || !regionSelect || !typeSelect) return;
  const country = CONFIG.countries[countrySelect.value] || CONFIG.countries.russia;
  regionSelect.innerHTML = Object.keys(country.regions).map(r => `<option value="${r}">${r}</option>`).join('');
  typeSelect.innerHTML = Object.keys(country.types).map(t => `<option value="${t}">${CONFIG.types[t] || t}</option>`).join('');
}

function adminCreatePlate() {
  const combination = ($('#adminPlateText')?.value || '').trim();
  const countryId = $('#adminPlateCountry').value;
  const country = CONFIG.countries[countryId];
  const region = $('#adminPlateRegion').value;
  const type = $('#adminPlateType').value;
  const rarity = RaritySystem.get($('#adminPlateRarity').value);
  const destination = $('#adminPlateDestination').value;
  const target = destination === 'vault' ? state.vault : state.collection;
  const cap = destination === 'vault' ? state.capacity.vault : state.capacity.collection;
  if (!combination) return toast('Введи комбинацию номера.');
  if (target.length >= cap) return toast(destination === 'vault' ? 'Сейф заполнен.' : 'Коллекция заполнена.');
  const beauty = analyzeNumber(combination);
  const rawPrice = $('#adminPlatePrice').value.trim();
  let value = rawPrice === ''
    ? PriceCalculator.value(rarity, beauty, countryId, type, combination)
    : Number(rawPrice);
  if (!Number.isFinite(value) || value < 0) return toast('Некорректная цена.');
  value = Math.floor(Math.max(rarity.min, Math.min(rarity.max, value)));
  const key = `${countryId}|${combination}`;
  const duplicate = state.stats.unique.includes(key);
  const plate = {
    id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    country: countryId, region, type, rarity: rarity.id, value,
    date: new Date().toISOString(), duplicate,
    combination,
    style: getPlateStyle(countryId),
    description: `${duplicate ? 'Дубликат. ' : ''}${beauty.description || beauty.primaryDescription}`,
    additionalFeatures: beauty.additionalFeatures || [],
    beautyScore: beauty.beautyScore || 0,
    beauty,
    adminCreated: true
  };
  target.push(plate);
  if (!duplicate) state.stats.unique.push(key);
  state.stats.rarities[rarity.id] = (state.stats.rarities[rarity.id] || 0) + 1;
  log(`Admin Panel: создан номер ${combination} (${rarity.name})`);
  $('#adminCreateStatus').textContent = `Создано: ${combination} · ${fmt(value)} ₽ · ${rarity.name}`;
  StorageManager.save();
  render();
  updateAdminStatus();
  toast('Номер создан.');
}

function applyAdminChances() {
  const inputs = $$('[data-admin-chance]');
  const values = inputs.map(input => Number(input.value));
  if (values.length !== CONFIG.rarities.length || values.some(v => !Number.isFinite(v) || v < 0 || v > 100)) {
    $('#adminChanceStatus').textContent = 'Ошибка: каждый шанс должен быть в диапазоне 0–100.';
    return;
  }
  const sum = values.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.001) {
    $('#adminChanceStatus').textContent = `Сумма равна ${sum.toFixed(2)}%, требуется ровно 100%.`;
    return;
  }
  CONFIG.rarities.forEach((r, i) => { r.chance = values[i]; });
  saveAdminConfiguration();
  $('#adminChanceStatus').textContent = 'Шансы сохранены. Изменения применяются к следующим броскам.';
  updateAdminChanceSum();
  render();
  toast('Шансы выпадения обновлены.');
}

function resetAdminChances() {
  const defaults = [65, 22, 9, 3, .8, .18, .02];
  CONFIG.rarities.forEach((r, i) => { r.chance = defaults[i]; });
  saveAdminConfiguration();
  renderAdminChanceFields();
  render();
  const status = $('#adminChanceStatus');
  if (status) status.textContent = 'Шансы восстановлены к значениям по умолчанию.';
}

function activateFreeAll() {
  if (!state.adminFreeAll) {
    state.adminFreeAll = true;
    state.unlocked = Object.keys(CONFIG.countries);
    state.stats.countriesOpened = state.unlocked.length;
    state.upgrades.collection = CONFIG.upgrades.collection.max;
    state.upgrades.vault = CONFIG.upgrades.vault.max;
    state.upgrades.luck = CONFIG.upgrades.luck.max;
    state.upgrades.income = CONFIG.upgrades.income.max;
    state.capacity.collection = CONFIG.start.collection + CONFIG.upgrades.collection.step * state.upgrades.collection;
    state.capacity.vault = CONFIG.start.vault + CONFIG.upgrades.vault.step * state.upgrades.vault;
    state.rubles = Math.max(state.rubles, 1_000_000_000_000);
    state.dollars = Math.max(state.dollars, 1_000_000_000);
    log('Admin Panel: активирован Free All');
    toast('Free All активирован: всё открыто и покупки бесплатны.');
  } else {
    state.adminFreeAll = false;
    log('Admin Panel: Free All выключен');
    toast('Бесплатный режим выключен. Уже открытые возможности сохранены.');
  }
  checkAchievements();
  StorageManager.save();
  render();
  updateAdminStatus();
}

function previewRNG() {
  if (pendingRevealedPlate) {
    $('#adminRevealResult').textContent = 'Уже есть зарезервированный результат. Нажми «Выбить номер», чтобы использовать его, или обнови предпросмотр.';
    return;
  }
  const uniqueBefore = state.stats.unique.slice();
  const p = makePlate();
  state.stats.unique = uniqueBefore; // предпросмотр не меняет коллекционные данные
  p._rollCost = cost();
  p.baseChance = Number(p.baseChance ?? RaritySystem.get(p.baseRarityId || p.rarity).chance);
  pendingRevealedPlate = p;
  const finalRarity = RaritySystem.get(p.rarity);
  const baseRarity = RaritySystem.get(p.baseRarityId || p.rarity);
  const upgradesNote = p.wasUpgraded
    ? `<p class="admin-muted">Красота подняла редкость: ${baseRarity.name} → ${finalRarity.name}.</p>`
    : '';
  $('#adminRevealResult').innerHTML = `
    <div class="admin-preview-rarity" style="color:${finalRarity.color}">${finalRarity.name}</div>
    ${plateMarkup(p, true)}
    <strong>${fmt(p.value)} ₽</strong>
    <p>${p.description}</p>
    <p class="admin-muted">Базовый шанс ${baseRarity.name}: ${baseRarity.chance}% · стоимость следующего броска: ${fmt(p._rollCost)} ₽</p>
    ${upgradesNote}
    <p class="admin-success">Результат зарезервирован. Следующее нажатие «Выбить номер» использует именно его.</p>
    <button id="adminCancelReveal">Отменить предпросмотр</button>
  `;
  $('#adminCancelReveal').onclick = () => {
    pendingRevealedPlate = null;
    $('#adminRevealResult').textContent = 'Предпросмотр отменён.';
  };
}

function runStressTest() {
  const count = 100000;
  const start = performance.now();
  const results = Object.fromEntries(CONFIG.rarities.map(r => [r.id, 0]));
  for (let i = 0; i < count; i++) results[RaritySystem.pick().id]++;
  const elapsed = (performance.now() - start).toFixed(1);
  const rows = CONFIG.rarities.map(r => ({
    rarity: r.name,
    expected: `${r.chance}%`,
    actual: `${(results[r.id] / count * 100).toFixed(3)}%`,
    samples: results[r.id]
  }));
  console.table(rows);
  setDebugOutput(`Stress Test завершён: ${count.toLocaleString('ru-RU')} бросков за ${elapsed} мс.\n` + JSON.stringify(rows, null, 2));
}

function runStateAudit() {
  const all = [...state.collection, ...state.vault];
  const ids = all.map(p => p.id);
  const sumChances = CONFIG.rarities.reduce((sum, r) => sum + r.chance, 0);
  const issues = [];
  if (!Number.isFinite(state.rubles) || state.rubles < 0) issues.push('Некорректный баланс рублей');
  if (!Number.isFinite(state.dollars) || state.dollars < 0) issues.push('Некорректный баланс долларов');
  if (state.collection.length > state.capacity.collection) issues.push('Коллекция превышает вместимость');
  if (state.vault.length > state.capacity.vault) issues.push('Сейф превышает вместимость');
  if (new Set(ids).size !== ids.length) issues.push('Обнаружены повторяющиеся ID предметов');
  if (Math.abs(sumChances - 100) > .001) issues.push(`Сумма шансов ${sumChances}, а должна быть 100`);
  all.forEach(p => {
    const r = RaritySystem.get(p.rarity);
    if (!r) issues.push(`Неизвестная редкость у ${p.combination}`);
    else if (!Number.isFinite(p.value) || p.value < r.min || p.value > r.max) issues.push(`Цена вне диапазона у ${p.combination}`);
  });
  setDebugOutput({ result: issues.length ? 'ISSUES FOUND' : 'OK', issues, collection: state.collection.length, vault: state.vault.length, level: state.level, xp: state.xp, chanceSum: sumChances });
}

function toggleSandbox() {
  if (!sandboxMode) {
    sandboxBackup = JSON.parse(JSON.stringify(state));
    sandboxChanceBackup = CONFIG.rarities.map(r => r.chance);
    state = JSON.parse(JSON.stringify(state));
    sandboxMode = true;
    log('Debug: Sandbox Mode запущен');
    toast('Sandbox включён: изменения не будут сохранены.');
  } else {
    state = sandboxBackup || state;
    sandboxBackup = null;
    if (sandboxChanceBackup) CONFIG.rarities.forEach((r, i) => { r.chance = sandboxChanceBackup[i]; });
    sandboxChanceBackup = null;
    sandboxMode = false;
    toast('Sandbox завершён. Исходный прогресс восстановлен.');
  }
  render();
  updateAdminStatus();
  setDebugOutput(sandboxMode
    ? 'Sandbox активен. Игровые изменения происходят во временной копии состояния.'
    : 'Sandbox завершён. Восстановлен сохранённый до теста игровой прогресс.');
}

function toggleDebugOverlay() {
  let old = $('#debugOverlay');
  if (old) {
    old.remove();
    clearInterval(debugOverlayTimer);
    debugOverlayTimer = null;
    $('#debugOverlayToggle').textContent = 'Включить Debug Overlay';
    return;
  }
  const overlay = document.createElement('div');
  overlay.id = 'debugOverlay';
  overlay.innerHTML = `<div class="debug-overlay-head"><b>DEBUG OVERLAY</b><button id="debugOverlayClose">×</button></div><pre id="debugOverlayData"></pre>`;
  document.body.appendChild(overlay);
  $('#debugOverlayToggle').textContent = 'Выключить Debug Overlay';
  const update = () => {
    const data = {
      page: $('.page.active')?.id || 'unknown',
      level: state.level,
      xp: `${state.xp}/${xpNeed()}`,
      rubles: state.rubles,
      dollars: state.dollars,
      collection: `${state.collection.length}/${state.capacity.collection}`,
      vault: `${state.vault.length}/${state.capacity.vault}`,
      rolls: state.stats.rolls,
      freeAll: !!state.adminFreeAll,
      sandbox: sandboxMode,
      heapHint: `${Math.round(JSON.stringify(state).length / 1024)} KB save-state`
    };
    const target = $('#debugOverlayData');
    if (target) target.textContent = JSON.stringify(data, null, 2);
  };
  update();
  debugOverlayTimer = setInterval(update, 700);
  $('#debugOverlayClose').onclick = toggleDebugOverlay;
}

function showErrorOverlay() {
  let overlay = $('#debugErrorOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'debugErrorOverlay';
    overlay.className = 'debug-error-overlay';
    overlay.innerHTML = `<section><div class="debug-error-icon">!</div><p class="eyebrow">DEBUG SIMULATION</p><h2>Test error overlay</h2><p>Это демонстрационная ошибка интерфейса. Реальная игра не сломана.</p><pre>DEBUG_TEST_ERROR\nSource: Debug Lab\nState: simulated\nAction: close overlay to continue</pre><button id="debugErrorClose" class="primary">Понятно, закрыть</button></section>`;
    document.body.appendChild(overlay);
    $('#debugErrorClose').onclick = () => overlay.remove();
  }
}

function debugStorageDiagnostics() {
  const keys = [];
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || '';
    total += key.length + value.length;
    if (/plate_rng/i.test(key)) keys.push({ key, chars: value.length });
  }
  setDebugOutput({ totalApproxKB: Math.round(total / 1024 * 100) / 100, gameKeys: keys, sandboxMode, note: 'Размер приблизительный: строковые символы, а не точный объём хранения браузера.' });
}

function bindAdminDebugEvents() {
  // Select values follow the selected country in the admin item generator.
  refreshAdminSelects();
  $('#adminPlateCountry').addEventListener('change', refreshAdminSelects);

  $('#rngAdminAccess')?.addEventListener('click', () => {
    const password = prompt('Введите пароль для RNG Admin Panel:');
    if (password !== 'rng-6xDa') return toast('Неверный пароль.');
    adminAuthorized = true;
    navigate('adminPage');
    renderAdminChanceFields();
    updateAdminStatus();
  });

  $('#adminBack').onclick = () => navigate('settings');
  $('#adminGoDebug').onclick = () => { navigate('debugPage'); updateAdminStatus(); };
  $('#debugBack').onclick = () => navigate('adminPage');
  $('#debugBackAdmin').onclick = () => navigate('adminPage');

  $('#adminAddRubles').onclick = () => {
    const amount = Number($('#adminRublesAmount').value);
    if (!Number.isFinite(amount) || amount < 0) return toast('Введи корректное число.');
    EconomyManager.add(Math.min(Math.floor(amount), Number.MAX_SAFE_INTEGER), 'Admin Panel: добавлены рубли');
    StorageManager.save(); render(); updateAdminStatus();
  };
  $('#adminSetRubles').onclick = () => {
    const amount = Number($('#adminRublesAmount').value);
    if (!Number.isFinite(amount) || amount < 0) return toast('Введи корректное число.');
    state.rubles = Math.min(Math.floor(amount), Number.MAX_SAFE_INTEGER);
    log('Admin Panel: баланс рублей установлен вручную');
    StorageManager.save(); render(); updateAdminStatus();
  };
  $('#adminAddDollars').onclick = () => {
    const amount = Number($('#adminDollarsAmount').value);
    if (!Number.isFinite(amount) || amount < 0) return toast('Введи корректное число.');
    state.dollars = Math.min(Number.MAX_SAFE_INTEGER, state.dollars + Math.floor(amount));
    log('Admin Panel: добавлены доллары'); StorageManager.save(); render(); updateAdminStatus();
  };
  $('#adminSetDollars').onclick = () => {
    const amount = Number($('#adminDollarsAmount').value);
    if (!Number.isFinite(amount) || amount < 0) return toast('Введи корректное число.');
    state.dollars = Math.min(Math.floor(amount), Number.MAX_SAFE_INTEGER);
    log('Admin Panel: баланс долларов установлен вручную'); StorageManager.save(); render(); updateAdminStatus();
  };

  $('#adminAddXp').onclick = () => {
    const amount = Number($('#adminXpAmount').value);
    if (!Number.isFinite(amount) || amount < 0) return toast('Введи корректное количество XP.');
    gainXP(Math.min(Math.floor(amount), 1_000_000_000));
    log(`Admin Panel: добавлено ${fmt(amount)} XP`); StorageManager.save(); render(); updateAdminStatus();
  };
  $('#adminSetXp').onclick = () => {
    const amount = Number($('#adminXpAmount').value);
    if (!Number.isFinite(amount) || amount < 0) return toast('Введи корректное количество XP.');
    state.xp = Math.min(Math.floor(amount), xpNeed() - 1);
    log(`Admin Panel: XP установлен: ${fmt(state.xp)}`); StorageManager.save(); render(); updateAdminStatus();
  };
  $('#adminSetLevel').onclick = () => {
    const level = Number($('#adminLevelAmount').value);
    if (!Number.isInteger(level) || level < 1 || level > 1_000_000) return toast('Уровень должен быть целым числом от 1 до 1 000 000.');
    state.level = level;
    state.xp = Math.min(state.xp, xpNeed() - 1);
    log(`Admin Panel: уровень установлен на ${level}`); StorageManager.save(); render(); updateAdminStatus();
  };

  $('#adminCreatePlate').onclick = adminCreatePlate;
  $('#adminSaveChances').onclick = applyAdminChances;
  $('#adminResetChances').onclick = resetAdminChances;
  $('#adminFreeAll').onclick = activateFreeAll;
  $('#adminRevealRng').onclick = previewRNG;

  $('#debugNotifications').onclick = () => {
    toast('DEBUG: обычное уведомление');
    setDebugOutput('Отправлены notifications test. Следующие уведомления заменяют предыдущее в стандартном toast-контейнере.');
    setTimeout(() => toast('DEBUG: тест предупреждения пройден'), 450);
  };
  $('#debugSound').onclick = () => {
    AudioManager.play('click');
    setTimeout(() => AudioManager.play('rare'), 220);
    setTimeout(() => AudioManager.play('sell'), 480);
    setDebugOutput('Sound test отправил три сигнала: click, rare, sell. Убедись, что звук включён и браузер разрешил AudioContext.');
  };
  $('#debugSandbox').onclick = toggleSandbox;
  $('#debugOverlayToggle').onclick = toggleDebugOverlay;
  $('#debugStress').onclick = runStressTest;
  $('#debugErrorOverlay').onclick = showErrorOverlay;
  $('#debugAnalyzer').onclick = () => {
    const result = runNumberAnalysisTests();
    setDebugOutput(result);
    console.table(result);
  };
  $('#debugRevealTest').onclick = () => {
    const beauty = analyzeNumber('А777АА 77');
    reveal({ id: `debug_${Date.now()}`, country: 'russia', region: 'Москва (77)', type: 'civil', rarity: 'epic', value: 900000, combination: 'А777АА 77', style: getPlateStyle('russia'), description: beauty.description, additionalFeatures: beauty.additionalFeatures, beauty });
    setDebugOutput('Тестовый эпический экран открыт. Этот предмет не добавлен в коллекцию и не изменяет баланс.');
  };
  $('#debugStorage').onclick = debugStorageDiagnostics;
  $('#debugStateAudit').onclick = runStateAudit;
  $('#debugClearOutput').onclick = () => setDebugOutput('Вывод очищен.');
}

// Inject hidden developer pages after the original interface is rendered.
document.addEventListener('DOMContentLoaded', () => {
  injectAdminDebugPages();
});
