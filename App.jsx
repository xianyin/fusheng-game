'use client'; // 添加此行以确保兼容 Next.js 等框架的客户端渲染模式

import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, 
  Coins, 
  TrendingUp, 
  Home, 
  ShoppingBag, 
  Navigation, 
  History,
  AlertCircle,
  Heart,
  Gift,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-react';

// --- Gemini API Configuration ---
// 部署说明：
// 1. 如果你在 Vercel 环境变量中设置了 VITE_GEMINI_KEY，请确保构建工具能正确读取。
// 2. 为了避免构建错误，最简单的方法是直接将 Key 填入下方的引号中（注意不要提交给他人）。
const apiKey = ""; 

// --- 游戏数据常量 ---

const CITIES = [
  { id: 'suzhou', name: '苏州', desc: '吴中名胜，园林甲天下，丝绸便宜。' },
  { id: 'hangzhou', name: '杭州', desc: '西湖美景，茶香四溢，茶叶便宜。' },
  { id: 'yangzhou', name: '扬州', desc: '运河枢纽，商贾云集，盐商聚集。' },
  { id: 'nanjing', name: '南京', desc: '六朝古都，繁华之地，瓷器紧俏。' },
];

const GOODS = [
  { id: 'rice', name: '太湖梗米', basePrice: 10, volatility: 0.2, unit: '石' },
  { id: 'tea', name: '西湖龙井', basePrice: 50, volatility: 0.4, unit: '斤' },
  { id: 'wine', name: '绍兴黄酒', basePrice: 30, volatility: 0.3, unit: '坛' },
  { id: 'silk', name: '苏绣丝绸', basePrice: 150, volatility: 0.5, unit: '匹' },
  { id: 'porcelain', name: '景德瓷器', basePrice: 300, volatility: 0.6, unit: '件' },
  { id: 'salt', name: '淮南官盐', basePrice: 80, volatility: 0.25, unit: '引' },
];

const STOCKS = [
  { id: 'canal', name: '漕运招商局', basePrice: 100, risk: 0.3 },
  { id: 'weaving', name: '江南织造署', basePrice: 200, risk: 0.5 },
  { id: 'salt_gang', name: '两淮盐帮', basePrice: 150, risk: 0.4 },
];

const PROPERTIES = [
  { id: 'hut', name: '城郊茅屋', cost: 2000, income: 10, desc: '遮风避雨，聊胜于无' },
  { id: 'shop', name: '闹市铺面', cost: 10000, income: 80, desc: '客似云来，日进斗金' },
  { id: 'garden', name: '沧浪亭台', cost: 50000, income: 500, desc: '虽由人作，宛自天开' },
];

const BEAUTIES = [
  { 
    id: 'yun', 
    name: '芸娘', 
    title: '青梅竹马',
    desc: '沈复之妻，情深义重，善解人意。', 
    meetCost: 500, 
    dateCost: 50, 
    maxIntimacy: 100, 
    buffDesc: '贤内助：每次休整额外恢复 10 点健康，且减少旅途健康消耗。', 
    buffType: 'health_support',
    persona: "你叫芸娘，是沈复的妻子。你性格温婉贤惠，深爱丈夫，富有生活情趣，喜欢布衣菜饭，可乐终身。你说话带有中国古代白话文风格，语气温柔。不要使用现代词汇。"
  },
  { 
    id: 'su', 
    name: '苏小小', 
    title: '钱塘名妓',
    desc: '西湖边的一抹倩影，才情绝艳。', 
    meetCost: 5000, 
    dateCost: 300, 
    maxIntimacy: 150, 
    buffDesc: '旺夫运：所有房产收益增加 20%。', 
    buffType: 'income_boost',
    buffValue: 0.2,
    persona: "你叫苏小小，是钱塘名妓。你才情绝艳，性格孤傲但对知己深情。你住在西湖边，喜欢吟诗作对。你说话文雅，带有诗意，略带一丝清冷。不要使用现代词汇。"
  },
  { 
    id: 'dong', 
    name: '董小宛', 
    title: '秦淮八艳',
    desc: '精通算学理财，甚至能帮你打理生意。', 
    meetCost: 10000, 
    dateCost: 800, 
    maxIntimacy: 200, 
    buffDesc: '精打细算：行囊容量增加 50 格。', 
    buffType: 'inventory_boost',
    buffValue: 50,
    persona: "你叫董小宛，是秦淮八艳之一。你擅长烹饪（董糖、董肉）和理财。你性格温柔坚定，善解人意。你说话得体大方，像一位贤内助。不要使用现代词汇。"
  },
];

const MAX_DAYS = 365; // 游戏时长一年
const BASE_INVENTORY_CAPACITY = 100;

export default function App() {
  // --- 状态管理 ---
  
  // 玩家状态
  const [cash, setCash] = useState(1000); 
  const [health, setHealth] = useState(100);
  const [day, setDay] = useState(1);
  const [location, setLocation] = useState('suzhou');
  const [inventory, setInventory] = useState({}); 
  const [inventoryCount, setInventoryCount] = useState(0);
  
  // 经济状态
  const [marketPrices, setMarketPrices] = useState({}); 
  const [stockMarket, setStockMarket] = useState([]); 
  const [myProperties, setMyProperties] = useState([]); 
  
  // 社交状态
  const [relationships, setRelationships] = useState({}); // { beautyId: { unlocked: bool, intimacy: int, married: bool } }

  // UI 状态
  const [activeTab, setActiveTab] = useState('market'); 
  const [logs, setLogs] = useState(['浮生若梦，为欢几何。你带着1000两纹银，开始了在江南的行商之旅。']);
  const [showGameOver, setShowGameOver] = useState(false);

  // Gemini AI Chat State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [currentChatBeauty, setCurrentChatBeauty] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Gemini AI Advisor State
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState("");

  // 引用
  const logsEndRef = useRef(null);
  const chatEndRef = useRef(null);

  // --- 初始化与生命周期 ---

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (chatModalOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatModalOpen]);

  const initGame = () => {
    const initialPrices = {};
    CITIES.forEach(city => {
      initialPrices[city.id] = generatePricesForCity(city.id);
    });
    setMarketPrices(initialPrices);

    const initialStocks = STOCKS.map(s => ({
      ...s,
      currentPrice: s.basePrice,
      owned: 0,
      avgCost: 0
    }));
    setStockMarket(initialStocks);
    
    // 初始化红颜状态
    const initRel = {};
    BEAUTIES.forEach(b => {
      initRel[b.id] = { unlocked: false, intimacy: 0, married: false };
    });
    setRelationships(initRel);
  };

  // --- Gemini API Call Helper ---
  async function callGemini(prompt, systemInstruction = "") {
    if (!apiKey) {
      return "【系统】请先配置 API Key 才能使用 AI 功能。";
    }
    
    setIsAiLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "（佳人似乎走神了...）";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "（云深不知处，信鸽迷路了。请稍后再试。）";
    } finally {
      setIsAiLoading(false);
    }
  }

  // --- 辅助计算 ---

  const getBuff = (type) => {
    let val = 0;
    BEAUTIES.forEach(b => {
      const rel = relationships[b.id];
      if (rel && rel.married && b.buffType === type) {
        val += b.buffValue || 0;
      }
    });
    return val;
  };
  
  const hasBuff = (type) => {
     return BEAUTIES.some(b => {
       const rel = relationships[b.id];
       return rel && rel.married && b.buffType === type;
     });
  };

  const getMaxInventory = () => {
    return BASE_INVENTORY_CAPACITY + getBuff('inventory_boost');
  };

  // --- 核心逻辑 ---

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[第${day}日] ${msg}`]);
  };

  const generatePricesForCity = (cityId) => {
    const prices = {};
    GOODS.forEach(good => {
      let fluctuation = (Math.random() - 0.5) * 2 * good.volatility;
      
      if (cityId === 'suzhou' && good.id === 'silk') fluctuation -= 0.3;
      if (cityId === 'hangzhou' && good.id === 'tea') fluctuation -= 0.3;
      if (cityId === 'nanjing' && good.id === 'porcelain') fluctuation -= 0.2; 
      if (cityId === 'yangzhou' && good.id === 'salt') fluctuation -= 0.2;

      let price = Math.round(good.basePrice * (1 + fluctuation));
      if (price < 1) price = 1;
      prices[good.id] = price;
    });
    return prices;
  };

  const advanceDay = (travelToCityId = null) => {
    if (day >= MAX_DAYS || health <= 0) {
      endGame();
      return;
    }

    const newDay = day + 1;
    setDay(newDay);

    // 1. 刷新商品价格
    const newPrices = {};
    CITIES.forEach(c => {
      newPrices[c.id] = generatePricesForCity(c.id);
    });
    setMarketPrices(newPrices);

    // 2. 刷新股市
    const newStocks = stockMarket.map(stock => {
      const change = (Math.random() - 0.48) * stock.risk * 0.5;
      let newPrice = Math.round(stock.currentPrice * (1 + change));
      if (newPrice < 10) newPrice = 10;
      return { ...stock, currentPrice: newPrice };
    });
    setStockMarket(newStocks);

    // 3. 房产收益 (计算Buff)
    let dailyIncome = 0;
    const incomeMultiplier = 1 + getBuff('income_boost');
    
    myProperties.forEach(p => {
      const propType = PROPERTIES.find(def => def.id === p.id);
      if (propType) {
        dailyIncome += propType.income * p.count;
      }
    });
    dailyIncome = Math.floor(dailyIncome * incomeMultiplier);
    
    if (dailyIncome > 0) {
      setCash(prev => prev + dailyIncome);
    }

    // 4. 处理移动与健康
    const hasHealthBuff = hasBuff('health_support');
    
    if (travelToCityId) {
      setLocation(travelToCityId);
      const cityName = CITIES.find(c => c.id === travelToCityId).name;
      // 芸娘Buff: 减少旅途消耗
      const damage = hasHealthBuff ? 2 : 5;
      setHealth(prev => Math.max(0, prev - damage));
      addLog(`跋山涉水抵${cityName}。健康 -${damage}，房产收益 +${dailyIncome}两。`);
    } else {
      // 芸娘Buff: 增加休息恢复
      const heal = hasHealthBuff ? 15 : 5;
      setHealth(prev => Math.min(100, prev + heal));
      addLog(`在${CITIES.find(c => c.id === location).name}休整。健康 +${heal}，房产收益 +${dailyIncome}两。`);
    }

    // 5. 随机事件
    handleRandomEvents(newDay);
  };

  const handleRandomEvents = (currentDay) => {
    const chance = Math.random();
    if (chance < 0.05) {
      const lost = Math.floor(cash * 0.2);
      setCash(prev => prev - lost);
      setHealth(prev => prev - 10);
      addLog(`【厄运】遭遇水匪！损失了 ${lost} 两银子和健康。`);
    } else if (chance > 0.95) {
      const bonus = 500;
      setCash(prev => prev + bonus);
      addLog(`【吉运】捡到了前朝遗留的宝物，当铺换得 ${bonus} 两！`);
    } else if (chance > 0.90 && chance <= 0.95) {
      setStockMarket(prev => prev.map(s => ({...s, currentPrice: Math.round(s.currentPrice * 0.7)})));
      addLog(`【商闻】朝廷严查盐务织造，票号全线暴跌！`);
    }
  };

  // --- 交易逻辑 ---

  const buyGood = (goodId) => {
    const price = marketPrices[location][goodId];
    if (cash < price) {
      alert("银两不足！");
      return;
    }
    if (inventoryCount >= getMaxInventory()) {
      alert("行囊已满！");
      return;
    }

    setCash(prev => prev - price);
    setInventory(prev => ({
      ...prev,
      [goodId]: (prev[goodId] || 0) + 1
    }));
    setInventoryCount(prev => prev + 1);
  };

  const sellGood = (goodId) => {
    if (!inventory[goodId] || inventory[goodId] <= 0) return;
    
    const price = marketPrices[location][goodId];
    setCash(prev => prev + price);
    setInventory(prev => ({
      ...prev,
      [goodId]: prev[goodId] - 1
    }));
    setInventoryCount(prev => prev - 1);
  };

  const buyStock = (stockId) => {
    const stock = stockMarket.find(s => s.id === stockId);
    if (cash < stock.currentPrice) return;

    setCash(prev => prev - stock.currentPrice);
    setStockMarket(prev => prev.map(s => {
      if (s.id === stockId) {
        const totalCost = (s.avgCost * s.owned) + stock.currentPrice;
        const newOwned = s.owned + 1;
        return { ...s, owned: newOwned, avgCost: totalCost / newOwned };
      }
      return s;
    }));
  };

  const sellStock = (stockId) => {
    const stock = stockMarket.find(s => s.id === stockId);
    if (stock.owned <= 0) return;

    setCash(prev => prev + stock.currentPrice);
    setStockMarket(prev => prev.map(s => {
      if (s.id === stockId) {
        return { ...s, owned: s.owned - 1 }; 
      }
      return s;
    }));
  };

  const buyProperty = (propId) => {
    const prop = PROPERTIES.find(p => p.id === propId);
    if (cash < prop.cost) {
      alert("银两不足以置办此产业！");
      return;
    }
    
    setCash(prev => prev - prop.cost);
    setMyProperties(prev => {
      const existing = prev.find(p => p.id === propId);
      if (existing) {
        return prev.map(p => p.id === propId ? { ...p, count: p.count + 1 } : p);
      } else {
        return [...prev, { id: propId, count: 1 }];
      }
    });
    addLog(`置办了 ${prop.name} 一处。`);
  };

  // --- 红颜逻辑 ---

  const meetBeauty = (beautyId) => {
    const beauty = BEAUTIES.find(b => b.id === beautyId);
    if (cash < beauty.meetCost) return;

    setCash(prev => prev - beauty.meetCost);
    setRelationships(prev => ({
      ...prev,
      [beautyId]: { ...prev[beautyId], unlocked: true }
    }));
    addLog(`花费 ${beauty.meetCost} 两，终于得见 ${beauty.name} 芳容。`);
  };

  const dateBeauty = (beautyId) => {
    const beauty = BEAUTIES.find(b => b.id === beautyId);
    const rel = relationships[beautyId];
    if (cash < beauty.dateCost) return;
    if (rel.intimacy >= beauty.maxIntimacy) return;

    setCash(prev => prev - beauty.dateCost);
    // 随机增加好感度
    const intimacyGain = Math.floor(Math.random() * 10) + 10;
    
    setRelationships(prev => ({
      ...prev,
      [beautyId]: { 
        ...prev[beautyId], 
        intimacy: Math.min(beauty.maxIntimacy, prev[beautyId].intimacy + intimacyGain) 
      }
    }));
    
    addLog(`与${beauty.name}花前月下，好感倍增 (+${intimacyGain})`);
  };

  // --- AI 聊天逻辑 ---
  const openChat = (beautyId) => {
    const beauty = BEAUTIES.find(b => b.id === beautyId);
    setCurrentChatBeauty(beauty);
    setChatModalOpen(true);
    // Initial greeting from AI
    const greetings = [
        "夫君今日可好？",
        "官人可是想奴家了？",
        "今日风和日丽，正好与君一叙。",
        "久候多时了..."
    ];
    setChatHistory([{ role: 'ai', text: greetings[Math.floor(Math.random() * greetings.length)] }]);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);

    // Increase Intimacy slightly for chatting (free bonus)
    const beautyId = currentChatBeauty.id;
    const rel = relationships[beautyId];
    if (rel.intimacy < currentChatBeauty.maxIntimacy) {
         setRelationships(prev => ({
            ...prev,
            [beautyId]: { 
                ...prev[beautyId], 
                intimacy: Math.min(currentChatBeauty.maxIntimacy, prev[beautyId].intimacy + 2) 
            }
         }));
    }

    // Call Gemini
    const systemPrompt = `
      ${currentChatBeauty.persona}
      用户是你的心上人/丈夫。当前好感度为 ${rel.intimacy}/${currentChatBeauty.maxIntimacy}。
      请以简短、古风、深情的口吻回复。回复不要超过60个字。
    `;
    
    const aiResponse = await callGemini(userMsg, systemPrompt);
    setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
  };

  // --- AI 问策逻辑 ---
  const askAdvisor = async () => {
    setAdvisorModalOpen(true);
    setAdvisorResponse(""); // Clear previous
    
    const currentCityName = CITIES.find(c => c.id === location).name;
    const marketState = Object.entries(marketPrices[location]).map(([id, price]) => {
        const good = GOODS.find(g => g.id === id);
        return `${good.name}: ${price}两`;
    }).join(", ");
    
    const inventoryState = Object.entries(inventory).map(([id, qty]) => {
        if(qty === 0) return null;
        const good = GOODS.find(g => g.id === id);
        return `${good.name} ${qty}${good.unit}`;
    }).filter(Boolean).join(", ") || "空空如也";

    const prompt = `
      我现在在${currentCityName}。
      身上现银：${cash}两。
      当前${currentCityName}物价：${marketState}。
      我的行囊：${inventoryState}。
      
      请作为一位古代商圣，用文言文/半文言文风格，简短地给我一点生意上的建议（不超过50字）。
      建议应该包括：该买入什么（价格低的），或者该卖出什么。
    `;

    const response = await callGemini(prompt, "你是一位精通江南商道的古代商圣，说话高深莫测但切中要害。");
    setAdvisorResponse(response);
  };


  const marryBeauty = (beautyId) => {
    const beauty = BEAUTIES.find(b => b.id === beautyId);
    setRelationships(prev => ({
      ...prev,
      [beautyId]: { ...prev[beautyId], married: true }
    }));
    addLog(`【大喜】洞房花烛夜，金榜题名时。你与${beauty.name}喜结连理！获得特效：${beauty.buffDesc}`);
  };

  const endGame = () => {
    setShowGameOver(true);
  };

  const calculateTotalAssets = () => {
    let total = cash;
    if (marketPrices[location]) {
        Object.keys(inventory).forEach(k => {
            total += (inventory[k] || 0) * marketPrices[location][k];
        });
    }
    stockMarket.forEach(s => {
      total += s.owned * s.currentPrice;
    });
    myProperties.forEach(p => {
      const prop = PROPERTIES.find(x => x.id === p.id);
      total += p.count * prop.cost;
    });
    return total;
  };

  // --- 渲染组件 ---

  if (showGameOver) {
    const marriedCount = Object.values(relationships).filter(r => r.married).length;
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 font-serif">
        <div className="bg-white p-8 border-4 border-double border-stone-800 shadow-2xl max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold mb-6 text-stone-900">浮生梦醒</h1>
          <p className="text-xl mb-4">历经 {day} 个日夜。</p>
          <div className="text-left bg-stone-100 p-4 rounded mb-6">
            <p>最终现银：<span className="font-bold text-amber-700">{cash}</span> 两</p>
            <p>红颜知己：<span className="font-bold text-pink-700">{marriedCount}</span> 位</p>
            <p>总计资产：<span className="font-bold text-amber-700">{calculateTotalAssets()}</span> 两</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-stone-800 text-amber-50 rounded hover:bg-stone-700"
          >
            再入红尘
          </button>
        </div>
      </div>
    );
  }

  const currentCity = CITIES.find(c => c.id === location);

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-stone-800 font-serif overflow-hidden flex flex-col max-w-md mx-auto shadow-2xl border-x border-stone-300 relative">
      {/* Header */}
      <header className="bg-stone-800 text-[#f7f3e8] p-3 shadow-md z-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold tracking-widest">浮生商记</h1>
          <span className="text-sm bg-stone-700 px-2 py-1 rounded">第 {day}/{MAX_DAYS} 日</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-sm text-center">
          <div className="flex flex-col items-center">
            <Coins size={16} className="text-yellow-500 mb-1"/>
            <span>{cash} 两</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`flex items-center ${health < 30 ? 'text-red-400' : 'text-green-400'}`}>
               <span>{health}</span>
            </div>
            <span className="text-xs text-stone-400">健康</span>
          </div>
           <div className="flex flex-col items-center">
            <ShoppingBag size={16} className="text-blue-300 mb-1"/>
            <span>{inventoryCount}/{getMaxInventory()}</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="font-bold text-amber-500">{currentCity.name}</span>
             <span className="text-xs text-stone-400">当前位置</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
        
        {/* Market View */}
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded shadow border border-stone-200">
              <h2 className="text-lg font-bold border-b border-stone-200 pb-2 mb-2 flex items-center justify-between">
                <span className="flex items-center"><ShoppingBag className="mr-2" size={18}/> {currentCity.name} 集市</span>
                <button onClick={askAdvisor} className="text-xs flex items-center bg-stone-800 text-amber-400 px-2 py-1 rounded animate-pulse">
                    <Sparkles size={12} className="mr-1"/> 商圣问策
                </button>
              </h2>
              <div className="grid gap-3">
                {GOODS.map(good => {
                  const price = marketPrices[location] ? marketPrices[location][good.id] : 0;
                  const owned = inventory[good.id] || 0;
                  return (
                    <div key={good.id} className="flex justify-between items-center bg-stone-50 p-2 rounded">
                      <div>
                        <div className="font-bold text-stone-700">{good.name}</div>
                        <div className="text-xs text-stone-500">市价: <span className="text-amber-700 font-mono text-sm font-bold">{price}</span> 两/{good.unit}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-center mr-2">
                          <div className="text-stone-400">持有</div>
                          <div className="font-bold">{owned}</div>
                        </div>
                        <button 
                          onClick={() => sellGood(good.id)}
                          disabled={owned === 0}
                          className={`px-3 py-1 text-xs rounded border ${owned > 0 ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                        >
                          卖
                        </button>
                        <button 
                          onClick={() => buyGood(good.id)}
                          className="px-3 py-1 text-xs bg-stone-800 text-white rounded hover:bg-stone-700"
                        >
                          买
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Beauties View */}
        {activeTab === 'beauties' && (
          <div className="space-y-4">
             <div className="bg-white p-3 rounded shadow border border-stone-200">
              <h2 className="text-lg font-bold border-b border-stone-200 pb-2 mb-2 flex items-center text-pink-700">
                <Heart className="mr-2" size={18}/> 
                红颜知己
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                愿得一人心，白首不相离。结识红颜，不仅能得佳人相伴，更能助你事业腾飞。
              </p>
              
              <div className="space-y-4">
                {BEAUTIES.map(beauty => {
                  const rel = relationships[beauty.id];
                  if (!rel) return null;

                  return (
                    <div key={beauty.id} className={`border rounded p-3 relative overflow-hidden ${rel.married ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-200'}`}>
                      {rel.married && (
                        <div className="absolute top-2 right-2 text-red-500 border border-red-500 text-xs px-2 py-0.5 rounded rotate-12 font-bold">
                          已结发
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-baseline space-x-2">
                             <h3 className="font-bold text-lg text-stone-800">{beauty.name}</h3>
                             <span className="text-xs text-stone-500 bg-stone-200 px-1 rounded">{beauty.title}</span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{beauty.desc}</p>
                        </div>
                      </div>

                      <div className="bg-white/50 p-2 rounded text-xs text-stone-500 mb-3 border border-stone-100">
                         <span className="font-bold text-pink-600">【贤内助】</span> {beauty.buffDesc}
                      </div>

                      {!rel.unlocked ? (
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-stone-200">
                           <div className="text-sm text-stone-500">
                             虽未曾谋面，但心向往之。
                           </div>
                           <button 
                             onClick={() => meetBeauty(beauty.id)}
                             disabled={cash < beauty.meetCost}
                             className="bg-stone-800 text-amber-50 px-4 py-1.5 rounded text-sm disabled:opacity-50"
                           >
                             备礼拜访 ({beauty.meetCost}两)
                           </button>
                        </div>
                      ) : (
                        <div>
                          {/* Intimacy Bar */}
                          <div className="flex items-center text-xs mb-2 space-x-2">
                            <Heart size={12} className={rel.married ? "text-red-500 fill-current" : "text-pink-400"} />
                            <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-pink-500 h-full transition-all duration-500" 
                                style={{ width: `${(rel.intimacy / beauty.maxIntimacy) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-stone-500">{rel.intimacy}/{beauty.maxIntimacy}</span>
                          </div>

                          <div className="flex space-x-2 mt-2">
                             {!rel.married ? (
                               <>
                                <button 
                                  onClick={() => openChat(beauty.id)}
                                  className="flex-1 bg-purple-100 text-purple-800 border border-purple-200 py-1.5 rounded text-sm hover:bg-purple-200 flex items-center justify-center"
                                >
                                  <MessageCircle size={14} className="mr-1"/> <span className="flex items-center">传书 <Sparkles size={8} className="ml-1 text-yellow-500"/></span>
                                </button>
                                <button 
                                  onClick={() => dateBeauty(beauty.id)}
                                  disabled={cash < beauty.dateCost || rel.intimacy >= beauty.maxIntimacy}
                                  className="flex-1 bg-pink-100 text-pink-800 border border-pink-200 py-1.5 rounded text-sm hover:bg-pink-200 disabled:opacity-50 flex items-center justify-center"
                                >
                                  <Gift size={14} className="mr-1"/> 赠礼 ({beauty.dateCost}两)
                                </button>
                                {rel.intimacy >= beauty.maxIntimacy && (
                                  <button 
                                    onClick={() => marryBeauty(beauty.id)}
                                    className="flex-1 bg-red-600 text-white py-1.5 rounded text-sm hover:bg-red-700 animate-pulse"
                                  >
                                    迎娶过门
                                  </button>
                                )}
                               </>
                             ) : (
                               <>
                               <button 
                                  onClick={() => openChat(beauty.id)}
                                  className="w-full bg-purple-100 text-purple-800 border border-purple-200 py-1.5 rounded text-sm hover:bg-purple-200 flex items-center justify-center"
                                >
                                  <MessageCircle size={14} className="mr-1"/> <span className="flex items-center">夫妻夜话 <Sparkles size={8} className="ml-1 text-yellow-500"/></span>
                                </button>
                               </>
                             )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Travel View */}
        {activeTab === 'travel' && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded shadow border border-stone-200">
              <h2 className="text-lg font-bold border-b border-stone-200 pb-2 mb-2 flex items-center">
                <Map className="mr-2" size={18}/> 
                行商路线
              </h2>
              <div className="grid gap-3">
                {CITIES.map(city => (
                  <div key={city.id} className={`p-3 rounded border-l-4 flex justify-between items-center ${location === city.id ? 'bg-amber-50 border-amber-600' : 'bg-stone-50 border-stone-300'}`}>
                    <div>
                      <h3 className="font-bold">{city.name}</h3>
                      <p className="text-xs text-stone-500">{city.desc}</p>
                    </div>
                    {location !== city.id ? (
                      <button 
                        onClick={() => advanceDay(city.id)}
                        className="px-4 py-2 bg-stone-800 text-white text-sm rounded hover:bg-stone-700 flex items-center"
                      >
                        <Navigation size={14} className="mr-1"/> 前往
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">当前所在</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-stone-100 rounded text-center">
                <p className="text-sm text-stone-600 mb-2">不想奔波？</p>
                <button 
                  onClick={() => advanceDay(null)}
                  className="w-full py-2 border-2 border-stone-300 text-stone-600 font-bold rounded hover:bg-stone-200"
                >
                  原地修整一日 (恢复健康)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stocks View */}
        {activeTab === 'stocks' && (
          <div className="space-y-4">
             <div className="bg-white p-3 rounded shadow border border-stone-200">
              <h2 className="text-lg font-bold border-b border-stone-200 pb-2 mb-2 flex items-center">
                <TrendingUp className="mr-2" size={18}/> 
                江南票号
              </h2>
              <p className="text-xs text-stone-500 mb-4 bg-yellow-50 p-2 border border-yellow-200 rounded">
                <AlertCircle size={12} className="inline mr-1"/>
                股市有风险，入市需谨慎。票号每日价格波动。
              </p>
              
              <div className="grid gap-3">
                {stockMarket.map(stock => {
                  const gain = stock.currentPrice - stock.avgCost;
                  const isGain = gain >= 0;
                  return (
                    <div key={stock.id} className="bg-stone-50 p-3 rounded border border-stone-200">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="font-bold text-stone-800">{stock.name}</h3>
                        <span className="text-xl font-mono font-bold text-amber-700">{stock.currentPrice} <span className="text-xs text-stone-500">两/股</span></span>
                      </div>
                      
                      <div className="grid grid-cols-2 text-xs text-stone-500 mb-3 gap-y-1">
                        <div>持有: <span className="font-bold text-stone-800">{stock.owned}</span></div>
                        <div>均价: <span className="font-bold text-stone-800">{Math.round(stock.avgCost)}</span></div>
                        <div className="col-span-2">
                           浮动盈亏: <span className={`${stock.owned > 0 ? (isGain ? 'text-red-600' : 'text-green-600') : 'text-stone-400'}`}>
                             {stock.owned > 0 ? (stock.currentPrice * stock.owned - stock.avgCost * stock.owned).toFixed(0) : 0} 两
                           </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => buyStock(stock.id)}
                          className="flex-1 py-1 bg-stone-800 text-white text-xs rounded"
                        >
                          买入
                        </button>
                        <button 
                          onClick={() => sellStock(stock.id)}
                          disabled={stock.owned <= 0}
                          className="flex-1 py-1 border border-stone-300 text-stone-700 text-xs rounded disabled:opacity-50"
                        >
                          卖出
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Real Estate View */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
             <div className="bg-white p-3 rounded shadow border border-stone-200">
              <h2 className="text-lg font-bold border-b border-stone-200 pb-2 mb-2 flex items-center">
                <Home className="mr-2" size={18}/> 
                置业田产
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                安得广厦千万间。购置房产可每日获得租金，且资产保值。
              </p>
              
              <div className="space-y-4">
                {PROPERTIES.map(prop => {
                  const myProp = myProperties.find(p => p.id === prop.id);
                  const count = myProp ? myProp.count : 0;
                  
                  return (
                    <div key={prop.id} className="border border-stone-200 rounded p-3 bg-stone-50 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-2 opacity-10 pointer-events-none">
                        <Home size={64} />
                      </div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <h3 className="font-bold text-lg">{prop.name}</h3>
                          <p className="text-xs text-stone-500">{prop.desc}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-700 font-bold">{prop.cost} 两</div>
                          <div className="text-xs text-green-600">收益: {prop.income} 两/日</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 border-t border-stone-200 pt-2 relative z-10">
                        <div className="text-sm">
                          当前拥有: <span className="font-bold text-lg">{count}</span> 处
                        </div>
                        <button 
                          onClick={() => buyProperty(prop.id)}
                          className="bg-amber-700 text-white px-4 py-1 rounded text-sm hover:bg-amber-800 disabled:opacity-50 disabled:bg-stone-400"
                          disabled={cash < prop.cost}
                        >
                          置办
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Advisor Modal */}
      {advisorModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[#f7f3e8] w-full max-w-sm rounded-lg shadow-2xl overflow-hidden border-2 border-stone-600">
                <div className="bg-stone-800 text-amber-50 p-3 flex justify-between items-center">
                    <h3 className="font-bold flex items-center"><Sparkles size={16} className="mr-2 text-yellow-500"/> 商圣问策</h3>
                    <button onClick={() => setAdvisorModalOpen(false)}><X size={18}/></button>
                </div>
                <div className="p-4">
                    {!advisorResponse ? (
                        <div className="text-center py-8 text-stone-500 animate-pulse">
                            商圣正在掐指一算...
                        </div>
                    ) : (
                        <div className="prose prose-sm font-serif text-stone-800">
                            <p className="italic text-lg mb-2">“{advisorResponse}”</p>
                            <p className="text-xs text-right text-stone-500 mt-4">- 仅供参考，盈亏自负</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatModalOpen && currentChatBeauty && (
        <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end sm:justify-center sm:p-4">
            <div className="bg-[#f7f3e8] w-full sm:max-w-sm sm:rounded-lg shadow-2xl h-[80vh] sm:h-[600px] flex flex-col border-t-2 sm:border-2 border-stone-600">
                {/* Chat Header */}
                <div className="bg-pink-900 text-pink-50 p-3 flex justify-between items-center shadow">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-pink-200 mr-2 flex items-center justify-center text-pink-800 font-bold border border-pink-400">
                            {currentChatBeauty.name[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{currentChatBeauty.name}</h3>
                            <p className="text-xs text-pink-200">亲密度: {relationships[currentChatBeauty.id].intimacy}/{currentChatBeauty.maxIntimacy}</p>
                        </div>
                    </div>
                    <button onClick={() => setChatModalOpen(false)}><X size={18}/></button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 text-sm shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-stone-800 text-stone-50 rounded-tr-none' 
                                : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isAiLoading && (
                         <div className="flex justify-start">
                            <div className="bg-white text-stone-500 border border-stone-200 rounded-lg rounded-tl-none p-3 text-xs italic animate-pulse">
                                {currentChatBeauty.name} 正在研墨提笔...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-stone-100 border-t border-stone-300">
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                            placeholder="倾诉衷肠..."
                            className="flex-1 border border-stone-300 rounded p-2 text-sm focus:outline-none focus:border-stone-500 bg-white"
                            disabled={isAiLoading}
                        />
                        <button 
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || isAiLoading}
                            className="bg-stone-800 text-white px-4 rounded text-sm disabled:opacity-50"
                        >
                            发送
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Log Section */}
      <div className="h-32 bg-stone-900 text-stone-300 text-xs p-3 overflow-y-auto font-mono border-t border-stone-600">
        <div className="flex items-center text-stone-500 mb-1 sticky top-0 bg-stone-900 pb-1 border-b border-stone-800">
          <History size={12} className="mr-1"/> 浮生记事
        </div>
        {logs.map((log, i) => (
          <div key={i} className="mb-1 border-l-2 border-stone-700 pl-2 py-0.5">
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Navigation Footer */}
      <nav className="bg-stone-100 border-t border-stone-300 p-2 flex justify-between shadow-inner">
        <button 
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center p-2 rounded flex-1 ${activeTab === 'market' ? 'text-amber-800 bg-amber-100' : 'text-stone-500 hover:bg-stone-200'}`}
        >
          <ShoppingBag size={20} />
          <span className="text-xs mt-1">集市</span>
        </button>
        <button 
          onClick={() => setActiveTab('travel')}
          className={`flex flex-col items-center p-2 rounded flex-1 ${activeTab === 'travel' ? 'text-amber-800 bg-amber-100' : 'text-stone-500 hover:bg-stone-200'}`}
        >
          <Map size={20} />
          <span className="text-xs mt-1">行商</span>
        </button>
        <button 
          onClick={() => setActiveTab('beauties')}
          className={`flex flex-col items-center p-2 rounded flex-1 ${activeTab === 'beauties' ? 'text-pink-700 bg-pink-100' : 'text-stone-500 hover:bg-stone-200'}`}
        >
          <Heart size={20} />
          <span className="text-xs mt-1">红颜</span>
        </button>
        <button 
          onClick={() => setActiveTab('stocks')}
          className={`flex flex-col items-center p-2 rounded flex-1 ${activeTab === 'stocks' ? 'text-amber-800 bg-amber-100' : 'text-stone-500 hover:bg-stone-200'}`}
        >
          <TrendingUp size={20} />
          <span className="text-xs mt-1">票号</span>
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`flex flex-col items-center p-2 rounded flex-1 ${activeTab === 'properties' ? 'text-amber-800 bg-amber-100' : 'text-stone-500 hover:bg-stone-200'}`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">置业</span>
        </button>
      </nav>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7f3e8;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d6d3d1;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
