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
        'Москва (77)': 1,
        'Санкт-Петербург (78)': 1.04,
        'Московская область (50)': 1.02,
        'Краснодарский край (23)': .96,
        'Свердловская область (66)': .98,
        'Татарстан (16)': 1.02,
        'Новосибирск (54)': .95
      },
      types: { civil: 1, taxi: 1.12, police: 1.55, military: 1.45, special: 1.7, diplomatic: 2 }
    },
    belarus: {
      name: 'Беларусь', flag: '🇧🇾', base: 10500, unlock: 0,
      regions: {
        'Минск (7)': 1,
        'Минская область (6)': .96,
        'Брестская область (1)': .92,
        'Гомельская область (3)': .94,
        'Гродненская область (4)': .94,
        'Витебская область (2)': .93,
        'Могилёвская область (5)': .93
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
    collection: {
      name: 'Стеллажи коллекции',
      desc: 'Увеличивает место для новых номеров на 10.',
      base: 45000, step: 10, max: 15
    },
    vault: {
      name: 'Укрепление сейфа',
      desc: 'Добавляет 5 защищённых ячеек.',
      base: 90000, step: 5, max: 12
    },
    luck: {
      name: 'Сканер красоты',
      desc: 'Слегка увеличивает надбавку за подтверждённые признаки.',
      base: 110000, step: 0, max: 10
    },
    income: {
      name: 'Экспертная оценка',
      desc: 'Увеличивает цену продажи на 3%.',
      base: 135000, step: 0, max: 10
    }
  },

  dailyReward: { rubles: 30000, dollars: 5 },

  types: {
    civil: 'Гражданский',
    taxi: 'Такси',
    police: 'Полиция',
    military: 'Военный',
    special: 'Специальный',
    diplomatic: 'Дипломатический',
    service: 'Служебный',
    commercial: 'Коммерческий'
  }
};

if (Math.abs(CONFIG.rarities.reduce((s, r) => s + r.chance, 0) - 100) > .001) {
  throw Error('Сумма редкостей должна быть 100%');
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const fmt = n => new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 0
}).format(Math.floor(n));

const LocalizationManager = {
  dict: {
    ru: {
      home: 'Главная',
      collection: 'Коллекция',
      vault: 'Сейф',
      upgrades: 'Улучшения',
      rarities: 'Редкости',
      quests: 'Задания',
      achievements: 'Достижения',
      countries: 'Страны',
      stats: 'Статистика',
      settings: 'Настройки'
    },
    en: {
      home: 'Home',
      collection: 'Collection',
      vault: 'Vault',
      upgrades: 'Upgrades',
      rarities: 'Rarities',
      quests: 'Quests',
      achievements: 'Achievements',
      countries: 'Countries',
      stats: 'Statistics',
      settings: 'Settings'
    }
  },

  apply() {
    let d = this.dict[settings.language] || this.dict.ru;
    document.documentElement.lang = settings.language;

    $$('[data-t]').forEach(e => {
      e.textContent = d[e.dataset.t] || e.textContent;
    });
  }
};

const defaultState = () => ({
  saveVersion: 1,
  rubles: CONFIG.start.rubles,
  dollars: CONFIG.start.dollars,
  collection: [],
  vault: [],
  capacity: {
    collection: CONFIG.start.collection,
    vault: CONFIG.start.vault
  },
  upgrades: { collection: 0, vault: 0, luck: 0, income: 0 },
  unlocked: ['russia', 'belarus'],
  selected: { country: 'russia', region: 'Москва (77)', type: 'civil' },
  level: 1,
  xp: 0,
  stats: {
    rolls: 0,
    spent: 0,
    earned: 0,
    sold: 0,
    rarities: {},
    best: 0,
    unique: [],
    lastDaily: '',
    lastTime: Date.now(),
    firstSeen: [],
    countriesOpened: 2
  },
  quests: { date: '', items: [], claimed: [] },
  achievements: [],
  events: [],
  tutorial: false,
  last: null
});

const defaultSettings = () => ({
  theme: 'dark',
  language: 'ru',
  volume: 60,
  sound: true,
  animations: true,
  reduced: false,
  confirmRare: true,
  music: false
});

let state;
let settings;
let busy = false;
let revealReady = false;
let selected = new Set();
let rarityMotion = 0;

const StorageManager = {
  key: 'plate_rng_save_v1',
  settings: 'plate_rng_settings_v1',

  load() {
    try {
      let v = JSON.parse(localStorage.getItem(this.key));

      if (v && v.saveVersion === 1) {
        const base = defaultState();

        return Object.assign(base, v, {
          stats: Object.assign(base.stats, v.stats || {}),
          capacity: Object.assign(base.capacity, v.capacity || {}),
          upgrades: Object.assign(base.upgrades, v.upgrades || {})
        });
      }
    } catch (e) {
      try {
        let b = JSON.parse(localStorage.getItem(this.key + '_backup'));
        if (b) return b;
      } catch (_) {}

      toast('Сохранение повреждено: создана новая игра');
    }

    return defaultState();
  },

  save() {
    try {
      localStorage.setItem(
        this.key + '_backup',
        localStorage.getItem(this.key) || ''
      );

      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      toast('Не удалось сохранить прогресс');
    }
  },

  loadSettings() {
    try {
      return Object.assign(
        defaultSettings(),
        JSON.parse(localStorage.getItem(this.settings)) || {}
      );
    } catch (e) {
      return defaultSettings();
    }
  },

  saveSettings() {
    localStorage.setItem(this.settings, JSON.stringify(settings));
  }
};

const AudioManager = {
  ctx: null,

  play(type = 'click') {
    if (!settings.sound) return;

    try {
      this.ctx ??= new AudioContext();

      let o = this.ctx.createOscillator();
      let g = this.ctx.createGain();

      o.frequency.value = type === 'rare'
        ? 660
        : type === 'sell'
          ? 220
          : 440;

      g.gain.value = settings.volume / 100 * .035;

      o.connect(g);
      g.connect(this.ctx.destination);

      o.start();
      o.stop(this.ctx.currentTime + (type === 'rare' ? .25 : .06));
    } catch (e) {}
  }
};

const RaritySystem = {
  bands: [
    ['common', 0, 1.5],
    ['uncommon', 1.5, 3.5],
    ['rare', 3.5, 6],
    ['epic', 6, 11],
    ['legendary', 11, 16],
    ['mythic', 16, 28],
    ['ultra', 28, Infinity]
  ],

  pick() {
    let x = Math.random() * 100;

    for (const r of CONFIG.rarities) {
      x -= r.chance;
      if (x <= 0) return r;
    }

    return CONFIG.rarities[0];
  },

  get(id) {
    return CONFIG.rarities.find(r => r.id === id);
  },

  band(id) {
    return this.bands.find(x => x[0] === id) || this.bands[0];
  },

  classify(analysis) {
    let score = analysis?.beautyScore || 0;

    return this.get(
      (this.bands.find(([, min, max]) => score >= min && score < max)
        || this.bands[0])[0]
    );
  }
};

function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function choice(a) {
  return a[Math.floor(Math.random() * a.length)];
}

function chars(n, alphabet = 'ABEKMHOPCTYX') {
  return Array.from({ length: n }, () => choice(alphabet)).join('');
}

function digits(n) {
  return Array.from({ length: n }, () => rand(0, 9)).join('');
}

function differentChars(n, alphabet = 'ABEKMHOPCTYX') {
  let pool = [...alphabet];
  let result = '';

  while (result.length < n && pool.length) {
    result += pool.splice(rand(0, pool.length - 1), 1)[0];
  }

  return result;
}

/* Анализ фактических символов номера */
function analyzeNumber(number) {
  const value = String(number ?? '').trim();
  const parts = value.split(/\s+/);
  const last = parts.at(-1) || '';

  const isRuRegion = parts.length > 1
    && /^\d{1,3}$/.test(last)
    && (
      parts.length >= 3
      || /^[A-ZА-ЯЁ]\d{3}[A-ZА-ЯЁ]{2}$/i.test(parts[0])
      || /^\d{4}$/.test(parts[0])
      || /^[A-ZА-ЯЁ]{2}\d{3}$/i.test(parts[0])
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

  const latin = {
    А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H',
    О: 'O', Р: 'P', С: 'C', Т: 'T', У: 'Y', Х: 'X'
  };

  const normalizedCore = core.toUpperCase().replace(
    /[АВЕКМНОРСТУХ]/g,
    char => latin[char]
  );

  const numberDigits = (core.match(/\d/g) || []).join('');
  const letters = (normalizedCore.match(/[A-Z]/g) || []).join('');

  const digitCounts = Object.fromEntries(
    [...new Set(numberDigits)].map(x => [
      x,
      [...numberDigits].filter(y => y === x).length
    ])
  );

  const letterCounts = Object.fromEntries(
    [...new Set(letters)].map(x => [
      x,
      [...letters].filter(y => y === x).length
    ])
  );

  const digitRepeated = Object.values(digitCounts).some(n => n > 1);
  const letterRepeated = Object.values(letterCounts).some(n => n > 1);

  const digitPalindrome =
    numberDigits.length > 1
    && numberDigits === Array.from(numberDigits).reverse().join('');

  const letterPalindrome =
    letters.length > 1
    && letters === Array.from(letters).reverse().join('');

  const tripleDigit = Object.values(digitCounts).some(n => n >= 3);
  const quadDigit = Object.values(digitCounts).some(n => n >= 4);
  const tripleLetter = Object.values(letterCounts).some(n => n >= 3);

  const sequence =
    /012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210/
      .test(numberDigits);

  const blockPattern =
    numberDigits.length >= 4 && /^(.{2})\1$/.test(numberDigits);

  const brand =
    /^A\d{3}MP/.test(normalizedCore) ? 'АМР'
      : /^E\d{3}KH/.test(normalizedCore) ? 'ЕКХ'
        : /^M\d{3}MM/.test(normalizedCore) ? 'МММ'
          : /^O\d{3}OO/.test(normalizedCore) ? 'ООО'
            : null;

  const officialRF =
    brand === 'АМР'
    && ['77', '97', '99', '177', '197', '199', '777', '797', '799', '977']
      .includes(region);

  const regionPattern =
    /^(\d)\1+$/.test(region) || /^(\d)\1\d$/.test(region);

  const fullHouse =
    numberDigits.length >= 3
    && letters.length >= 3
    && new Set(numberDigits).size === 1
    && new Set(letters).size === 1;

  const checks = [
    ['fullHouse', fullHouse, 'Фуллблат: одинаковые цифры и буквы'],
    ['officialRF', officialRF, 'Коллекционная серия АМР'],
    ['quadDigit', quadDigit, 'Четыре и более одинаковых цифры'],
    ['tripleDigit', tripleDigit, 'Три одинаковые цифры'],
    ['digitPalindrome', digitPalindrome, 'Цифровой палиндром'],
    ['letterPalindrome', letterPalindrome, 'Палиндром букв'],
    ['sequence', sequence, 'Последовательность цифр'],
    ['blockPattern', blockPattern, 'Повторяющийся блок цифр'],
    ['brand', !!brand, brand ? `Специальная серия ${brand}` : ''],
    ['digitRepeated', digitRepeated, 'Повторяющиеся цифры'],
    ['letterRepeated', letterRepeated, 'Повторяющиеся буквы'],
    ['regionPattern', regionPattern, 'Повторяющийся код региона']
  ];

  const features = checks
    .filter(([, matched]) => matched)
    .map(([id, , label]) => ({ id, label }));

  const primary = features[0] || {
    id: 'ordinary',
    label: 'Обычная комбинация без выраженных паттернов'
  };

  const beautyScore =
    (digitRepeated ? 1 : 0)
    + (letterRepeated ? .5 : 0)
    + (digitPalindrome ? 3 : 0)
    + (letterPalindrome ? 1.5 : 0)
    + (sequence ? 2 : 0)
    + (blockPattern ? 3 : 0)
    + (tripleDigit ? 5 : 0)
    + (quadDigit ? 7 : 0)
    + (tripleLetter ? 3 : 0)
    + (brand ? 2 : 0)
    + (officialRF ? 9 : 0)
    + (fullHouse ? 18 : 0)
    + (regionPattern ? .5 : 0);

  return {
    number: value,
    core,
    digits: numberDigits,
    letters,
    region,
    checks: Object.fromEntries(checks.map(([id, matched]) => [id, matched])),
    features,
    primaryDescription: primary.label,
    additionalFeatures: features.slice(1).map(x => x.label),
    description: primary.label,
    beautyScore,
    brand,
    officialRF,
    digitRepeated,
    letterRepeated,
    digitPair: digitRepeated,
    letterPair: letterRepeated,
    digitPalindrome,
    digitMirror: digitPalindrome,
    letterPalindrome,
    tripleDigit,
    quadDigit,
    tripleLetter,
    fullHouse,
    sequence,
    blockPattern,
    regionPattern
  };
}

function runNumberAnalysisTests() {
  const cases = [
    ['491', a => !a.digitPalindrome && !a.digitRepeated && !a.letterRepeated],
    ['121', a => a.digitPalindrome && a.digitRepeated],
    ['777', a => a.digitPalindrome && a.tripleDigit && a.digitRepeated],
    ['1221', a => a.digitPalindrome && a.digitRepeated],
    ['С491ЕЕ 77', a =>
      a.letterRepeated
      && !a.digitRepeated
      && !a.digitPalindrome
      && a.primaryDescription === 'Повторяющиеся буквы'
    ],
    ['А111АА 77', a => a.fullHouse && a.digitRepeated && a.letterRepeated],
    ['А398СР 77', a =>
      !a.digitRepeated && !a.digitPalindrome && !a.tripleDigit && !a.fullHouse
    ],
    ['А517СУ 77', a =>
      !a.digitRepeated && !a.digitPalindrome && !a.tripleDigit && !a.fullHouse
    ],
    ['T971BY 77', a =>
      !a.digitRepeated && !a.digitPalindrome && !a.tripleDigit && !a.fullHouse
    ],
    ['М879ММ 77', a =>
      a.tripleLetter && a.letterPalindrome && !a.digitPalindrome && !a.tripleDigit
    ]
  ];

  const failures = cases
    .filter(([sample, check]) => !check(analyzeNumber(sample)))
    .map(([sample]) => sample);

  return {
    passed: cases.length - failures.length,
    total: cases.length,
    failures
  };
}

if (typeof window !== 'undefined') {
  window.runNumberAnalysisTests = runNumberAnalysisTests;
}

/* Генератор комбинаций */
const NumberGenerator = {
  generate(country, type, region, target = 'common') {
    let num;
    let style = { bg: '#f7f7f7', fg: '#111' };

    let code = (region.match(/\(([^)]+)\)/) || [])[1]
      || region.slice(0, 2).toUpperCase();

    if (country === 'russia') {
      const alphabet = 'ABEKMHOPCTYX';

      const single = () => differentChars(1, alphabet);

      const plain = () =>
        single() + differentChars(3, '0123456789') + differentChars(2, alphabet);

      const pair = () => {
        let a = String(rand(0, 9));
        let b = String(rand(0, 9));

        while (a === b) b = String(rand(0, 9));

        return a + a + b;
      };

      const palindrome = () => {
        let a = String(rand(0, 9));
        let b = String(rand(0, 9));

        while (a === b) b = String(rand(0, 9));

        return a + b + a;
      };

      const same = () => String(rand(0, 9)).repeat(3);

      const official = [
        '77', '97', '99', '177', '197',
        '199', '777', '797', '799', '977'
      ].includes(code);

      if (type === 'civil') {
        if (target === 'uncommon') {
          num = single() + pair() + differentChars(2, alphabet) + ' ' + code;
        } else if (target === 'rare') {
          num = single() + palindrome() + differentChars(2, alphabet) + ' ' + code;
        } else if (target === 'epic') {
          num = single() + same() + differentChars(2, alphabet) + ' ' + code;
        } else if (target === 'legendary') {
          num = official
            ? 'A' + differentChars(3, '0123456789') + 'MP ' + code
            : 'E' + same() + 'KH ' + code;
        } else if (target === 'mythic') {
          num = official
            ? 'A' + same() + 'MP ' + code
            : 'E' + same() + 'KH ' + code;
        } else if (target === 'ultra') {
          let l = single();
          let d = String(rand(0, 9));
          num = l + d.repeat(3) + l + l + ' ' + code;
        } else {
          num = plain() + ' ' + code;
        }
      } else if (type === 'diplomatic') {
        num = 'CD ' + digits(3) + ' ' + code;
      } else if (type === 'police') {
        num = target === 'mythic'
          ? String(rand(0, 9)).repeat(4) + ' ' + code
          : digits(4) + ' ' + code;
      } else if (type === 'military') {
        num = chars(2) + digits(3) + ' ' + code;
      } else {
        num = plain() + ' ' + code;
      }

      style = { bg: '#f5f5f2', fg: '#161616' };
    } else if (country === 'belarus') {
      num = chars(2, 'ABEKMHTX') + ' ' + digits(4) + '-' + code;
      style = { bg: '#fff', fg: '#151515' };
    } else if (country === 'usa') {
      num = type === 'commercial'
        ? digits(3) + '-' + chars(3)
        : chars(3, 'ABCDEFGHJKLMNPRSTUVWXYZ') + ' ' + digits(3);

      style = { bg: '#e8f1fb', fg: '#153d78' };
    } else if (country === 'germany') {
      num = code.slice(0, 2).toUpperCase()
        + ' '
        + chars(rand(1, 2), 'ABCDEFGHJKLMNPRSTUVWXYZ')
        + ' '
        + digits(rand(1, 4));

      style = { bg: '#f4f4f4', fg: '#111' };
    } else if (country === 'uk') {
      num = chars(2, 'ABCDEFGHJKLMNPRSTUVWXYZ')
        + digits(2)
        + ' '
        + chars(3, 'ABCDEFGHJKLMNPRSTUVWXYZ');

      style = { bg: '#ffe736', fg: '#111' };
    } else if (country === 'japan') {
      num = choice(['品川', '大阪', '札幌'])
        + ' '
        + digits(3)
        + ' '
        + digits(2)
        + '-'
        + digits(2);

      style = { bg: '#fafafa', fg: '#18202c' };
    } else {
      num = digits(3) + ' ' + chars(3, 'ABEKMHOPCTYX') + ' ' + code;
      style = { bg: '#f5f5f5', fg: '#141414' };
    }

    let beauty = analyzeNumber(num);

    return { combination: num, style, beauty };
  }
};

/* Расчёт цены — редкость определяет диапазон, а красота влияет на цену внутри него */
const PriceCalculator = {
  value(rarity, analysis, country, type, combination = '') {
    let hash = 2166136261;

    for (const char of `${country}|${type}|${combination}`) {
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
    }

    let [, floor, ceiling] = RaritySystem.band(rarity.id);
    let score = Number(analysis?.beautyScore) || 0;

    let shape = ceiling === Infinity
      ? Math.max(0, Math.min(1, (score - floor) / 18))
      : Math.max(0, Math.min(1, (score - floor) / (ceiling - floor)));

    let variation = ((hash % 997) / 997 - .5) * .09;

    let progress = Math.max(
      .01,
      Math.min(
        .999,
        .045 + shape * .84 + variation + state.upgrades.luck * .004
      )
    );

    let span = rarity.max - rarity.min;

    let raw = rarity.id === 'ultra'
      ? Math.floor(rarity.min * Math.pow(rarity.max / rarity.min, progress))
      : Math.floor(rarity.min + span * progress);

    let tail = 137 + hash % 727;

    return Math.max(rarity.min, Math.min(rarity.max, raw + tail));
  },

  sell(v) {
    return Math.max(1, Math.floor(v * (.31 + state.upgrades.income * .03)));
  }
};

const EconomyManager = {
  can(v) {
    return Number.isFinite(v) && v >= 0 && state.rubles >= v;
  },

  add(v, why) {
    const requested = Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
    const before = state.rubles;

    state.rubles = Math.min(Number.MAX_SAFE_INTEGER, before + requested);

    const gained = state.rubles - before;

    state.stats.earned = Math.min(
      Number.MAX_SAFE_INTEGER,
      (state.stats.earned || 0) + gained
    );

    if (why) {
      log(
        gained < requested
          ? `${why} (достигнут лимит игрового баланса)`
          : why
      );
    }

    return gained;
  },

  spend(v) {
    if (!Number.isFinite(v) || v < 0 || !this.can(v)) return false;

    state.rubles -= v;

    state.stats.spent = Math.min(
      Number.MAX_SAFE_INTEGER,
      (state.stats.spent || 0) + v
    );

    return true;
  }
};

function cost() {
  let s = state.selected;
  let c = CONFIG.countries[s.country];

  return Math.round(c.base * c.regions[s.region] * c.types[s.type]);
}

function xpNeed() {
  return 100 + state.level * 70;
}

function gainXP(n) {
  state.xp += n;

  while (state.xp >= xpNeed()) {
    state.xp -= xpNeed();
    state.level++;

    let reward = state.level * 6000;

    EconomyManager.add(reward, `Уровень ${state.level}: +${fmt(reward)} ₽`);
    toast(`Новый уровень ${state.level}! +${fmt(reward)} ₽`);

    AudioManager.play('rare');
  }
}

/* ВАЖНО: редкость больше не пересчитывается из красоты номера */
function makePlate() {
  let s = state.selected;

  let target = RaritySystem.pick();
  let g = NumberGenerator.generate(s.country, s.type, s.region, target.id);

  let r = target;
  let comboKey = `${s.country}|${g.combination}`;
  let duplicate = state.stats.unique.includes(comboKey);

  let val = PriceCalculator.value(
    r,
    g.beauty,
    s.country,
    s.type,
    g.combination
  );

  let p = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    country: s.country,
    region: s.region,
    type: s.type,
    rarity: r.id,
    value: val,
    date: new Date().toISOString(),
    duplicate,
    description: (duplicate ? 'Дубликат. ' : '') + g.beauty.primaryDescription,
    additionalFeatures: g.beauty.additionalFeatures,
    ...g
  };

  if (!duplicate) state.stats.unique.push(comboKey);

  return p;
}

function updateRarityScale(id, animate = false, duration = 120) {
  let root = $('#rarityScale');
  let labels = $('#rarityScaleLabels');

  if (!root || !labels) return;

  const run = ++rarityMotion;

  const index = CONFIG.rarities.findIndex(r => r.id === id);
  const target = index < 0 ? 0 : (index + .5) / CONFIG.rarities.length * 100;

  labels.innerHTML = CONFIG.rarities.map((r, i) => `
    <span class="rarity-scale__label"
      style="--step-color:${r.color}"
      title="${r.name}">
      <span class="rarity-scale__full">${r.name}</span>
      <span class="rarity-scale__short">
        ${['Обыч.', 'Необыч.', 'Редкий', 'Эпик', 'Легенд.', 'Миф', 'Ультра'][i]}
      </span>
    </span>
  `).join('');

  root.dataset.rarity = id || '';

  root.style.setProperty(
    '--rarity-color',
    index >= 0 ? CONFIG.rarities[index].color : '#8b96a8'
  );

  root.style.setProperty('--scale-duration', `${duration}ms`);

  root.classList.toggle('is-sweeping', animate);
  root.style.setProperty('--scale-progress', animate ? '0%' : `${target}%`);

  labels.querySelectorAll('.rarity-scale__label').forEach((node, i) => {
    node.classList.toggle('is-passed', index >= i && index >= 0);
    node.classList.toggle('is-current', index === i);
  });

  if (animate) {
    requestAnimationFrame(() => {
      if (run === rarityMotion) {
        root.style.setProperty('--scale-progress', `${target}%`);
      }
    });

    setTimeout(() => {
      if (run === rarityMotion) root.classList.remove('is-sweeping');
    }, duration);
  }
}

function finishRoll(p) {
  state.collection.push(p);
  state.last = p;

  state.stats.rolls++;
  state.stats.rarities[p.rarity] = (state.stats.rarities[p.rarity] || 0) + 1;
  state.stats.best = Math.max(state.stats.best, p.value);

  if (!state.stats.firstSeen.includes(p.rarity)) {
    state.stats.firstSeen.push(p.rarity);
  }

  gainXP(RaritySystem.get(p.rarity).xp);

  log(`Найден номер ${p.combination} (${RaritySystem.get(p.rarity).name})`);
  progress();
  checkAchievements();

  StorageManager.save();

  busy = false;
  $('#rollStage').classList.remove('is-rolling');

  render();

  AudioManager.play(
    ['epic', 'legendary', 'mythic', 'ultra'].includes(p.rarity)
      ? 'rare'
      : 'click'
  );

  if (['epic', 'legendary', 'mythic', 'ultra'].includes(p.rarity)) {
    reveal(p);
  } else {
    toast(`Новый номер: ${p.combination}`);
  }
}

function roll() {
  if (busy || $('#rareReveal').classList.contains('show')) return;

  if (state.collection.length >= state.capacity.collection) {
    return toast('В коллекции нет места — продайте номер или улучшите стеллажи.');
  }

  let c = cost();

  if (!EconomyManager.spend(c)) {
    return toast('Недостаточно рублей для выбивания.');
  }

  busy = true;
  $('#rollBtn').disabled = true;

  let p = makePlate();

  let duration = settings.reduced ? 60 : settings.animations ? 120 : 0;

  updateRarityScale(p.rarity, duration > 0, duration);
  finishRoll(p);
}

const InventoryManager = {
  move(id, from, to) {
    let a = state[from];
    let b = state[to];
    let cap = state.capacity[to];

    let i = a.findIndex(x => x.id === id);

    if (i < 0) return;

    if (b.length >= cap) {
      return toast(to === 'vault' ? 'Сейф заполнен.' : 'Коллекция заполнена.');
    }

    b.push(a.splice(i, 1)[0]);

    log(to === 'vault'
      ? 'Номер помещён в сейф'
      : 'Номер возвращён в коллекцию'
    );

    checkAchievements();
    saveRender();
  },

  sell(ids) {
    let items = state.collection.filter(p => ids.includes(p.id));

    if (!items.length) return;

    if (
      settings.confirmRare
      && items.some(p =>
        ['epic', 'legendary', 'mythic', 'ultra'].includes(p.rarity)
      )
      && !confirm('Среди выбранного есть редкие номера. Продать?')
    ) {
      return;
    }

    let sum = items.reduce(
      (s, p) => s + PriceCalculator.sell(p.value),
      0
    );

    state.collection = state.collection.filter(p => !ids.includes(p.id));

    items.forEach(p => selected.delete(p.id));

    EconomyManager.add(sum, `Продано номеров: ${items.length}`);

    state.stats.sold += items.length;

    gainXP(items.length * 3);
    progress();
    checkAchievements();

    toast(`Продано за ${fmt(sum)} ₽`);
    AudioManager.play('sell');

    saveRender();
  }
};

function upgradeCost(id) {
  let u = CONFIG.upgrades[id];
  let l = state.upgrades[id];

  return Math.floor(u.base * Math.pow(1.7, l));
}

function buyUpgrade(id) {
  let u = CONFIG.upgrades[id];
  let l = state.upgrades[id];
  let price = upgradeCost(id);

  if (l >= u.max) return toast('Максимальный уровень улучшения.');

  if (!EconomyManager.spend(price)) {
    return toast('Недостаточно рублей.');
  }

  state.upgrades[id]++;

  if (id === 'collection') state.capacity.collection += u.step;
  if (id === 'vault') state.capacity.vault += u.step;

  gainXP(30);

  log(`Улучшение «${u.name}» повышено`);

  checkAchievements();
  saveRender();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function quests() {
  let d = today();

  if (state.quests.date !== d) {
    state.quests = {
      date: d,
      claimed: [],
      items: [
        {
          id: 'roll',
          name: 'Смена в генераторе',
          desc: 'Выбейте 5 номеров.',
          target: 5,
          reward: 25000
        },
        {
          id: 'sell',
          name: 'Чистая коллекция',
          desc: 'Продайте 3 номера.',
          target: 3,
          reward: 18000
        },
        {
          id: 'rare',
          name: 'Охота за цветом',
          desc: 'Получите необычный или редкий номер.',
          target: 1,
          reward: 30000
        }
      ]
    };

    StorageManager.save();
  }

  return state.quests.items;
}

function questProgress(q) {
  if (q.id === 'roll') return state.stats.rolls;
  if (q.id === 'sell') return state.stats.sold;

  return (state.stats.rarities.uncommon || 0)
    + (state.stats.rarities.rare || 0)
    + (state.stats.rarities.epic || 0)
    + (state.stats.rarities.legendary || 0)
    + (state.stats.rarities.mythic || 0)
    + (state.stats.rarities.ultra || 0);
}

function claimQuest(id) {
  let q = quests().find(x => x.id === id);

  if (!q || state.quests.claimed.includes(id) || questProgress(q) < q.target) {
    return;
  }

  state.quests.claimed.push(id);

  EconomyManager.add(q.reward, `Награда за задание «${q.name}»`);

  gainXP(40);
  toast(`Получено ${fmt(q.reward)} ₽`);

  saveRender();
}

function daily() {
  let t = today();

  if (state.stats.lastDaily === t) {
    return toast('Ежедневная награда уже получена.');
  }

  let now = Date.now();

  if (now + 3600000 < state.stats.lastTime) {
    return toast('Проверка времени: награда временно недоступна.');
  }

  state.stats.lastDaily = t;
  state.stats.lastTime = now;

  EconomyManager.add(CONFIG.dailyReward.rubles, 'Ежедневная награда');
  state.dollars += CONFIG.dailyReward.dollars;

  gainXP(25);

  toast(
    `Ежедневная награда: ${fmt(CONFIG.dailyReward.rubles)} ₽ и $${CONFIG.dailyReward.dollars}`
  );

  saveRender();
}

const ACH = [
  ['first', 'Первый номер', 'Получите первый номер.', s => s.stats.rolls >= 1, 5000],
  ['roll10', 'Разгон', 'Сделайте 10 генераций.', s => s.stats.rolls >= 10, 10000],
  ['roll100', 'Сотня находок', 'Сделайте 100 генераций.', s => s.stats.rolls >= 100, 50000],
  ['roll500', 'Настоящий искатель', 'Сделайте 500 генераций.', s => s.stats.rolls >= 500, 250000],
  ['sell', 'Первая сделка', 'Продайте номер.', s => s.stats.sold >= 1, 5000],
  ['vault', 'Под защитой', 'Поместите номер в сейф.', s => s.vault.length >= 1, 10000],
  ['rare', 'Редкое везение', 'Найдите редкий номер.', s => (s.stats.rarities.rare || 0) >= 1, 25000],
  ['epic', 'Эпический миг', 'Найдите эпический номер.', s => (s.stats.rarities.epic || 0) >= 1, 100000],
  ['legend', 'Золотая удача', 'Найдите легендарный номер.', s => (s.stats.rarities.legendary || 0) >= 1, 500000],
  ['myth', 'Красная аура', 'Найдите мифический номер.', s => (s.stats.rarities.mythic || 0) >= 1, 1000000],
  ['ultra', 'За гранью шанса', 'Найдите ультра номер.', s => (s.stats.rarities.ultra || 0) >= 1, 5000000],
  ['million', 'Миллионер', 'Накопите миллион рублей.', s => s.rubles >= 1e6, 100000],
  ['capital', 'Капитал', 'Накопите 10 миллионов рублей.', s => s.rubles >= 1e7, 500000],
  ['col25', 'Коллекционер', 'Храните 25 номеров.', s => s.collection.length >= 25, 30000],
  ['col50', 'Архивариус', 'Храните 50 номеров.', s => s.collection.length >= 50, 75000],
  ['safe', 'Полный сейф', 'Заполните сейф.', s => s.vault.length >= s.capacity.vault, 80000],
  ['countries', 'Путешественник', 'Откройте все страны.', s => s.unlocked.length === Object.keys(CONFIG.countries).length, 500000],
  ['unique', 'Неповторимый стиль', 'Соберите 25 уникальных комбинаций.', s => s.stats.unique.length >= 25, 50000],
  ['types', 'Мастер форматов', 'Найдите 5 разных типов.', s => new Set([...s.collection, ...s.vault].map(x => x.type)).size >= 5, 50000],
  ['upgrades', 'Инфраструктура', 'Купите 10 улучшений.', s => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 10, 150000],
  ['maxup', 'Максимум места', 'Полностью улучшите стеллажи.', s => s.upgrades.collection >= CONFIG.upgrades.collection.max, 1000000]
];

function checkAchievements() {
  ACH.forEach(([id, name, desc, test, reward]) => {
    if (!state.achievements.includes(id) && test(state)) {
      state.achievements.push(id);

      EconomyManager.add(reward, `Достижение «${name}»`);
      log(`Открыто достижение: ${name}`);
      toast(`★ Достижение: ${name}`);
    }
  });
}

function progress() {
  quests();
  state.stats.lastTime = Math.max(state.stats.lastTime || 0, Date.now());
}

function log(t) {
  state.events.unshift({ t, time: Date.now() });
  state.events = state.events.slice(0, 25);
}

function saveRender() {
  StorageManager.save();
  render();
}

function plateMarkup(p, large = false) {
  let isRu = p.country === 'russia';
  let parts = p.combination.trim().split(/\s+/);
  let body = parts.slice(0, -1).join(' ') || parts[0];
  let region = parts.length > 1 ? parts.at(-1) : '';

  if (isRu) {
    return `
      <div class="platevisual realplate ${large ? 'plate-xl' : ''}">
        <span class="plate-main">${body}</span>
        <span class="plate-region">
          <b>${region}</b><em>RUS</em><i class="flag-ru"></i>
        </span>
      </div>
    `;
  }

  return `
    <div class="platevisual ${large ? 'plate-xl' : ''}"
      style="--platebg:${p.style.bg};--platefg:${p.style.fg}">
      ${p.combination}
    </div>
  `;
}

function plateCard(p, place) {
  let r = RaritySystem.get(p.rarity);
  let locked = place === 'vault';
  let move = locked ? 'Вернуть' : 'В сейф';

  let actions = locked
    ? `<button data-move="${p.id}" data-from="vault" data-to="collection">${move}</button>`
    : `
      <button data-move="${p.id}" data-from="collection" data-to="vault">${move}</button>
      <button data-sell="${p.id}" class="danger">Продать</button>
    `;

  return `
    <article class="platecard rarity-${p.rarity} ${selected.has(p.id) ? 'selected' : ''}"
      style="--rarity:${r.color}">
      ${!locked ? `<input type="checkbox" data-check="${p.id}" ${selected.has(p.id) ? 'checked' : ''}>` : ''}
      <b style="color:${r.color}">${r.name}</b>
      ${plateMarkup(p)}
      <div class="plateinfo">
        <span>${CONFIG.countries[p.country].name} · ${CONFIG.types[p.type]}</span>
        <span>${new Date(p.date).toLocaleDateString('ru-RU')}</span>
      </div>
      <div class="platevalue">${fmt(p.value)} ₽ ${p.duplicate ? '· Дубликат' : ''}</div>
      <small>${p.description}</small>
      <div class="plateactions">${actions}</div>
    </article>
  `;
}

/* Основная отрисовка */
function render() {
  document.body.querySelector('#app').className = `theme-${settings.theme}`;

  LocalizationManager.apply();

  $('#rubles').textContent = fmt(state.rubles);
  $('#dollars').textContent = fmt(state.dollars);
  $('#level').textContent = state.level;
  $('#xpBar').style.width = `${state.xp / xpNeed() * 100}%`;

  $('#capacity').textContent =
    `${state.collection.length} / ${state.capacity.collection}`;

  renderSelectors();

  $('#rollCost').textContent = `${fmt(cost())} ₽`;
  $('#rollBtn').disabled = busy;

  let country = CONFIG.countries[state.selected.country];

  let region = (state.selected.region.match(/\(([^)]+)\)/) || [])[1] || '';

  $('#stageCountry').textContent = `${country.flag} ${country.name} · ${region}`;

  if (state.last) {
    let r = RaritySystem.get(state.last.rarity);

    $('#stagePlate').innerHTML = plateMarkup(state.last, true);
    $('#stageRarity').textContent = r.name.toUpperCase();
    $('#stageRarity').style.color = r.color;
    $('#stageValue').textContent = `${fmt(state.last.value)} ₽`;
    $('#stageValue').style.color = r.color;
    $('#stageDescription').textContent = state.last.description;

    $('#rollStage').style.setProperty('--glow', r.color);
  } else {
    $('#stagePlate').innerHTML =
      '<div class="stage-placeholder">Коснитесь экрана,<br>чтобы выбить номер</div>';

    $('#stageRarity').textContent = 'ГОТОВ К ВЫПУСКУ';
    $('#stageRarity').style.color = '';
    $('#stageValue').textContent = '— ₽';
    $('#stageDescription').textContent = 'Каждый бросок — новая комбинация';

    $('#rollStage').style.setProperty('--glow', '#2bc875');
  }

  $('#chanceList').innerHTML = CONFIG.rarities.map(r => `
    <div class="chance" style="--c:${r.color}">
      <i></i><span>${r.name}</span><b>${r.chance}%</b>
    </div>
  `).join('');

  $('#eventLog').innerHTML = state.events.length
    ? state.events.slice(0, 6).map(e => `
      <div class="event">
        <time>${new Date(e.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time>
        ${e.t}
      </div>
    `).join('')
    : 'Пока тихо. Сделайте первый бросок.';

  let qs = quests();

  $('#questPreview').innerHTML = qs.slice(0, 2).map(q => `
    <div class="event">${q.name}: ${Math.min(questProgress(q), q.target)}/${q.target}</div>
  `).join('');

  $('#colCount').textContent =
    `${state.collection.length}/${state.capacity.collection}`;

  $('#vaultCount').textContent =
    `${state.vault.length}/${state.capacity.vault}`;

  $('#collectionGrid').innerHTML = state.collection.length
    ? state.collection.map(p => plateCard(p, 'collection')).join('')
    : '<p class="empty">Коллекция пуста — загляните в генератор.</p>';

  $('#vaultGrid').innerHTML = state.vault.length
    ? state.vault.map(p => plateCard(p, 'vault')).join('')
    : '<p class="empty">Сейф пока пуст.</p>';

  renderOther(qs);
  bindDynamic();
}

const renderWithRarityScale = render;

render = function () {
  renderWithRarityScale();

  if (!$('#rarityScale').classList.contains('is-sweeping')) {
    updateRarityScale(state.last?.rarity || null, false);
  }
};

function renderSelectors() {
  let c = $('#country');
  let old = state.selected.country;

  c.innerHTML = state.unlocked.map(id => `
    <option value="${id}">${CONFIG.countries[id].flag} ${CONFIG.countries[id].name}</option>
  `).join('');

  if (!state.unlocked.includes(old)) {
    state.selected.country = state.unlocked[0];
  }

  c.value = state.selected.country;

  let x = CONFIG.countries[state.selected.country];

  if (!x.regions[state.selected.region]) {
    state.selected.region = Object.keys(x.regions)[0];
  }

  $('#region').innerHTML = Object.keys(x.regions)
    .map(v => `<option>${v}</option>`)
    .join('');

  $('#region').value = state.selected.region;

  if (!x.types[state.selected.type]) {
    state.selected.type = Object.keys(x.types)[0];
  }

  $('#plateType').innerHTML = Object.keys(x.types)
    .map(v => `<option value="${v}">${CONFIG.types[v]}</option>`)
    .join('');

  $('#plateType').value = state.selected.type;
}

function renderOther(qs) {
  $('#upgradeList').innerHTML = Object.entries(CONFIG.upgrades).map(([id, u]) => {
    let l = state.upgrades[id];
    let max = l >= u.max;

    return `
      <article class="upgrade">
        <p class="eyebrow">УРОВЕНЬ ${l}/${u.max}</p>
        <h3>${u.name}</h3>
        <p>${u.desc}</p>
        <button data-upgrade="${id}" ${max ? 'disabled' : ''}>
          ${max ? 'Максимум' : `Улучшить · ${fmt(upgradeCost(id))} ₽`}
        </button>
      </article>
    `;
  }).join('');

  $('#rarityList').innerHTML = CONFIG.rarities.map(r => `
    <article class="raritycard rarity-${r.id}" style="--rarity:${r.color}">
      <b>${r.name}</b>
      <p>Шанс выпадения: <strong>${r.chance}%</strong></p>
      <p>Стоимость: ${fmt(r.min)}–${fmt(r.max)} ₽</p>
      <small>Найдено: ${state.stats.rarities[r.id] || 0}</small>
    </article>
  `).join('');

  $('#questList').innerHTML = qs.map(q => {
    let p = questProgress(q);
    let done = p >= q.target;
    let claimed = state.quests.claimed.includes(q.id);

    return `
      <article class="quest ${done ? 'done' : ''}">
        <h3>${q.name}</h3>
        <p>${q.desc}</p>
        <div class="progress">
          <i style="width:${Math.min(100, p / q.target * 100)}%"></i>
        </div>
        <b>${Math.min(p, q.target)}/${q.target}</b>
        <p>Награда: ${fmt(q.reward)} ₽</p>
        <button data-quest="${q.id}" ${!done || claimed ? 'disabled' : ''}>
          ${claimed ? 'Получено' : 'Забрать'}
        </button>
      </article>
    `;
  }).join('');

  $('#dailyHint').textContent = state.stats.lastDaily === today()
    ? 'Ежедневная награда уже получена.'
    : 'Раз в календарный день: 30 000 ₽ и $5.';

  $('#dailyClaim').disabled = state.stats.lastDaily === today();

  $('#achievementList').innerHTML = ACH.map(([id, name, desc, test, reward]) => {
    let got = state.achievements.includes(id);

    return `
      <article class="achievement ${got ? '' : 'locked'}">
        <span class="iconach">${got ? '★' : '☆'}</span>
        <h3>${name}</h3>
        <p>${desc}</p>
        <b>${got ? 'Получено' : `Награда: ${fmt(reward)} ₽`}</b>
      </article>
    `;
  }).join('');

  $('#countryList').innerHTML = Object.entries(CONFIG.countries).map(([id, c]) => {
    let open = state.unlocked.includes(id);

    return `
      <article class="countrycard">
        <h3>${c.flag} ${c.name}</h3>
        <p>
          Базовая стоимость: ${fmt(c.base)} ₽<br>
          ${Object.keys(c.regions).length} регионов · ${Object.keys(c.types).length} типов
        </p>
        <button data-country="${id}" ${open ? 'disabled' : ''}>
          ${open ? 'Открыто' : `Открыть · ${fmt(c.unlock)} ₽`}
        </button>
      </article>
    `;
  }).join('');

  let found = CONFIG.rarities
    .map((r, i) => (state.stats.rarities[r.id] || 0) > 0 ? i : -1)
    .filter(i => i >= 0);

  let rar = found.length ? Math.max(...found) : -1;

  let held = [...state.collection, ...state.vault]
    .reduce((s, p) => s + p.value, 0);

  let stats = [
    ['Генераций', state.stats.rolls],
    ['Потрачено', fmt(state.stats.spent) + ' ₽'],
    ['Заработано', fmt(state.stats.earned) + ' ₽'],
    ['Продано', state.stats.sold],
    ['В коллекции', state.collection.length],
    ['В сейфе', state.vault.length],
    ['Самый дорогой', fmt(state.stats.best) + ' ₽'],
    ['Самая редкая', rar < 0 ? '—' : CONFIG.rarities[rar].name],
    ['Открыто стран', state.unlocked.length],
    ['Стоимость хранения', fmt(held) + ' ₽']
  ];

  $('#statsGrid').innerHTML = stats.map(x => `
    <article class="stat">${x[0]}<b>${x[1]}</b></article>
  `).join('');

  $('#language').value = settings.language;
  $('#theme').value = settings.theme;
  $('#volume').value = settings.volume;
  $('#sound').checked = settings.sound;
  $('#animations').checked = settings.animations;
  $('#reduced').checked = settings.reduced;
  $('#confirmRare').checked = settings.confirmRare;
}

function bindDynamic() {
  $$('[data-move]').forEach(b => {
    b.onclick = () => InventoryManager.move(
      b.dataset.move,
      b.dataset.from,
      b.dataset.to
    );
  });

  $$('[data-sell]').forEach(b => {
    b.onclick = () => InventoryManager.sell([b.dataset.sell]);
  });

  $$('[data-check]').forEach(i => {
    i.onchange = () => {
      i.checked
        ? selected.add(i.dataset.check)
        : selected.delete(i.dataset.check);

      render();
    };
  });

  $$('[data-upgrade]').forEach(b => {
    b.onclick = () => buyUpgrade(b.dataset.upgrade);
  });

  $$('[data-quest]').forEach(b => {
    b.onclick = () => claimQuest(b.dataset.quest);
  });

  $$('[data-country]').forEach(b => {
    b.onclick = () => unlock(b.dataset.country);
  });
}

function unlock(id) {
  let c = CONFIG.countries[id];

  if (state.unlocked.includes(id)) return;

  if (state.level < 2) {
    return toast('Для открытия новых стран нужен 2 уровень.');
  }

  if (!EconomyManager.spend(c.unlock)) {
    return toast('Недостаточно рублей.');
  }

  state.unlocked.push(id);
  state.stats.countriesOpened = state.unlocked.length;

  gainXP(100);

  log(`Открыта страна: ${c.name}`);

  checkAchievements();
  saveRender();

  toast(`${c.flag} ${c.name} открыта!`);
}

/* Полноэкранное выпадение редкого номера */
let revealRun = 0;

function reveal(p) {
  let run = ++revealRun;
  let r = RaritySystem.get(p.rarity);

  let overlay = $('#rareReveal');
  let content = $('#revealContent');

  revealReady = false;

  overlay.className = 'rareReveal';
  overlay.removeAttribute('style');

  content.replaceChildren();
  content.className = '';
  content.removeAttribute('style');

  content.innerHTML = `
    <section class="reveal calculating" style="--rarity:${r.color}">
      <p class="reveal-kicker">РЕДКОСТЬ ОПРЕДЕЛЕНА</p>
      <p class="rarename">${r.name}</p>
      ${plateMarkup(p, true)}
      <div class="reveal-status">Номер выпал</div>
      <div class="value hidden" id="revealPrice">${fmt(0)} ₽</div>
      <p class="desc hidden">${p.description}</p>
      ${p.additionalFeatures?.length ? `
        <ul class="reveal-features hidden">
          ${p.additionalFeatures.map(x => `<li>${x}</li>`).join('')}
        </ul>
      ` : ''}
      <small class="skip hidden">Нажмите в любом месте, чтобы продолжить</small>
    </section>
  `;

  overlay.classList.add('show', 'revealing');
  document.body.classList.add('rare-reveal-open');

  let price = $('#revealPrice');
  let duration = settings.reduced ? 700 : 1200;

  function count(now, start) {
    if (run !== revealRun || !overlay.classList.contains('show')) return;

    let progress = Math.min(1, (now - start) / duration);
    let ease = 1 - Math.pow(1 - progress, 3);

    price.textContent = `${fmt(Math.floor(p.value * ease))} ₽`;

    if (progress < 1) {
      requestAnimationFrame(t => count(t, start));
      return;
    }

    price.textContent = `${fmt(p.value)} ₽`;

    let box = $('#revealContent .reveal');
    box?.classList.remove('calculating');

    $$('#revealContent .hidden').forEach(e => e.classList.remove('hidden'));

    $('#revealContent .reveal-status').textContent = 'Стоимость рассчитана';

    overlay.classList.remove('revealing');
    revealReady = true;
  }

  setTimeout(() => {
    if (run !== revealRun || !overlay.classList.contains('show')) return;

    $('#revealContent .reveal-status').textContent = 'Считаем стоимость номера';

    price.classList.remove('hidden');

    requestAnimationFrame(t => count(t, performance.now()));
  }, 1000);
}

let toastTimer;

function toast(s) {
  let e = $('#toast');

  e.textContent = s;
  e.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => e.classList.remove('show'), 3200);
}

function navigate(id) {
  $$('.page').forEach(x => x.classList.toggle('active', x.id === id));

  $$('[data-nav]').forEach(x => {
    x.classList.toggle('active', x.dataset.nav === id);
  });

  $('#nav').classList.remove('open');
  window.scrollTo(0, 0);
}

/* Обновление модели цен сохранённых номеров */
function migratePriceModel() {
  if (localStorage.getItem('plate_rng_price_model') === '6') return false;

  let items = [...state.collection, ...state.vault];

  for (const p of items) {
    let beauty = analyzeNumber(p.combination);

    p.value = PriceCalculator.value(
      RaritySystem.get(p.rarity),
      beauty,
      p.country,
      p.type,
      p.combination
    );

    p.description = (p.duplicate ? 'Дубликат. ' : '') + beauty.primaryDescription;
    p.additionalFeatures = beauty.additionalFeatures;
    p.beauty = beauty;
  }

  if (state.last) {
    let saved = items.find(p => p.id === state.last.id);

    if (saved) {
      state.last = { ...saved };
    } else if (state.last.combination) {
      state.last.beauty = analyzeNumber(state.last.combination);

      state.last.description =
        (state.last.duplicate ? 'Дубликат. ' : '')
        + state.last.beauty.primaryDescription;

      state.last.additionalFeatures = state.last.beauty.additionalFeatures;

      state.last.value = PriceCalculator.value(
        RaritySystem.get(state.last.rarity),
        state.last.beauty,
        state.last.country,
        state.last.type,
        state.last.combination
      );
    }
  }

  localStorage.setItem('plate_rng_price_model', '6');

  log('Оценка стоимости и описания обновлены по подтверждённым признакам');

  StorageManager.save();

  return true;
}

/* Запуск игры */
function init() {
  state = StorageManager.load();
  settings = StorageManager.loadSettings();

  quests();
  render();

  if (!state.tutorial) {
    $('#tutorial').classList.add('show');
  }

  $$('[data-nav]').forEach(b => {
    b.onclick = () => navigate(b.dataset.nav);
  });

  $('#menuBtn').onclick = () => $('#nav').classList.toggle('open');

  $('#rollBtn').onclick = roll;

  $('#country').onchange = e => {
    state.selected.country = e.target.value;
    render();
    StorageManager.save();
  };

  $('#region').onchange = e => {
    state.selected.region = e.target.value;
    StorageManager.save();
    render();
  };

  $('#plateType').onchange = e => {
    state.selected.type = e.target.value;
    StorageManager.save();
    render();
  };

  $('#sellSelected').onclick = () => InventoryManager.sell([...selected]);

  $('#selectAll').onclick = () => {
    state.collection.forEach(p => selected.add(p.id));
    render();
  };

  $('#dailyClaim').onclick = daily;

  $('#rareReveal').onclick = () => {
    if (revealReady) {
      $('#rareReveal').classList.remove('show');
      revealReady = false;
    }
  };

  $('#tutorialClose').onclick = () => {
    state.tutorial = true;
    $('#tutorial').classList.remove('show');
    StorageManager.save();
  };

  $('.close').onclick = () => $('#modal').classList.remove('show');

  $('#theme').onchange = e => {
    settings.theme = e.target.value;
    StorageManager.saveSettings();
    render();
  };

  ['language', 'volume', 'sound', 'animations', 'reduced', 'confirmRare']
    .forEach(id => {
      $('#' + id).onchange = e => {
        settings[id] = e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value;

        StorageManager.saveSettings();
        render();
      };
    });

  $('#clearLog').onclick = () => {
    state.events = [];
    saveRender();
  };

  $('#resetTutorial').onclick = () => {
    $('#tutorial').classList.add('show');
  };

  $('#newGame').onclick = () => {
    if (
      confirm('Это безвозвратно удалит весь игровой прогресс. Продолжить?')
      && confirm('Подтвердите начало новой игры.')
    ) {
      state = defaultState();
      selected.clear();

      StorageManager.save();
      render();

      $('#tutorial').classList.add('show');
    }
  };

  document.addEventListener('click', e => {
    let blocked = e.target.closest(
      'button,select,input,label,aside,.modal,.rareReveal'
    );

    if (
      blocked
      || !$('#home').classList.contains('active')
      || $('#tutorial').classList.contains('show')
    ) {
      return;
    }

    roll();
  });

  document.addEventListener('keydown', e => {
    if (
      (e.code === 'Space' || e.key === 'Enter')
      && !$('#rareReveal').classList.contains('show')
      && document.activeElement.tagName !== 'SELECT'
    ) {
      e.preventDefault();
      roll();
    } else if (
      e.key === 'Enter'
      && $('#rareReveal').classList.contains('show')
      && revealReady
    ) {
      $('#rareReveal').classList.remove('show');
      revealReady = false;
    }
  });

  window.debugRarityTest = n => {
    let x = {};
    let total = n || 100000;

    for (let i = 0; i < total; i++) {
      let r = RaritySystem.pick().id;
      x[r] = (x[r] || 0) + 1;
    }

    console.table(
      Object.fromEntries(
        CONFIG.rarities.map(r => [
          r.name,
          `${((x[r.id] || 0) / total * 100).toFixed(3)}%`
        ])
      )
    );
  };
}

/* Инициализация после загрузки HTML */
document.addEventListener('DOMContentLoaded', () => {
  init();

  if (migratePriceModel()) render();
});

document.addEventListener('DOMContentLoaded', () => {
  let scrim = $('#drawerScrim');
  let menu = $('#menuBtn');

  menu.addEventListener('click', () => {
    scrim.classList.toggle('visible');
  });

  scrim.addEventListener('click', e => {
    e.stopPropagation();

    scrim.classList.remove('visible');
    $('#nav').classList.remove('open');
  });

  $$('#nav [data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      scrim.classList.remove('visible');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  let overlay = $('#rareReveal');

  overlay.onclick = () => {
    if (!revealReady) return;

    overlay.classList.remove('show', 'revealing');
    document.body.classList.remove('rare-reveal-open');

    revealReady = false;
  };

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('show')) return;

    if (overlay.classList.contains('revealing')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      e.stopImmediatePropagation();

      overlay.classList.remove('show');
      document.body.classList.remove('rare-reveal-open');

      revealReady = false;
    }
  }, true);
});