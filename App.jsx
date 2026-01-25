'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Coins, TrendingUp, Home, ShoppingBag, Navigation, History, 
  AlertCircle, Heart, Gift, X, Trophy, CloudLightning, Sun, Umbrella, 
  Zap, Info, RefreshCw, Backpack, Crown, Hammer, Snowflake, Flower, 
  Leaf, UserPlus, Star, Scroll, Anchor, Sprout, Factory, Baby
} from 'lucide-react';

// --- 1. 核心常量定义 (整合版) ---

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
  { id: 't_rich', name: '商贾世家', desc: '初始资金 +2000，且开局自带一本生意经（经验+）', type: 'cash', val: 2000 },
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
  { id: 0, title: '行脚商', desc: '初入商途，只能靠双脚丈量大地。', perk: '无', req: { cash: 0, cities: 1 } },
  { id: 1, title: '市井掌柜', desc: '在坊间小有名气，懂得精打细算。', perk: '跨城运费降低 20%', req: { cash: 5000, cities: 2, bondLv: 1 } },
  { id: 2, title: '州府商首', desc: '一方富豪，甚至能左右物价。', perk: '解锁【垄断】功能（可抬价销售）', req: { cash: 20000, cities: 3, bondLv: 3 } },
  { id: 3, title: '朝廷皇商', desc: '红顶商人，专供宫廷御用。', perk: '解锁【贡品贸易】（极高利润）', req: { cash: 100000, cities: 4, bondLv: 6 } },
  { id: 4, title: '江南巨贾', desc: '富可敌国，传说中的财神爷。', perk: '所有收益 +50%，通关游戏', req: { cash: 500000, cities: 4, bondLv: 10 } },
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
  // 原材料 (可生产)
  { id: 'rice', name: '太湖梗米', basePrice: 10, volatility: 0.1, type: 'raw', desc: '民以食为天' },
  { id: 'cocoon', name: '桑蚕茧', basePrice: 20, volatility: 0.2, type: 'raw', desc: '缫丝原料', producedBy: 'mulberry_farm' },
  { id: 'raw_tea', name: '雨前生茶', basePrice: 15, volatility: 0.3, type: 'raw', desc: '制茶原料', producedBy: 'tea_mountain' },
  { id: 'ore', name: '粗铁矿', basePrice: 30, volatility: 0.1, type: 'raw', desc: '冶炼原料', producedBy: 'mine' },
  { id: 'clay', name: '高岭瓷土', basePrice: 50, volatility: 0.2, type: 'raw', desc: '制瓷原料' },
  { id: 'herb', name: '长白山参', basePrice: 400, volatility: 0.3, type: 'raw', desc: '炼丹原料' },
  
  // 贸易/加工成品
  { id: 'silk', name: '苏绣丝绸', basePrice: 150, volatility: 0.5, type: 'crafted', recipe: { skill: 'weaving', mat: 'cocoon', cost: 10 } },
  { id: 'tea', name: '西湖龙井', basePrice: 120, volatility: 0.4, type: 'crafted', recipe: { skill: 'tea_art', mat: 'raw_tea', cost: 5 } },
  { id: 'tool', name: '精铁农具', basePrice: 100, volatility: 0.2, type: 'crafted', recipe: { skill: 'smithing', mat: 'ore', cost: 15 } },
  { id: 'vase', name: '青花瓷', basePrice: 800, volatility: 0.3, type: 'crafted', recipe: { skill: 'ceramics', mat: 'clay', cost: 50 } },
  { id: 'pill', name: '回春丹', basePrice: 1200, volatility: 0.1, type: 'crafted', recipe: { skill: 'alchemy', mat: 'herb', cost: 100 } },
  
  // 纯贸易品
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
  { id: 'yun', name: '芸娘', title: '青梅竹马', desc: '情深义重，布衣菜饭。', buffDesc: '每次休整额外恢复10点健康', buffType: 'health_support', keywords: 'gentle wife' },
  { id: 'su', name: '苏小小', title: '钱塘名妓', desc: '妾乘油壁车，郎骑青骢马。', buffDesc: '房产收益增加20%', buffType: 'income_boost', buffValue: 0.2, keywords: 'courtesan elegant' },
  { id: 'dong', name: '董小宛', title: '秦淮八艳', desc: '针神曲圣，食谱传世。', buffDesc: '行囊容量增加50', buffType: 'inventory_boost', buffValue: 50, keywords: 'chef virtuous' },
];

// --- 2. 辅助函数 ---

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
const getAvatarUrl = (beauty) => `https://image.pollinations.ai/prompt/${encodeURIComponent(`portrait of a beautiful ancient chinese girl named ${beauty.name}, ${beauty.keywords}, traditional hanfu, digital painting, soft lighting`)}?width=100&height=100&nologo=true`;

const MAX_DAYS = 365;
const BASE_INVENTORY_CAPACITY = 100;

export default function App() {
  // 家族/传承状态 (LocalStorage 持久化建议)
  const [generation, setGeneration] = useState(1);
  const [familyLog, setFamilyLog] = useState([]); 
  const [legacy, setLegacy] = useState(null); 
  const [activeTalent, setActiveTalent] = useState(null);
  
  // 当前世状态
  const [gameStarted, setGameStarted] = useState(false);
  const [showInheritUI, setShowInheritUI] = useState(false); 
  
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
  const [myProperties, setMyProperties] = useState([]); // 房产
  const [myIndustries, setMyIndustries] = useState([]); // 产业 { id, count, progress }
  
  const [relationships, setRelationships] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  // UI
  const [activeTab, setActiveTab] = useState('market');
  const [logs, setLogs] = useState([]);
  const [modal, setModal] = useState(null);
  const [showBag, setShowBag] = useState(false);
  const logsEndRef = useRef(null);

  // --- 初始化与生命周期 ---
  useEffect(() => {
    if (!gameStarted && !showInheritUI) {
      if (generation === 1) {
        initGame(); 
      } else {
        setShowInheritUI(true); 
      }
    }
  }, [generation]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 检查世代挑战
  useEffect(() => {
    if (!gameStarted) return;
    const currentGoal = GENERATION_GOALS.find(g => g.gen === generation) || GENERATION_GOALS[GENERATION_GOALS.length - 1];
    
    const stateSnapshot = {
      day, 
      assets: calculateTotalAssets(), 
      props: myProperties.length + myIndustries.length,
      lovers: Object.values(relationships).filter(r => r.unlocked).length,
      rank, 
      cities: 4, 
      masterSkills: Object.values(skills).filter(v => v >= 100).length
    };
    
    if (currentGoal.check(stateSnapshot) && !unlockedAchievements.includes(`gen_${generation}`)) {
      setUnlockedAchievements(prev => [...prev, `gen_${generation}`]);
      showModal('good', '达成人生目标', `恭喜完成【${currentGoal.title}】！\n获得传家宝：${currentGoal.reward}`);
      addLog(`【里程碑】完成了本世夙愿：${currentGoal.title}`);
    }
  }, [day, cash, myProperties, myIndustries, relationships, rank, skills]);

  const initGame = (selectedTalent = null) => {
    // 1. 世界生成
    const selectedCities = shuffleArray(CITY_POOL).slice(0, 5); 
    setCities(selectedCities);
    setLocation(selectedCities[0].id);

    const selectedBeauties = shuffleArray(BEAUTY_POOL).slice(0, 3);
    setBeauties(selectedBeauties);
    const initRel = {};
    selectedBeauties.forEach(b => initRel[b.id] = { lv: 1, exp: 0, following: false, unlocked: false });
    setRelationships(initRel);

    // 2. 资金继承与波动
    let startCash = Math.floor(Math.random() * 1000) + 800; 
    if (legacy) {
      startCash += Math.floor(legacy.cash * 0.7); 
      addLog(`继承了祖上 ${Math.floor(legacy.cash * 0.7)} 两遗产。`);
    }
    if (selectedTalent?.type === 'cash') startCash += selectedTalent.val;
    setCash(startCash);

    // 3. 技艺继承
    const initSkills = { weaving: 0, tea_art: 0, smithing: 0, ceramics: 0, alchemy: 0 };
    if (legacy) {
      Object.keys(legacy.skills).forEach(k => {
        initSkills[k] = Math.floor(legacy.skills[k] * 0.5); 
      });
      addLog('继承了家族流传的技艺经验。');
    }
    setSkills(initSkills);

    // 4. 天赋应用
    setActiveTalent(selectedTalent);
    if (selectedTalent?.type === 'health') setHealth(150);
    else setHealth(100);

    // 5. 初始化其他
    setDay(1);
    setInventory({});
    setMyProperties([]);
    setMyIndustries([]);
    setStockMarket([]); 
    setRank(0);
    setLogs([`第 ${generation} 世开启。你的身份是：${RANKS[0].title}。目标：${GENERATION_GOALS.find(g=>g.gen===generation)?.desc || '活下去'}`]);
    
    // 初始价格
    refreshPrices(selectedCities, 0);
    setGameStarted(true);
    setShowInheritUI(false);
  };

  // --- 核心逻辑 ---

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

        // 随机波动
        let price = Math.round(base * (1 + (Math.random() - 0.5) * 2 * good.volatility));
        // 皇商加成
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

    // 1. 产业生产
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

    // 2. 移动/休息
    let healthChange = 0;
    if (targetCityId) {
      const baseCost = 80;
      const discount = rank >= 1 ? 0.8 : 1;
      const cost = Math.round(baseCost * daysPass * discount);
      if (cash < cost) return showModal('bad', '没钱', '路费不够');
      
      setCash(c => c - cost);
      setLocation(targetCityId);
      healthChange = -5 * daysPass;
      // 节气恶劣天气
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

    // 3. 房产收益
    let propIncome = 0;
    const incomeBuff = Object.values(relationships).some(r => r.following && r.lv>=3) ? 1.5 : 1;
    myProperties.forEach(p => {
      propIncome += PROPERTIES.find(def => def.id === p.id).income * p.count * daysPass;
    });
    if (propIncome > 0) {
      const finalIncome = Math.floor(propIncome * incomeBuff);
      setCash(c => c + finalIncome);
      dailyLog.push(`房产收益 +${finalIncome}`);
    }

    // 4. 结算
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

  // --- 制造逻辑 ---
  const craftItem = (recipeId) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    const hasMat = (inventory[recipe.mat] || 0) > 0;
    if (!hasMat) return showModal('bad', '缺原料', `需要${GOODS_POOL.find(g=>g.id===recipe.mat)?.name}`);
    if (cash < recipe.cost) return showModal('bad', '缺钱', '加工费不足');

    const successRate = 0.5 + (skills[recipeId] * 0.005) + (activeTalent?.type==='clever' ? 0.2 : 0);
    setCash(c => c - recipe.cost);
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

  // --- 世代结束/传承 ---
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
    setLegacy({
      cash: totalAssets,
      skills: skills
    });
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

  // --- UI 组件 ---
  const showModal = (type, title, desc) => setModal({ type, title, desc });

  // 1. 传承选择界面
  if (showInheritUI) {
    return (
      <div className="min-h-screen bg-stone-900 text-amber-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-2 text-amber-500">第 {generation} 世 轮回</h1>
        <p className="text-stone-400 mb-8">先祖积累：银两 {Math.floor(legacy ? legacy.cash * 0.7 : 0)} | 技艺传承</p>
        
        <h3 className="text-xl mb-4 flex items-center gap-2"><Star className="text-yellow-400"/> 请选择本世天赋</h3>
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
      </div>
    );
  }

  // 2. 主游戏界面 (确保数据就绪)
  if (!gameStarted || cities.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#fffcf5] text-stone-600">加载资源中...</div>;

  const currentCityData = cities.find(c => c.id === location) || cities[0] || {name: '未知', desc: ''};
  const termIdx = Math.floor((day % 365) / 15) % 24;
  const currentTerm = SOLAR_TERMS[termIdx];

  return (
    <div className="min-h-screen bg-[#fffcf5] text-stone-800 font-sans flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* 顶部 */}
      <div className="bg-orange-700 text-white p-4 pb-8 rounded-b-3xl shadow-lg z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">牛牛家族</h1>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded border border-white/20">第{generation}代</span>
            </div>
            <div className="text-xs text-orange-200 mt-1 flex gap-2 items-center">
              <span className="bg-white/10 px-1 rounded">{RANKS[rank].title}</span>
              <span>{day}天</span>
              <span>{currentTerm.name} ({SEASONS[Math.floor(termIdx/6)]})</span>
            </div>
          </div>
          <button onClick={() => setShowBag(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Backpack size={20}/></button>
        </div>
        <div className="flex justify-between px-2">
          <div className="text-center"><div className="text-xs opacity-70">银两</div><div className="text-xl font-mono font-bold">{cash}</div></div>
          <div className="text-center"><div className="text-xs opacity-70">健康</div><div className="text-xl font-bold">{health}</div></div>
          <div className="text-center"><div className="text-xs opacity-70">总资产</div><div className="text-xl font-bold">{calculateTotalAssets()}</div></div>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4 -mt-6 pt-6 pb-24 space-y-4">
        
        {/* 市场 */}
        {activeTab === 'market' && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
            <h2 className="font-bold mb-3 flex items-center text-stone-700"><ShoppingBag className="mr-2 text-orange-600" size={18}/> {currentCityData.name}集市</h2>
            <div className="space-y-2">
              {GOODS_POOL.filter(g => g.type !== 'raw' || !g.producedBy).map(good => { // 只有成品和非产业原料在集市
                const price = marketPrices[location]?.[good.id];
                return (
                  <div key={good.id} className="flex justify-between items-center bg-stone-50 p-2 rounded">
                    <div>
                      <div className="font-bold text-sm">{good.name}</div>
                      <div className="text-xs text-stone-500">市价: <span className="text-orange-600">{price||'-'}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-6 text-center">{inventory[good.id]||0}</span>
                      <button onClick={()=>{
                        if(!price || !inventory[good.id]) return;
                        setCash(c=>c+price); setInventory(i=>({...i,[good.id]:i[good.id]-1}));
                      }} className="w-7 h-7 bg-stone-200 rounded font-bold text-stone-600">-</button>
                      <button onClick={()=>{
                        if(!price || cash<price) return showModal('bad','穷','钱不够');
                        setCash(c=>c-price); setInventory(i=>({...i,[good.id]:(i[good.id]||0)+1}));
                      }} className="w-7 h-7 bg-orange-600 rounded font-bold text-white">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 产业与制造 (核心新玩法) */}
        {activeTab === 'industry' && (
          <div className="space-y-4">
            {/* 产业列表 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
              <h2 className="font-bold mb-3 flex items-center text-stone-700"><Sprout className="mr-2 text-green-600" size={18}/> 家族产业</h2>
              {INDUSTRIES.map(ind => {
                const owned = myIndustries.find(i => i.id === ind.id);
                return (
                  <div key={ind.id} className="flex justify-between items-center mb-3 pb-3 border-b border-stone-50 last:border-0 last:pb-0">
                    <div>
                      <div className="font-bold text-sm">{ind.name}</div>
                      <div className="text-xs text-stone-500">{ind.desc}</div>
                    </div>
                    {owned ? (
                      <div className="text-right">
                        <div className="text-xs font-bold text-green-600">拥有 x{owned.count}</div>
                        <div className="text-[10px] text-stone-400">进度 {owned.progress}/{ind.rate}</div>
                      </div>
                    ) : (
                      <button onClick={()=>{
                        if(cash<ind.cost) return showModal('bad','缺钱','买不起地契');
                        setCash(c=>c-ind.cost);
                        setMyIndustries(prev=>[...prev, {id:ind.id, count:1, progress:0}]);
                      }} className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded">购买 {ind.cost}</button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 加工坊 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
              <h2 className="font-bold mb-3 flex items-center text-stone-700"><Factory className="mr-2 text-blue-600" size={18}/> 技艺工坊</h2>
              <div className="flex gap-2 mb-3 overflow-x-auto text-[10px] pb-1">
                {Object.entries(skills).map(([k,v]) => (
                  <span key={k} className="bg-blue-50 text-blue-600 px-2 py-1 rounded whitespace-nowrap">{RECIPES.find(r=>r.id===k)?.name.slice(0,2) || k}:{v}</span>
                ))}
              </div>
              {RECIPES.map(recipe => (
                <div key={recipe.id} className="flex justify-between items-center bg-stone-50 p-2 rounded mb-2">
                  <div className="text-xs">
                    <span className="font-bold">{recipe.name}</span>
                    <div className="text-stone-500 scale-90 origin-left">{GOODS_POOL.find(g=>g.id===recipe.mat)?.name} → {GOODS_POOL.find(g=>g.id===recipe.product)?.name}</div>
                  </div>
                  <button onClick={()=>craftItem(recipe.id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">制造 (费用{recipe.cost})</button>
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
                <button key={city.id} onClick={()=>advanceTime(2, city.id)} className="w-full bg-white p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <div className="text-left">
                    <div className="font-bold text-sm">{city.name}</div>
                    <div className="text-xs text-stone-500">{city.desc}</div>
                  </div>
                  <div className="text-right text-xs font-bold text-orange-600">2天 / 160两</div>
                </button>
              )
            })}
            <button onClick={()=>advanceTime(1)} className="w-full bg-stone-100 p-3 rounded-xl font-bold text-stone-600 flex justify-center gap-2"><Home size={18}/> 原地修整</button>
          </div>
        )}

        {/* 知己 (修复: 补回丢失的渲染模块) */}
        {activeTab === 'beauties' && (
          <div className="space-y-4">
            {beauties.map(beauty => {
              const rel = relationships[beauty.id];
              if (!rel) return null;

              return (
                <div key={beauty.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 overflow-hidden relative">
                  <div className="flex gap-4">
                    <img 
                      src={getAvatarUrl(beauty)} 
                      alt={beauty.name} 
                      className="w-20 h-20 rounded-lg object-cover bg-stone-200 border-2 border-pink-50" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-stone-800">{beauty.name}</h3>
                        <div className="text-xs text-pink-500 font-bold border border-pink-200 px-1 rounded">Lv.{rel.lv}</div>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">{beauty.desc}</p>
                      
                      {/* 羁绊进度条 */}
                      <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 mb-1">
                        <div className="bg-pink-400 h-1.5 rounded-full transition-all" style={{width: `${Math.min(100, (rel.exp / (rel.lv*50))*100)}%`}}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 mb-2">
                        <span>羁绊 {rel.exp}/{rel.lv*50}</span>
                        <span>特权: Lv3解锁跟随</span>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {!rel.unlocked ? (
                          <button onClick={()=>interactNPC(beauty.id, 'visit')} className="flex-1 bg-stone-800 text-white text-xs py-1.5 rounded shadow active:scale-95 transition">初次拜访 (100两)</button>
                        ) : (
                          <>
                            <button onClick={()=>interactNPC(beauty.id, 'visit')} className="flex-1 border border-stone-300 text-stone-600 text-xs py-1.5 rounded hover:bg-stone-50 active:scale-95 transition">拜访</button>
                            <button onClick={()=>interactNPC(beauty.id, 'quest')} className="flex-1 border border-pink-200 text-pink-600 text-xs py-1.5 rounded hover:bg-pink-50 active:scale-95 transition">赠礼</button>
                            {rel.lv >= 3 && (
                              <button 
                                onClick={()=>interactNPC(beauty.id, 'follow')} 
                                className={`flex-1 text-xs py-1.5 rounded font-bold shadow-sm active:scale-95 transition ${rel.following ? 'bg-pink-500 text-white' : 'bg-white border border-pink-500 text-pink-500'}`}
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
                    <div className="mt-3 text-[10px] flex items-center justify-center gap-1 bg-pink-50 text-pink-600 py-1.5 rounded border border-pink-100">
                      <Heart size={10} className="fill-current"/> 
                      <span>羁绊生效：{beauty.perks?.follow || beauty.buffDesc}</span>
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
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 text-amber-50 p-4 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-amber-200 mb-1">{RANKS[rank].title}</h2>
              <div className="text-xs text-stone-400 mb-3">{RANKS[rank].desc}</div>
              <div className="bg-white/10 p-2 rounded text-xs mb-3">特权: {RANKS[rank].perk}</div>
              {rank < 4 && (
                <button onClick={()=>{
                  const next = RANKS[rank+1];
                  if(cash>=next.req.cash && myProperties.length+myIndustries.length >= next.req.cities) { // 简化条件
                    setRank(r=>r+1); showModal('good','晋升',`成为${next.title}!`);
                  } else {
                    showModal('bad','未达标',`需银两${next.req.cash}，资产${next.req.cities}`);
                  }
                }} className="w-full bg-amber-600 py-2 rounded text-sm font-bold">晋升</button>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
              <h3 className="font-bold text-sm mb-2">房产</h3>
              {PROPERTIES.map(p => {
                const owned = myProperties.find(mp => mp.id === p.id);
                return (
                  <div key={p.id} className="flex justify-between items-center mb-2 text-sm border-b border-stone-50 pb-2">
                    <span>{p.name}</span>
                    {owned ? <span className="text-green-600 font-bold">已购</span> : 
                      <button onClick={()=>{
                        if(cash<p.cost) return showModal('bad','穷','');
                        setCash(c=>c-p.cost); setMyProperties(prev=>[...prev,{id:p.id, count:1}]);
                      }} className="bg-stone-800 text-white px-2 py-1 rounded text-xs">买 {p.cost}</button>
                    }
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* 底部导航 */}
      <nav className="bg-white border-t border-stone-200 px-2 py-2 flex justify-between items-center text-[10px]">
        {[
          {id:'market', icon:ShoppingBag, l:'集市'},
          {id:'industry', icon:Sprout, l:'产业'}, // 新入口
          {id:'travel', icon:Map, l:'世界'},
          {id:'beauties', icon:Heart, l:'知己'},
          {id:'assets', icon:Crown, l:'家族'}
        ].map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex flex-col items-center p-2 w-1/5 ${activeTab===t.id?'text-orange-600 font-bold':'text-stone-400'}`}>
            <t.icon size={20} className="mb-1"/>{t.l}
          </button>
        ))}
      </nav>

      {/* 弹窗们 */}
      {modal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">{modal.title}</h3>
            <p className="text-sm text-stone-600 mb-4 whitespace-pre-wrap">{modal.desc}</p>
            <button onClick={()=>setModal(null)} className="w-full py-2 bg-stone-800 text-white rounded-lg">好的</button>
          </div>
        </div>
      )}
      
      {showBag && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30" onClick={()=>setShowBag(false)}>
          <div className="bg-white w-3/4 max-h-[60vh] overflow-y-auto rounded-xl p-4" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold border-b pb-2 mb-2">行囊</h3>
            {Object.entries(inventory).map(([k,v]) => v>0 && (
              <div key={k} className="flex justify-between text-sm py-1">
                <span>{GOODS_POOL.find(g=>g.id===k)?.name || '未知物品'}</span>
                <span className="font-mono">x{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
