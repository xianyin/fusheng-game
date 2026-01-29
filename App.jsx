'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Coins, TrendingUp, Home, ShoppingBag, Navigation, History, 
  AlertCircle, Heart, Gift, X, Trophy, CloudLightning, Sun, Umbrella, 
  Zap, Info, RefreshCw, Backpack, Crown, Hammer, Snowflake, Flower, 
  Leaf, UserPlus, Star, Scroll, Anchor, Sprout, Factory, Baby, 
  Save, Download, Upload, Trash2, Moon, BookOpen, Skull, Settings, Users, LogOut,
  ArrowUp, ArrowDown, Minus, Briefcase
} from 'lucide-react';

// --- 0. 基础工具函数 ---
const safeNum = (val, defaultVal = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
};

// --- 1. 核心常量定义 ---

const SEASONS = ['春', '夏', '秋', '冬'];
const SOLAR_TERMS = [
  { name: '立春', desc: '万物复苏，健康恢复+5' }, { name: '雨水', desc: '春雨贵如油，农田产出+20%' }, 
  { name: '惊蛰', desc: '春雷乍动，行商遇险率增加' }, { name: '春分', desc: '昼夜平分，心情愉悦' }, 
  { name: '清明', desc: '茶叶丰收，生茶产量翻倍' }, { name: '谷雨', desc: '雨生百谷，粮食价格下跌' },
  { name: '立夏', desc: '夏日初长，赶路消耗增加' }, { name: '小满', desc: '江河渐满，水路运费降低' },
  { name: '芒种', desc: '忙种忙收，雇佣成本增加' }, { name: '夏至', desc: '日照最长，光照充足' },
  { name: '小暑', desc: '因热少动，客流减少' }, { name: '大暑', desc: '酷热难耐，健康消耗翻倍' },
  { name: '立秋', desc: '凉风至，健康恢复+5' }, { name: '处暑', desc: '出游迎秋，特产销量增加' },
  { name: '白露', desc: '露凝而白，草药品质提升' }, { name: '秋分', desc: '蟹肥菊黄，酒类热销' },
  { name: '寒露', desc: '气温骤降，丝绸需求上涨' }, { name: '霜降', desc: '万物毕成，所有产出+10%' },
  { name: '立冬', desc: '水始冰，水路停运' }, { name: '小雪', desc: '闭门过冬，客流大幅减少' },
  { name: '大雪', desc: '瑞雪兆丰年，为来年积蓄' }, { name: '冬至', desc: '数九寒天，健康消耗翻倍' },
  { name: '小寒', desc: '天寒地冻，药材价格暴涨' }, { name: '大寒', desc: '岁末宴请，酒肉价格暴涨' }
];

const TALENTS = [
  { id: 't_rich', name: '商贾世家', desc: '初始资金 +2000，且开局自带一本生意经', type: 'cash', val: 2000 },
  { id: 't_strong', name: '武林世家', desc: '初始健康上限 150，且遭遇劫匪胜率翻倍', type: 'health', val: 50 },
  { id: 't_charm', name: '潘安再世', desc: '所有红颜初始好感度 +20，且约会消耗减半', type: 'charm', val: 20 },
  { id: 't_clever', name: '鬼谷传人', desc: '技艺熟练度获取速度 +50%，制作成功率 +20%', type: 'skill', val: 0.5 },
  { id: 't_lucky', name: '天选之子', desc: '奇遇触发概率提升，且必定是好运', type: 'luck', val: 1 },
];

const GENERATION_GOALS = [
  { gen: 1, title: '初入商海', desc: '存活满 1 年，且总资产达到 5,000 两', check: (s) => s.day >= 360 && s.assets >= 5000, reward: '传家宝【算盘】(交易利润+5%)' },
  { gen: 2, title: '开枝散叶', desc: '拥有 2 处产业，且结识 2 位红颜', check: (s) => s.props >= 2 && s.lovers >= 2, reward: '传家宝【玉佩】(好感获取+10%)' },
  { gen: 3, title: '一方巨擘', desc: '总资产达到 100,000 两，晋升为【州府商首】', check: (s) => s.assets >= 100000 && s.rank >= 2, reward: '传家宝【官印】(免除关税)' },
  { gen: 4, title: '名扬天下', desc: '解锁所有城市，掌握 3 门大师级技艺(100点)', check: (s) => s.cities >= 8 && s.masterSkills >= 3, reward: '传家宝【聚宝盆】(每日自动产钱)' },
  { gen: 99, title: '万世基业', desc: '家族延续 10 代', check: (s) => false, reward: '无' } 
];

const RANKS = [
  { id: 0, title: '行脚商', desc: '初入商途，只能靠双脚丈量大地。', perk: '无', req: { cash: 0, cities: 1 }, idleIncome: 0 },
  { id: 1, title: '市井掌柜', desc: '在坊间小有名气，懂得精打细算。', perk: '跨城运费降低 20%', req: { cash: 5000, cities: 2, bondLv: 1 }, idleIncome: 10 },
  { id: 2, title: '州府商首', desc: '一方富豪，甚至能左右物价。', perk: '解锁【垄断】功能（可抬价销售）', req: { cash: 20000, cities: 3, bondLv: 3 }, idleIncome: 50 },
  { id: 3, title: '朝廷皇商', desc: '红顶商人，专供宫廷御用。', perk: '解锁【贡品贸易】（极高利润）', req: { cash: 100000, cities: 4, bondLv: 6 }, idleIncome: 200 },
  { id: 4, title: '江南巨贾', desc: '富可敌国，传说中的财神爷。', perk: '所有收益 +50%，通关游戏', req: { cash: 500000, cities: 4, bondLv: 10 }, idleIncome: 1000 },
];

const PROPERTIES = [
  { id: 'hut', name: '城郊别院', cost: 3000, income: 20, desc: '不仅能住，还能邀请红颜小住，加速感情升温。' },
  { id: 'shop', name: '闹市铺面', cost: 15000, income: 100, desc: '客似云来，若在此售卖自制商品，利润更高。' },
];

const INDUSTRIES = [
  { id: 'mulberry_farm', name: '太湖桑园', cost: 5000, product: 'cocoon', rate: 5, desc: '每5天产出桑蚕茧，春季产量翻倍。' },
  { id: 'tea_mountain', name: '龙井茶山', cost: 8000, product: 'raw_tea', rate: 5, desc: '每5天产出生茶，清明谷雨产量大增。' },
  { id: 'mine', name: '徐州铁矿', cost: 12000, product: 'ore', rate: 7, desc: '每7天产出铁矿，产量稳定。' },
];

const RECIPES = [
  { id: 'weaving', name: '缫丝织造', product: 'silk', mat: 'cocoon', desc: '化茧成蝶，织就云锦。' },
  { id: 'tea_art', name: '炒茶技艺', product: 'tea', mat: 'raw_tea', desc: '揉捻烘焙，茶香四溢。' },
  { id: 'smithing', name: '冶炼锻造', product: 'tool', mat: 'ore', desc: '千锤百炼，铁树银花。' },
  { id: 'ceramics', name: '制瓷术', product: 'vase', mat: 'clay', desc: '烧制青花瓷，巧夺天工。' },
  { id: 'alchemy', name: '炼丹术', product: 'pill', mat: 'herb', desc: '炼制回春丹，救死扶伤。' },
];

const GOODS_POOL = [
  { id: 'rice', name: '太湖梗米', basePrice: 10, volatility: 0.1, type: 'raw', desc: '民以食为天' },
  { id: 'cocoon', name: '桑蚕茧', basePrice: 20, volatility: 0.2, type: 'raw', desc: '缫丝原料', producedBy: 'mulberry_farm' },
  { id: 'raw_tea', name: '雨前生茶', basePrice: 15, volatility: 0.3, type: 'raw', desc: '制茶原料', producedBy: 'tea_mountain' },
  { id: 'ore', name: '粗铁矿', basePrice: 30, volatility: 0.1, type: 'raw', desc: '冶炼原料', producedBy: 'mine' },
  { id: 'clay', name: '高岭瓷土', basePrice: 50, volatility: 0.2, type: 'raw', desc: '制瓷原料' },
  { id: 'herb', name: '长白山参', basePrice: 400, volatility: 0.3, type: 'raw', desc: '炼丹原料' },
  { id: 'silk', name: '苏绣丝绸', basePrice: 150, volatility: 0.5, type: 'crafted', recipe: { skill: 'weaving', mat: 'cocoon', cost: 10 } },
  { id: 'tea', name: '西湖龙井', basePrice: 120, volatility: 0.4, type: 'crafted', recipe: { skill: 'tea_art', mat: 'raw_tea', cost: 5 } },
  { id: 'tool', name: '精铁农具', basePrice: 100, volatility: 0.2, type: 'crafted', recipe: { skill: 'smithing', mat: 'ore', cost: 15 } },
  { id: 'vase', name: '青花瓷', basePrice: 800, volatility: 0.3, type: 'crafted', recipe: { skill: 'ceramics', mat: 'clay', cost: 50 } },
  { id: 'pill', name: '回春丹', basePrice: 1200, volatility: 0.1, type: 'crafted', recipe: { skill: 'alchemy', mat: 'herb', cost: 100 } },
  { id: 'spice', name: '西域香料', basePrice: 200, volatility: 0.6, type: 'trade' },
  { id: 'pearl', name: '南海珍珠', basePrice: 350, volatility: 0.6, type: 'trade' },
  { id: 'wine', name: '绍兴黄酒', basePrice: 30, volatility: 0.3, type: 'trade' },
];

const CITY_POOL = [
  { id: 'suzhou', name: '苏州', desc: '园林甲天下，丝绸最出名。', region: 'south' },
  { id: 'hangzhou', name: '杭州', desc: '西湖美景，龙井茶香。', region: 'south' },
  { id: 'beijing', name: '北京', desc: '天子脚下，皇城根儿。', region: 'north' },
  { id: 'guangzhou', name: '广州', desc: '岭南重镇，海外奇珍。', region: 'south' },
  { id: 'changan', name: '长安', desc: '丝路起点，胡商云集。', region: 'north' },
  { id: 'chengdu', name: '成都', desc: '天府之国，锦绣繁华。', region: 'west' },
  { id: 'dunhuang', name: '敦煌', desc: '大漠孤烟，飞天壁画。', region: 'west' },
  { id: 'kaifeng', name: '开封', desc: '清明上河，夜市千灯。', region: 'north' },
];

const BEAUTY_POOL = [
  { id: 'yun', name: '芸娘', title: '青梅竹马', desc: '情深义重，布衣菜饭。', buffDesc: '每次休整额外恢复10点健康', buffType: 'health_support', keywords: 'gentle wife', img: 'meinv1.jpg' },
  { id: 'su', name: '苏小小', title: '钱塘名妓', desc: '妾乘油壁车，郎骑青骢马。', buffDesc: '房产收益增加20%', buffType: 'income_boost', buffValue: 0.2, keywords: 'courtesan elegant', img: 'meinv2.jpg' },
  { id: 'dong', name: '董小宛', title: '秦淮八艳', desc: '针神曲圣，食谱传世。', buffDesc: '行囊容量增加50', buffType: 'inventory_boost', buffValue: 50, keywords: 'chef virtuous', img: 'meinv3.jpg' },
];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
const getAvatarUrl = (beauty) => {
  if (beauty.img) return beauty.img;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(`portrait of a beautiful ancient chinese girl named ${beauty.name}, ${beauty.keywords}, traditional hanfu, digital painting, soft lighting`)}?width=100&height=100&nologo=true`;
};

const MAX_DAYS = 365;
const BASE_INVENTORY_CAPACITY = 100;
const SAVE_KEY = 'FUSHENG_GAME_SAVE_V1';

export default function App() {
  const [generation, setGeneration] = useState(1);
  const [familyLog, setFamilyLog] = useState([]); 
  const [legacy, setLegacy] = useState(null); 
  const [collections, setCollections] = useState([]); 
  const [activeTalent, setActiveTalent] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInheritUI, setShowInheritUI] = useState(false); 
  const [isLoaded, setIsLoaded] = useState(false); 
  const [cities, setCities] = useState([]);
  const [beauties, setBeauties] = useState([]);
  const [cash, setCash] = useState(1000);
  const [health, setHealth] = useState(100);
  const [day, setDay] = useState(1);
  const [location, setLocation] = useState('');
  const [inventory, setInventory] = useState({});
  const [rank, setRank] = useState(0); 
  const [skills, setSkills] = useState({ weaving: 0, tea_art: 0, smithing: 0, ceramics: 0, alchemy: 0 });
  const [marketPrices, setMarketPrices] = useState({});
  const [stockMarket, setStockMarket] = useState([]); 
  const [myProperties, setMyProperties] = useState([]); 
  const [myIndustries, setMyIndustries] = useState([]); 
  const [relationships, setRelationships] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [marketTrend, setMarketTrend] = useState(null); // Add missing state for market trend

  const [activeTab, setActiveTab] = useState('market');
  const [logs, setLogs] = useState([]);
  const [modal, setModal] = useState(null);
  const [showBag, setShowBag] = useState(false);
  const [showSystem, setShowSystem] = useState(false); 
  const [importText, setImportText] = useState("");
  const [tradeModal, setTradeModal] = useState(null); 
  const logsEndRef = useRef(null);

  useEffect(() => {
    const loadGame = () => {
      try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
          const data = JSON.parse(savedData);
          setGeneration(data.global.generation || 1);
          setFamilyLog(data.global.familyLog || []);
          setLegacy(data.global.legacy || null);
          setCollections(data.global.collections || []);
          setUnlockedAchievements(data.global.unlockedAchievements || []);
          
          if (data.current) {
            setCash(safeNum(data.current.cash, 1000));
            setHealth(safeNum(data.current.health, 100));
            setDay(safeNum(data.current.day, 1));
            setLocation(data.current.location);
            setInventory(data.current.inventory || {});
            setRank(data.current.rank || 0);
            setSkills(data.current.skills || {});
            setCities(data.current.cities || []);
            setBeauties(data.current.beauties || []);
            setRelationships(data.current.relationships || {});
            setMyProperties(data.current.myProperties || []);
            setMyIndustries(data.current.myIndustries || []);
            setMarketPrices(data.current.marketPrices || {});
            setStockMarket(data.current.stockMarket || []);
            setActiveTalent(data.current.activeTalent || null);
            setGameStarted(true);
            setLogs(data.current.logs || []);

            if (data.timestamp) {
              const now = Date.now();
              const diffHours = (now - data.timestamp) / (1000 * 60 * 60);
              if (diffHours > 1) { 
                const hours = Math.min(24, Math.floor(diffHours));
                const rankIncome = RANKS[data.current.rank || 0].idleIncome || 0;
                let propIncome = 0;
                (data.current.myProperties || []).forEach(p => {
                   propIncome += (PROPERTIES.find(def => def.id === p.id)?.income || 0) * p.count;
                });
                const totalOfflineGain = Math.floor(safeNum(rankIncome + propIncome) * hours * 0.5);
                if (totalOfflineGain > 0) {
                  setCash(prev => safeNum(prev) + totalOfflineGain);
                  setTimeout(() => showModal('good', '离线收益', `你离开期间，商号伙计帮你赚了 ${totalOfflineGain} 两银子。\n(离线 ${hours} 小时)`), 1000);
                }
              }
            }
          } else {
            setShowInheritUI(true);
          }
        } else {
          initGame();
        }
      } catch (e) {
        console.error("存档读取失败", e);
        initGame();
      }
      setIsLoaded(true);
    };
    loadGame();
  }, []);

  useEffect(() => {
    if (!isLoaded || !gameStarted) return;
    const currentCashSafe = safeNum(cash, 0);
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      global: {
        generation, familyLog, legacy, unlockedAchievements, collections
      },
      current: {
        cash: currentCashSafe, health, day, location, inventory, rank, skills,
        cities, beauties, relationships, myProperties, myIndustries,
        marketPrices, stockMarket, activeTalent, logs: logs.slice(-20) 
      }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }, [day, cash, inventory, rank, skills, generation, relationships, isLoaded, gameStarted]);

  const exportSave = () => {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return showModal('bad', '无存档', '尚无游戏记录');
    try {
      const encoded = btoa(unescape(encodeURIComponent(data))); 
      const textArea = document.createElement("textarea");
      textArea.value = encoded;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showModal('good', '导出成功', '存档码已复制到剪贴板！\n请保存在安全的地方。');
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        showModal('bad', '复制失败', '请手动复制以下存档码：\n' + encoded.substring(0, 20) + '...');
      }
      document.body.removeChild(textArea);
    } catch (e) {
      showModal('bad', '导出失败', '无法生成存档码');
    }
  };

  const importSave = () => {
    if (!importText) return;
    try {
      const decoded = decodeURIComponent(escape(atob(importText)));
      JSON.parse(decoded); 
      localStorage.setItem(SAVE_KEY, decoded);
      showModal('good', '导入成功', '即将刷新页面加载存档...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      showModal('bad', '导入失败', '存档码格式错误或已损坏');
    }
  };

  const hardReset = () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[第${day}日] ${msg}`]);
  };

  useEffect(() => {
    if (!gameStarted) return;
    const currentGoal = GENERATION_GOALS.find(g => g.gen === generation) || GENERATION_GOALS[GENERATION_GOALS.length - 1];
    const stateSnapshot = {
      day, assets: calculateTotalAssets(), 
      props: myProperties.length + myIndustries.length,
      lovers: Object.values(relationships).filter(r => r.unlocked).length,
      rank, cities: 4, 
      masterSkills: Object.values(skills).filter(v => v >= 100).length
    };
    if (currentGoal.check(stateSnapshot) && !unlockedAchievements.includes(`gen_${generation}`)) {
      setUnlockedAchievements(prev => [...prev, `gen_${generation}`]);
      showModal('good', '达成人生目标', `恭喜完成【${currentGoal.title}】！\n获得传家宝：${currentGoal.reward}`);
      addLog(`【里程碑】完成了本世夙愿：${currentGoal.title}`);
    }
  }, [day, cash, myProperties, myIndustries, relationships, rank, skills]);

  const initGame = (selectedTalent = null) => {
    const selectedCities = shuffleArray(CITY_POOL).slice(0, 5); 
    setCities(selectedCities);
    setLocation(selectedCities[0].id);

    const selectedBeauties = shuffleArray(BEAUTY_POOL).slice(0, 3);
    setBeauties(selectedBeauties);
    const initRel = {};
    selectedBeauties.forEach(b => initRel[b.id] = { lv: 1, exp: 0, following: false, unlocked: false });
    setRelationships(initRel);

    let startCash = Math.floor(Math.random() * 1000) + 800; 
    if (legacy) {
      startCash += Math.floor(safeNum(legacy.cash) * 0.7); 
      addLog(`继承了祖上 ${Math.floor(safeNum(legacy.cash) * 0.7)} 两遗产。`);
    }
    if (selectedTalent?.type === 'cash') startCash += selectedTalent.val;
    setCash(startCash);

    const initSkills = { weaving: 0, tea_art: 0, smithing: 0, ceramics: 0, alchemy: 0 };
    if (legacy) {
      Object.keys(legacy.skills || {}).forEach(k => {
        initSkills[k] = Math.floor(safeNum(legacy.skills[k]) * 0.5); 
      });
      addLog('继承了家族流传的技艺经验。');
    }
    setSkills(initSkills);

    setActiveTalent(selectedTalent);
    if (selectedTalent?.type === 'health') setHealth(150);
    else setHealth(100);

    setDay(1);
    setInventory({});
    setMyProperties([]);
    setMyIndustries([]);
    setStockMarket([]); 
    setRank(0);
    setLogs([`第 ${generation} 世开启。你的身份是：${RANKS[0].title}。目标：${GENERATION_GOALS.find(g=>g.gen===generation)?.desc || '活下去'}`]);
    
    refreshPrices(selectedCities, 0);
    setGameStarted(true);
    setShowInheritUI(false);
  };

  const refreshPrices = (currentCities, dayCount) => {
    const termIdx = Math.floor((dayCount % 365) / 15) % 24;
    const term = SOLAR_TERMS[termIdx];
    const newPrices = {};

    currentCities.forEach(city => {
      const cityPrices = {};
      GOODS_POOL.forEach(good => {
        if (good.type === 'raw' && good.producedBy) return; 
        
        let base = good.basePrice;
        if (term.name === '清明' && good.id === 'raw_tea') base *= 0.5; 
        if (term.name === '寒露' && good.id === 'silk') base *= 1.3;
        if (term.name === '大寒' && (good.id === 'wine' || good.id === 'rice')) base *= 1.5;

        // Market trend logic can be added here if needed, keeping simple random for now
        let trendMult = 1;
        if (marketTrend && marketTrend.targetGoodsId === good.id) {
             trendMult = marketTrend.multiplier;
        }

        let price = Math.round(base * (1 + (Math.random() - 0.5) * 2 * good.volatility) * trendMult);
        if (rank >= 3 && Math.random() < 0.2) price = Math.round(price * 1.4);
        
        cityPrices[good.id] = Math.max(1, price);
      });
      newPrices[city.id] = cityPrices;
    });
    setMarketPrices(newPrices);
  };

  const advanceTime = (daysPass, targetCityId = null) => {
    const newDay = day + daysPass;
    const termIdx = Math.floor((newDay % 365) / 15) % 24;
    const currentTerm = SOLAR_TERMS[termIdx];
    let dailyLog = [];

    // Market trend update
    if (newDay % 3 === 0 && Math.random() < 0.2) {
         const targetGood = GOODS_POOL[Math.floor(Math.random() * GOODS_POOL.length)];
         const isBoom = Math.random() > 0.5;
         setMarketTrend({
             targetGoodsId: targetGood.id,
             multiplier: isBoom ? 1.5 : 0.6,
             effectDesc: isBoom ? `${targetGood.name}价格飞涨！` : `${targetGood.name}价格暴跌！`
         });
    } else if (newDay % 3 === 0) {
        setMarketTrend(null);
    }

    const newIndustries = myIndustries.map(ind => {
      const def = INDUSTRIES.find(i => i.id === ind.id);
      let production = 0;
      const progress = ind.progress + daysPass;
      if (progress >= def.rate) {
        production = Math.floor(progress / def.rate) * ind.count;
        if (currentTerm.name === '清明' && ind.id === 'tea_mountain') production *= 2;
        if (currentTerm.name === '春分' && ind.id === 'mulberry_farm') production *= 2;
        
        setInventory(prev => ({ ...prev, [def.product]: (prev[def.product] || 0) + production }));
        dailyLog.push(`产业【${def.name}】产出 ${production} ${GOODS_POOL.find(g=>g.id===def.product)?.name}`);
        return { ...ind, progress: progress % def.rate };
      }
      return { ...ind, progress };
    });
    setMyIndustries(newIndustries);

    let healthChange = 0;
    if (targetCityId) {
      const baseCost = 80;
      const discount = rank >= 1 ? 0.8 : 1;
      const cost = Math.round(baseCost * daysPass * discount);
      if (cash < cost) return showModal('bad', '没钱', '路费不够');
      
      setCash(c => safeNum(c) - safeNum(cost));
      setLocation(targetCityId);
      healthChange = -5 * daysPass;
      if (['大暑', '冬至', '大寒'].includes(currentTerm.name)) healthChange *= 2;
      
      const cityName = cities.find(c=>c.id===targetCityId)?.name || '未知';
      dailyLog.push(`前往${cityName}，耗时${daysPass}天，花费${cost}。`);
    } else {
      let heal = 10;
      if (Object.values(relationships).some(r => r.following && r.lv>=3)) heal = 20;
      if (currentTerm.name === '立春') heal += 5;
      healthChange = heal * daysPass;
      dailyLog.push(`修整${daysPass}天。`);
    }

    let propIncome = 0;
    const incomeBuff = Object.values(relationships).some(r => r.following && r.lv>=3) ? 1.5 : 1;
    myProperties.forEach(p => {
      propIncome += PROPERTIES.find(def => def.id === p.id).income * p.count * daysPass;
    });
    if (propIncome > 0) {
      const finalIncome = Math.floor(propIncome * incomeBuff);
      setCash(c => safeNum(c) + safeNum(finalIncome));
      dailyLog.push(`房产收益 +${finalIncome}`);
    }

    setDay(newDay);
    setHealth(h => Math.min(activeTalent?.type==='health'?150:100, Math.max(0, h + healthChange)));
    refreshPrices(cities, newDay);
    
    if (Math.floor((day % 365) / 15) !== termIdx) {
      showModal('info', `节气：${currentTerm.name}`, currentTerm.desc);
    }

    dailyLog.forEach(l => addLog(l));

    if (health + healthChange <= 0 || newDay >= 365 * 3) { 
      handleEndGeneration(health + healthChange <= 0 ? '病逝' : '寿终正寝');
    }
  };

  const craftItem = (recipeId) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    const hasMat = (inventory[recipe.mat] || 0) > 0;
    if (!hasMat) return showModal('bad', '缺原料', `需要${GOODS_POOL.find(g=>g.id===recipe.mat)?.name}`);
    if (cash < recipe.cost) return showModal('bad', '缺钱', '加工费不足');

    const successRate = 0.5 + (skills[recipeId] * 0.005) + (activeTalent?.type==='clever' ? 0.2 : 0);
    setCash(c => safeNum(c) - safeNum(recipe.cost));
    setInventory(prev => ({...prev, [recipe.mat]: prev[recipe.mat] - 1}));

    if (Math.random() < successRate) {
      setInventory(prev => ({...prev, [recipe.product]: (prev[recipe.product]||0) + 1}));
      setSkills(prev => ({...prev, [recipeId]: Math.min(100, prev[recipeId] + 5)}));
      showModal('good', '成功', `制成${GOODS_POOL.find(g=>g.id===recipe.product)?.name}！`);
    } else {
      setSkills(prev => ({...prev, [recipeId]: Math.min(100, prev[recipeId] + 1)}));
      showModal('bad', '失败', '手滑了，原料报废。');
    }
  };

  const interactNPC = (id, action) => {
    const npc = beauties.find(b => b.id === id);
    const rel = relationships[id];
    
    if (action === 'visit') {
      if (cash < 100) return showModal('bad', '囊中羞涩', '拜访需要带点礼物(100两)');
      setCash(prev => safeNum(prev) - 100);
      setRelationships(prev => ({
        ...prev, 
        [id]: { ...rel, unlocked: true, exp: rel.exp + 10 }
      }));
      if (rel.exp + 10 >= rel.lv * 50) {
        setRelationships(prev => ({
          ...prev, 
          [id]: { ...prev[id], lv: rel.lv + 1, exp: 0 }
        }));
        showModal('good', '感情升温', `${npc.name} 对你的好感提升到了 Lv${rel.lv + 1}！`);
      } else {
        addLog(`拜访了${npc.name}，相谈甚欢。`);
      }
    } else if (action === 'follow') {
      if (rel.lv < 3) return showModal('bad', '羁绊不足', '好感度达到 Lv3 才能邀请跟随。');
      setRelationships(prev => ({
        ...prev,
        [id]: { ...rel, following: !rel.following }
      }));
    }
  };

  const handleEndGeneration = (reason) => {
    const totalAssets = calculateTotalAssets();
    const historyEntry = {
      gen: generation,
      rank: RANKS[rank].title,
      assets: totalAssets,
      reason: reason,
      date: new Date().toLocaleDateString()
    };
    
    setFamilyLog(prev => [historyEntry, ...prev]);
    setLegacy({ cash: totalAssets, skills: skills });
    
    const saveData = {
        version: '1.0',
        timestamp: Date.now(),
        global: { generation: generation + 1, familyLog: [historyEntry, ...familyLog], legacy: { cash: totalAssets, skills: skills }, unlockedAchievements, collections },
        current: null 
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

    setGameStarted(false); 
    setGeneration(g => g + 1);
  };

  const calculateTotalAssets = () => {
    let total = cash;
    Object.keys(inventory).forEach(k => {
      const g = GOODS_POOL.find(x => x.id === k);
      if(g) total += (inventory[k] || 0) * g.basePrice;
    });
    myProperties.forEach(p => total += p.count * PROPERTIES.find(def=>def.id===p.id).cost);
    myIndustries.forEach(p => total += p.count * INDUSTRIES.find(def=>def.id===p.id).cost);
    return total;
  };

  const showModal = (type, title, desc) => setModal({ type, title, desc });

  const openTradeModal = (goodId, type, price) => {
    const good = GOODS_POOL.find(g => g.id === goodId);
    let max = 0;
    
    if (type === 'buy') {
      const maxAfford = Math.floor(cash / price);
      const space = getMaxInventory() - Object.values(inventory).reduce((a, b) => a + b, 0);
      max = Math.min(maxAfford, space);
    } else {
      max = inventory[goodId] || 0;
    }

    if (max <= 0) {
      if (type === 'buy') {
        if (cash < price) return showModal('bad', '穷', '钱不够买哪怕一个');
        return showModal('bad', '满', '背包已满');
      } else {
        return;
      }
    }

    setTradeModal({ 
      good, 
      type, 
      price, 
      max, 
      amount: 1 
    });
  };

  const confirmTrade = () => {
    if (!tradeModal) return;
    const { good, type, price, amount } = tradeModal;
    const total = safeNum(price) * safeNum(amount);

    if (type === 'buy') {
      setCash(c => safeNum(c) - total);
      setInventory(prev => ({...prev, [good.id]: (prev[good.id] || 0) + amount}));
    } else {
      setCash(c => safeNum(c) + total);
      setInventory(prev => ({...prev, [good.id]: prev[good.id] - amount}));
    }
    setTradeModal(null);
  };

  const getMaxInventory = () => {
    let bonus = 0;
    if (Object.values(relationships).some(r => r.following && r.lv >= 3)) {
        bonus = 50; 
    }
    return BASE_INVENTORY_CAPACITY + bonus;
  };

  if (showInheritUI) {
    return (
      <div className="min-h-screen bg-stone-900 text-amber-50 flex flex-col items-center justify-center p-6 relative">
        <button onClick={()=>setShowSystem(true)} className="absolute top-4 right-4 p-2 bg-stone-800 rounded-full hover:bg-stone-700 border border-stone-600">
            <Settings size={20} />
        </button>

        <h1 className="text-4xl font-bold mb-2 text-amber-500 font-serif">第 {generation} 世 轮回</h1>
        <p className="text-stone-400 mb-8">先祖积累：银两 {Math.floor(legacy ? legacy.cash * 0.7 : 0)} | 技艺传承</p>
        
        <h3 className="text-xl mb-4 flex items-center gap-2 text-amber-200"><Star className="text-yellow-400"/> 请选择本世天赋</h3>
        <div className="grid gap-4 w-full max-w-sm">
          {TALENTS.sort(() => 0.5 - Math.random()).slice(0, 3).map(talent => (
            <button 
              key={talent.id}
              onClick={() => initGame(talent)}
              className="bg-stone-800 border border-stone-600 p-4 rounded-xl text-left hover:border-amber-500 hover:bg-stone-700 transition"
            >
              <div className="font-bold text-lg text-amber-200">{talent.name}</div>
              <div className="text-sm text-stone-400">{talent.desc}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 w-full max-w-sm">
          <h3 className="text-sm font-bold text-stone-500 mb-2 uppercase">家族族谱</h3>
          <div className="bg-stone-800 rounded-lg p-2 h-32 overflow-y-auto custom-scrollbar">
            {familyLog.map((log, i) => (
              <div key={i} className="text-xs flex justify-between border-b border-stone-700 py-2">
                <span>{log.gen}世. {log.rank}</span>
                <span className="text-amber-500">{log.assets}两</span>
                <span className="text-stone-500">{log.reason}</span>
              </div>
            ))}
          </div>
        </div>

        {showSystem && <SystemModal onClose={()=>setShowSystem(false)} onExport={exportSave} onImport={importSave} onReset={hardReset} importText={importText} setImportText={setImportText} />}
      </div>
    );
  }

  if (!isLoaded || (!gameStarted && generation === 1)) return <div className="min-h-screen flex items-center justify-center bg-[#fffcf5] text-stone-600">载入历史长河...</div>;

  const currentCityData = cities.find(c => c.id === location) || cities[0] || {name: '未知', desc: ''};
  const termIdx = Math.floor((day % 365) / 15) % 24;
  const currentTerm = SOLAR_TERMS[termIdx];

  return (
    <div className="h-screen bg-[#fdfbf7] text-stone-800 font-sans flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      
      {/* 装饰边角 */}
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-50 z-20" style={{backgroundImage: 'radial-gradient(circle at top left, #e6d0a3 10%, transparent 70%)'}}></div>
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-50 z-20" style={{backgroundImage: 'radial-gradient(circle at top right, #e6d0a3 10%, transparent 70%)'}}></div>

      {/* 顶部 */}
      <div className="bg-[#5c3a21] text-[#f8e8c8] p-4 pb-4 shadow-lg z-10 shrink-0 border-b-2 border-[#8b5a3b]" style={{backgroundImage: 'linear-gradient(45deg, #5c3a21 25%, #6b442a 25%, #6b442a 50%, #5c3a21 50%, #5c3a21 75%, #6b442a 75%, #6b442a 100%)', backgroundSize: '20px 20px', backgroundOpacity: 0.1}}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif tracking-widest text-[#f8e8c8]">牛牛家族</h1>
              <span className="text-[10px] bg-[#3e2716] px-2 py-0.5 rounded border border-[#8b5a3b] text-[#d4b996]">第{generation}代</span>
            </div>
            <div className="text-xs text-[#d4b996] mt-1 flex gap-2 items-center font-serif">
              <span className="bg-[#3e2716]/50 px-1 rounded">{RANKS[rank].title}</span>
              <span>{day}天</span>
              <span>{currentTerm.name} ({SEASONS[Math.floor(termIdx/6)]})</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setShowSystem(true)} className="p-2 bg-[#3e2716] rounded-full hover:bg-[#4e311b] border border-[#8b5a3b] text-[#f8e8c8]"><Settings size={18}/></button>
             <button onClick={() => setShowBag(true)} className="p-2 bg-[#3e2716] rounded-full hover:bg-[#4e311b] border border-[#8b5a3b] text-[#f8e8c8]"><Backpack size={18}/></button>
          </div>
        </div>
        <div className="flex justify-between px-2 text-[#f8e8c8]">
          <div className="text-center flex flex-col items-center">
            <div className="text-[10px] opacity-70 mb-1 flex items-center gap-1"><Coins size={12}/> 银两</div>
            <div className="text-lg font-serif font-bold">{safeNum(cash)}</div>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="text-[10px] opacity-70 mb-1 flex items-center gap-1"><Heart size={12}/> 健康</div>
            <div className="text-lg font-serif font-bold">{health}</div>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="text-[10px] opacity-70 mb-1 flex items-center gap-1"><Crown size={12}/> 总资产</div>
            <div className="text-lg font-serif font-bold">{calculateTotalAssets()}</div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfbf7]">
        
        {/* 市场 */}
        {activeTab === 'market' && (
          <div className="bg-[#fdfbf7] p-4 rounded-xl shadow-sm border border-[#e6d0a3]">
            <h2 className="font-bold mb-3 flex items-center text-[#5c3a21] font-serif border-b border-[#e6d0a3] pb-2">
              <ShoppingBag className="mr-2 text-[#8b5a3b]" size={18}/> {currentCityData.name}集市
            </h2>
            <div className="space-y-3">
              {GOODS_POOL.filter(g => g.type !== 'raw' || !g.producedBy).map(good => { 
                const price = marketPrices[location]?.[good.id];
                // 简单的价格趋势模拟 (实际项目中应记录历史价格)
                const trend = price > good.basePrice ? 'up' : price < good.basePrice ? 'down' : 'flat';
                
                return (
                  <div key={good.id} className="flex justify-between items-center bg-[#fff] p-3 rounded-lg border border-[#f0e4d0] shadow-sm">
                    <div>
                      <div className="font-bold text-[#5c3a21] text-sm">{good.name}</div>
                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                        市价 
                        <span className={`font-mono text-sm font-bold ${trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-stone-600'}`}>
                          {price||'-'}
                        </span>
                        {trend === 'up' && <ArrowUp size={10} className="text-red-500"/>}
                        {trend === 'down' && <ArrowDown size={10} className="text-green-500"/>}
                        {trend === 'flat' && <Minus size={10} className="text-stone-300"/>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8b5a3b] bg-[#f8f4eb] px-2 py-0.5 rounded">持: {inventory[good.id]||0}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openTradeModal(good.id, 'sell', price)}
                          disabled={!price || !inventory[good.id]}
                          className="px-3 py-1 bg-[#f0e4d0] text-[#5c3a21] text-xs rounded hover:bg-[#e6d0a3] disabled:opacity-30 shadow-sm active:translate-y-0.5 transition-all font-serif"
                        >
                          售出
                        </button>
                        <button 
                          onClick={() => openTradeModal(good.id, 'buy', price)}
                          disabled={!price}
                          className="px-3 py-1 bg-[#8b5a3b] text-[#f8e8c8] text-xs rounded hover:bg-[#6b442a] disabled:opacity-30 shadow-sm active:translate-y-0.5 transition-all font-serif"
                        >
                          购入
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 产业 */}
        {activeTab === 'industry' && (
          <div className="space-y-4">
            <div className="bg-[#fdfbf7] p-4 rounded-xl shadow-sm border border-[#e6d0a3]">
              <h2 className="font-bold mb-3 flex items-center text-[#5c3a21] font-serif border-b border-[#e6d0a3] pb-2"><Sprout className="mr-2 text-green-700" size={18}/> 家族产业</h2>
              {INDUSTRIES.map(ind => {
                const owned = myIndustries.find(i => i.id === ind.id);
                return (
                  <div key={ind.id} className="flex justify-between items-center mb-3 pb-3 border-b border-[#f0e4d0] last:border-0 last:pb-0">
                    <div>
                      <div className="font-bold text-sm text-[#5c3a21]">{ind.name}</div>
                      <div className="text-xs text-stone-500">{ind.desc}</div>
                    </div>
                    {owned ? (
                      <div className="text-right">
                        <div className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">拥有 x{owned.count}</div>
                        <div className="text-[10px] text-stone-400 mt-1">进度 {Math.floor((owned.progress/ind.rate)*100)}%</div>
                      </div>
                    ) : (
                      <button onClick={()=>{
                        if(cash<ind.cost) return showModal('bad','缺钱','买不起地契');
                        setCash(c=>safeNum(c)-ind.cost);
                        setMyIndustries(prev=>[...prev, {id:ind.id, count:1, progress:0}]);
                      }} className="text-xs bg-[#5c3a21] text-[#f8e8c8] px-3 py-1.5 rounded hover:bg-[#4e311b] shadow-sm font-serif">购买 {ind.cost}</button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-[#fdfbf7] p-4 rounded-xl shadow-sm border border-[#e6d0a3]">
              <h2 className="font-bold mb-3 flex items-center text-[#5c3a21] font-serif border-b border-[#e6d0a3] pb-2"><Factory className="mr-2 text-blue-700" size={18}/> 技艺工坊</h2>
              <div className="flex gap-2 mb-3 overflow-x-auto text-[10px] pb-1">
                {Object.entries(skills).map(([k,v]) => (
                  <span key={k} className="bg-blue-50 text-blue-700 px-2 py-1 rounded whitespace-nowrap border border-blue-100">{RECIPES.find(r=>r.id===k)?.name.slice(0,2) || k}:{v}</span>
                ))}
              </div>
              {RECIPES.map(recipe => (
                <div key={recipe.id} className="flex justify-between items-center bg-[#fff] p-2 rounded mb-2 border border-[#f0e4d0]">
                  <div className="text-xs">
                    <span className="font-bold text-[#5c3a21]">{recipe.name}</span>
                    <div className="text-stone-500 scale-90 origin-left mt-0.5">{GOODS_POOL.find(g=>g.id===recipe.mat)?.name} → {GOODS_POOL.find(g=>g.id===recipe.product)?.name}</div>
                  </div>
                  <button onClick={()=>craftItem(recipe.id)} className="text-xs bg-blue-700 text-white px-3 py-1.5 rounded hover:bg-blue-800 shadow-sm font-serif">制造 (费{recipe.cost})</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 移动/世界 */}
        {activeTab === 'travel' && (
          <div className="space-y-3">
            {cities.map(city => {
              if (city.id === location) return null;
              return (
                <button key={city.id} onClick={()=>advanceTime(2, city.id)} className="w-full bg-[#fff] p-4 rounded-xl flex justify-between items-center shadow-sm border border-[#e6d0a3] hover:bg-[#f8f4eb] transition-colors group">
                  <div className="text-left">
                    <div className="font-bold text-sm text-[#5c3a21] font-serif text-lg">{city.name}</div>
                    <div className="text-xs text-stone-500 mt-1">{city.desc}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-stone-400 group-hover:text-[#8b5a3b]">2天路程</div>
                    <div className="font-bold text-[#8b5a3b] mt-1">耗资 160两</div>
                  </div>
                </button>
              )
            })}
            <button onClick={()=>advanceTime(1)} className="w-full bg-[#e6d0a3]/30 p-4 rounded-xl font-bold text-[#5c3a21] flex justify-center gap-2 hover:bg-[#e6d0a3]/50 transition-colors font-serif"><Home size={18}/> 原地修整</button>
          </div>
        )}

        {/* 知己 */}
        {activeTab === 'beauties' && (
          <div className="space-y-4">
            {beauties.map(beauty => {
              const rel = relationships[beauty.id];
              if (!rel) return null;

              return (
                <div key={beauty.id} className="bg-[#fdfbf7] p-4 rounded-xl shadow-sm border border-[#e6d0a3] overflow-hidden relative">
                  <div className="flex gap-4">
                    <img 
                      src={getAvatarUrl(beauty)} 
                      alt={beauty.name} 
                      className="w-20 h-20 rounded-lg object-cover border-2 border-[#e6d0a3] shadow-sm" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-[#5c3a21] font-serif">{beauty.name}</h3>
                        <div className="text-xs text-pink-600 font-bold border border-pink-200 px-2 py-0.5 rounded bg-pink-50">Lv.{rel.lv}</div>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1 italic">"{beauty.desc}"</p>
                      
                      <div className="w-full bg-[#f0e4d0] h-1.5 rounded-full mt-3 mb-1">
                        <div className="bg-pink-400 h-1.5 rounded-full transition-all" style={{width: `${Math.min(100, (rel.exp / (rel.lv*50))*100)}%`}}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 mb-3">
                        <span>羁绊 {rel.exp}/{rel.lv*50}</span>
                        <span>特权: Lv3解锁跟随</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {!rel.unlocked ? (
                          <button onClick={()=>interactNPC(beauty.id, 'visit')} className="flex-1 bg-[#5c3a21] text-[#f8e8c8] text-xs py-1.5 rounded shadow-sm hover:bg-[#4e311b] font-serif">初访 (100两)</button>
                        ) : (
                          <>
                            <button onClick={()=>interactNPC(beauty.id, 'visit')} className="flex-1 border border-[#8b5a3b] text-[#5c3a21] text-xs py-1.5 rounded hover:bg-[#f8f4eb] font-serif">拜访</button>
                            {rel.lv >= 3 && (
                              <button 
                                onClick={()=>interactNPC(beauty.id, 'follow')} 
                                className={`flex-1 text-xs py-1.5 rounded font-bold font-serif shadow-sm ${rel.following ? 'bg-pink-500 text-white' : 'bg-white border border-pink-300 text-pink-500'}`}
                              >
                                {rel.following ? '跟随中' : '邀请'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {rel.following && (
                    <div className="mt-3 text-[10px] flex items-center justify-center gap-1 bg-pink-50/50 text-pink-700 py-1.5 rounded border border-pink-100">
                      <Heart size={10} className="fill-current"/> 
                      <span>羁绊生效：{beauty.buffDesc}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 资产/身份 */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#5c3a21] to-[#3e2716] text-[#f8e8c8] p-5 rounded-xl shadow-lg relative overflow-hidden">
              <Crown className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
              <div className="relative z-10">
                <div className="text-xs text-[#d4b996] uppercase tracking-widest mb-1 opacity-70">Current Rank</div>
                <h2 className="text-2xl font-bold text-[#f8e8c8] mb-2 font-serif">{RANKS[rank].title}</h2>
                <p className="text-sm text-[#d4b996] mb-4">{RANKS[rank].desc}</p>
                <div className="bg-white/10 p-2 rounded text-xs mb-4 border border-white/10">
                  <span className="text-[#e6d0a3] font-bold">特权：</span> {RANKS[rank].perk}
                </div>
                
                {rank < 4 && (
                  <button onClick={()=>{
                    const next = RANKS[rank+1];
                    if(cash>=next.req.cash && myProperties.length+myIndustries.length >= next.req.cities) {
                      setRank(r=>r+1); showModal('good','晋升',`成为${next.title}!`);
                    } else {
                      showModal('bad','未达标',`需银两${next.req.cash}，资产${next.req.cities}`);
                    }
                  }} className="w-full bg-[#8b5a3b] hover:bg-[#6b442a] text-[#f8e8c8] py-2 rounded font-bold text-sm transition shadow-md border border-[#a67c52]">
                    晋升下一阶
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-[#fdfbf7] p-4 rounded-xl shadow-sm border border-[#e6d0a3]">
              <h3 className="font-bold text-sm mb-3 text-[#5c3a21] font-serif border-b border-[#e6d0a3] pb-2">名下房产</h3>
              {PROPERTIES.map(p => {
                const owned = myProperties.find(mp => mp.id === p.id);
                return (
                  <div key={p.id} className="flex justify-between items-center mb-2 text-sm border-b border-[#f0e4d0] pb-2 last:border-0">
                    <span>{p.name}</span>
                    {owned ? <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">已购</span> : 
                      <button onClick={()=>{
                        if(cash<p.cost) return showModal('bad','穷','');
                        setCash(c=>safeNum(c)-p.cost); setMyProperties(prev=>[...prev,{id:p.id, count:1}]);
                      }} className="bg-[#5c3a21] text-[#f8e8c8] px-3 py-1 rounded text-xs hover:bg-[#4e311b] font-serif">买 {p.cost}</button>
                    }
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* 底部日志 */}
      <div className="h-24 bg-[#e6d0a3]/20 border-t border-[#e6d0a3] p-2 overflow-y-auto text-[10px] font-mono text-[#5c3a21] shrink-0 font-serif leading-relaxed">
        {logs.slice().reverse().map((l, i) => <div key={i} className="mb-0.5">· {l}</div>)}
      </div>

      {/* 底部导航 */}
      <nav className="bg-[#fff] border-t border-[#e6d0a3] px-2 py-2 flex justify-between items-center text-[10px] shrink-0 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {[
          {id:'market', icon:ShoppingBag, l:'集市'},
          {id:'industry', icon:Sprout, l:'产业'},
          {id:'travel', icon:Map, l:'世界'},
          {id:'beauties', icon:Heart, l:'知己'},
          {id:'assets', icon:Briefcase, l:'家族'}
        ].map(t => (
          <button 
            key={t.id} 
            onClick={()=>setActiveTab(t.id)} 
            className={`flex flex-col items-center p-2 w-1/5 transition-all duration-300 ${activeTab===t.id ? 'text-[#8b5a3b] scale-110 font-bold' : 'text-stone-400 hover:text-[#8b5a3b]/70'}`}
          >
            <div className={`mb-1 relative ${activeTab===t.id ? 'drop-shadow-[0_0_8px_rgba(139,90,59,0.4)]' : ''}`}>
              <t.icon size={22} strokeWidth={activeTab===t.id?2.5:2}/>
            </div>
            {t.l}
          </button>
        ))}
      </nav>

      {/* 弹窗们 (z-index 提高到 60) */}
      {modal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" onClick={()=>setModal(null)}>
          <div className="bg-[#fffcf5] rounded-xl p-6 w-full max-w-sm text-center border-2 border-[#e6d0a3] shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              modal.type === 'good' ? 'bg-yellow-100 text-yellow-600' :
              modal.type === 'bad' ? 'bg-stone-800 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
              {modal.type === 'good' ? <Trophy/> : modal.type === 'bad' ? <AlertCircle/> : <Info/>}
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#5c3a21] font-serif">{modal.title}</h3>
            <p className="text-sm text-stone-600 mb-6 whitespace-pre-wrap leading-relaxed">{modal.desc}</p>
            <button onClick={()=>setModal(null)} className="w-full py-2.5 bg-[#5c3a21] text-[#f8e8c8] rounded-lg font-bold hover:bg-[#4e311b] active:scale-95 transition-transform">朕知道了</button>
          </div>
        </div>
      )}
      
      {showBag && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={()=>setShowBag(false)}>
          <div className="bg-[#fffcf5] w-3/4 max-h-[60vh] overflow-y-auto rounded-xl p-4 border-2 border-[#e6d0a3] shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold border-b border-[#e6d0a3] pb-2 mb-2 text-[#5c3a21] font-serif flex items-center gap-2">
              <Backpack size={18}/> 行囊
            </h3>
            {Object.entries(inventory).map(([k,v]) => v>0 && (
              <div key={k} className="flex justify-between text-sm py-2 border-b border-dashed border-[#e6d0a3] last:border-0 text-[#5c3a21]">
                <span>{GOODS_POOL.find(g=>g.id===k)?.name || '未知物品'}</span>
                <span className="font-mono font-bold bg-[#f0e4d0] px-2 rounded text-[#8b5a3b]">x{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tradeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" onClick={() => setTradeModal(null)}>
          <div className="bg-[#fffcf5] rounded-xl p-6 w-full max-w-sm border-2 border-[#e6d0a3] shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-center text-[#5c3a21] font-serif border-b border-[#e6d0a3] pb-2">
              {tradeModal.type === 'buy' ? '购入' : '售出'} {tradeModal.good.name}
            </h3>
            <div className="mb-6 bg-[#f8f4eb] p-4 rounded-lg">
              <div className="flex justify-between text-sm text-[#8b5a3b] mb-2 font-bold">
                <span>单价: {tradeModal.price}</span>
                <span>{tradeModal.type === 'buy' ? '限购' : '库存'}: {tradeModal.max}</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max={tradeModal.max} 
                  value={tradeModal.amount} 
                  onChange={(e) => setTradeModal({...tradeModal, amount: parseInt(e.target.value)})}
                  className="flex-1 accent-[#8b5a3b] h-2 bg-[#e6d0a3] rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-mono text-xl font-bold w-12 text-center text-[#5c3a21] bg-white rounded border border-[#e6d0a3] py-1">{tradeModal.amount}</span>
              </div>
              <div className="text-center mt-3 font-bold text-lg text-[#5c3a21] flex justify-center items-baseline gap-1">
                总价: <span className="text-2xl">{tradeModal.price * tradeModal.amount}</span> 两
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setTradeModal(null)} className="flex-1 py-3 bg-[#e6d0a3] text-[#5c3a21] rounded-lg font-bold hover:bg-[#d4b996] transition-colors">取消</button>
              <button onClick={confirmTrade} className="flex-1 py-3 bg-[#8b5a3b] text-[#f8e8c8] rounded-lg font-bold hover:bg-[#6b442a] shadow-md active:translate-y-0.5 transition-all">
                确认{tradeModal.type === 'buy' ? '购入' : '售出'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSystem && (
        <SystemModal 
          onClose={()=>setShowSystem(false)} 
          onExport={exportSave} 
          onImport={importSave} 
          onReset={hardReset} 
          importText={importText} 
          setImportText={setImportText} 
        />
      )}

    </div>
  );
}

// 独立的系统设置组件 (Refined UI)
function SystemModal({ onClose, onExport, onImport, onReset, importText, setImportText }) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (showQR) {
    return (
      <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md" onClick={() => setShowQR(false)}>
        <div className="relative bg-white p-4 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <button onClick={() => setShowQR(false)} className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg text-stone-500 hover:text-stone-800"><X size={20}/></button>
          <img src="./wechat.png" alt="群聊二维码" className="w-64 h-auto rounded-lg"/>
          <p className="text-center text-stone-500 mt-3 text-sm font-bold">长按识别二维码加入家族群</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#fdfbf7] text-[#5c3a21] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-[#e6d0a3]" onClick={e=>e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[#fff] p-4 flex justify-between items-center border-b border-[#e6d0a3]">
          <h2 className="text-lg font-bold flex items-center gap-2 font-serif"><Settings className="text-[#8b5a3b]"/> 系统设置</h2>
          <button onClick={onClose} className="text-[#8b5a3b] hover:text-[#5c3a21]"><X/></button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs flex gap-2 items-start">
            <AlertCircle size={16} className="shrink-0 mt-0.5"/>
            <div>
              <p className="font-bold mb-1">数据安全提示</p>
              请定期手动【保存进度】并复制存档码，防止浏览器清理缓存导致数据丢失。
            </div>
          </div>

          {/* Group Chat Entry */}
          <div 
            className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer active:scale-95 transition-transform border border-[#e6d0a3] hover:bg-[#f8f4eb]"
            onClick={() => setShowQR(true)}
          >
            <div>
              <div className="font-bold text-[#5c3a21]">加入家族群</div>
              <div className="text-xs text-[#8b5a3b]/70">与其他掌柜交流商道心得</div>
            </div>
            <Users className="text-[#8b5a3b]" size={24} />
          </div>

          {/* Import/Export Section */}
          <div className="space-y-3">
            <button 
              onClick={onExport} 
              className="w-full py-3 bg-[#4caf50] hover:bg-[#43a047] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-md active:translate-y-0.5 transition-all"
            >
              <Download size={18}/> 保存进度 (导出存档码)
            </button>

            <div className="bg-white p-3 rounded-lg shadow-inner border border-[#e6d0a3]">
                <textarea 
                value={importText}
                onChange={(e)=>setImportText(e.target.value)}
                placeholder="在此粘贴存档码以读取..."
                className="w-full bg-[#f8f4eb] border-none resize-none focus:ring-0 text-xs h-16 text-[#5c3a21] p-2 rounded mb-2 placeholder:text-[#d4b996]"
                />
                <button 
                onClick={onImport} 
                className="w-full py-2 bg-[#2196f3] hover:bg-[#1e88e5] text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm active:translate-y-0.5 transition-all"
                >
                <Upload size={14}/> 读取进度
                </button>
            </div>
          </div>

          {/* Reset Section */}
          <div className="pt-2 border-t border-[#e6d0a3]">
            <button 
              onClick={() => {
                if (resetConfirm) {
                  onReset();
                } else {
                  setResetConfirm(true);
                  setTimeout(() => setResetConfirm(false), 3000);
                }
              }} 
              className={`w-full py-3 border ${resetConfirm ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-transparent border-transparent text-stone-400 hover:text-stone-600'} rounded-lg flex items-center justify-center gap-2 text-xs transition-all`}
            >
              {resetConfirm ? <Trash2 size={14}/> : <LogOut size={14}/>}
              {resetConfirm ? '再次点击确认删除所有存档 (慎重!)' : '重新开启人生'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
