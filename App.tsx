
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, CropType, FarmPlot, FarmTier, NewsItem, Transaction, ProgressSnapshot, AnimalType, AnimalState } from './types';
import { INITIAL_STATE, CROPS, XP_PER_LEVEL, FARM_TIERS, ANIMALS } from './constants';
import FarmPlotComponent from './components/FarmPlot';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Marketplace from './components/Marketplace';
import FarmShop from './components/FarmShop';
import FarmNews from './components/FarmNews';
import FinancialHistoryModal from './components/FinancialHistoryModal';
import EvolutionCharts from './components/EvolutionCharts';
import WarehouseModal from './components/WarehouseModal';
import Livestock from './components/Livestock';
import BackupCentral from './components/BackupCentral';
import MassPlantPicker from './components/MassPlantPicker';
import TechnologyTab from './components/TechnologyTab';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('fazenda_master_state_v3');
    if (!saved) return INITIAL_STATE;
    
    try {
      const parsed = JSON.parse(saved);
      // MIGRACAO SEGURA: Mantém o progresso do usuário mas garante que novos campos existam
      return {
        ...INITIAL_STATE,
        ...parsed,
        animals: parsed.animals || [],
        inventory: parsed.inventory || {},
        seedInventory: parsed.seedInventory || INITIAL_STATE.seedInventory,
        financialHistory: parsed.financialHistory || [],
        evolutionHistory: parsed.evolutionHistory || []
      };
    } catch (e) {
      console.error("Erro ao carregar save:", e);
      return INITIAL_STATE;
    }
  });
  
  const [activeTab, setActiveTab] = useState<'fazenda' | 'pecuaria' | 'mercado' | 'gestao' | 'imobiliaria' | 'noticias' | 'seguranca'>('fazenda');
  const [gestaoSubTab, setGestaoSubTab] = useState<'operacoes' | 'tecnologia'>('operacoes');
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showMassPlantPicker, setShowMassPlantPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const BIO_BONUS_DURATION = 6 * 60 * 1000;
  const MARKET_EVENT_DURATION = 3 * 60 * 1000; 

  const STAFF_LIMIT = 38;
  const MACHINERY_LIMIT = 15;

  // Preço Equipe: Inicia em 3.500 e termina em 3.500.000 no nível 38
  // Razão calculada para 37 saltos: (3500000 / 3500) ^ (1/37) ≈ 1.2062
  const currentStaffPrice = state.staffCount >= STAFF_LIMIT ? 0 : Math.floor(3500 * Math.pow(1.2062, state.staffCount - 1));
  
  // Preço Frota: Inicia em 5.000 e termina em 10.240.000 no nível 15
  // Razão calculada para 14 saltos: (10240000 / 5000) ^ (1/14) ≈ 1.7191
  const currentMachineryPrice = state.machineryCount >= MACHINERY_LIMIT ? 0 : Math.floor(5000 * Math.pow(1.7191, state.machineryCount));
  
  const currentFarmData = FARM_TIERS.find(t => t.id === state.ownedFarmId);
  const extraPlotsCount = currentFarmData ? state.plots.length - currentFarmData.plotCount : 0;
  const maxExtraPlots = currentFarmData ? Math.floor(currentFarmData.plotCount * 0.5) : 0;
  const plotExpansionPrice = currentFarmData ? Math.floor(currentFarmData.price / currentFarmData.plotCount) : 0;
  const canExpandMore = extraPlotsCount < maxExtraPlots;

  const siloCapacityPerCrop = Math.max(10, state.plots.length * 3);

  useEffect(() => {
    localStorage.setItem('fazenda_master_state_v3', JSON.stringify(state));
  }, [state]);

  const isBioActive = state.bioAcceleratorUnlocked || (state.temporaryBioAcceleratorUntil !== null && state.temporaryBioAcceleratorUntil > currentTime);
  const machineBonus = 1 - (state.machineryCount * 0.05); 
  const bioBonus = isBioActive ? 0.5 : 1.0;
  
  const efficiencyMultiplier = Math.max(0.25, machineBonus * bioBonus);
  const staffBonus = Math.min(1.75, 1 + (state.staffCount * 0.02));

  const addTransaction = useCallback((type: 'income' | 'expense', amount: number, description: string, category: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      description,
      timestamp: Date.now(),
      category
    };
    setState(prev => ({
      ...prev,
      financialHistory: [...prev.financialHistory.slice(-49), newTx]
    }));
  }, []);

  useEffect(() => {
    if (state.level < 3) return;
    const updateMarketTrend = () => {
      setState(prev => {
        const allSellables = [...Object.keys(CROPS), ...Object.values(ANIMALS).map(a => a.resourceName)];
        let nextResource = '';
        const shouldRepeat = Math.random() < 0.19;
        if (shouldRepeat && prev.marketTrend) nextResource = prev.marketTrend.resourceName;
        else {
          const filtered = prev.marketTrend ? allSellables.filter(n => n !== prev.marketTrend?.resourceName) : allSellables;
          nextResource = filtered[Math.floor(Math.random() * filtered.length)];
        }
        const bonus = 0.28 + (Math.random() * (0.78 - 0.28));
        return {
          ...prev,
          marketTrend: { resourceName: nextResource, multiplier: 1 + bonus, endsAt: Date.now() + MARKET_EVENT_DURATION }
        };
      });
    };
    if (!state.marketTrend || state.marketTrend.endsAt <= Date.now()) updateMarketTrend();
    const interval = setInterval(() => {
      if (state.marketTrend && Date.now() >= state.marketTrend.endsAt) updateMarketTrend();
    }, 1000);
    return () => clearInterval(interval);
  }, [state.level, state.marketTrend]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      setState(prev => {
        let changed = false;
        const newPlots = prev.plots.map(plot => {
          if (plot.crop && plot.plantedAt && !plot.isHarvestable) {
            const adjustedGrowthTime = CROPS[plot.crop].growthTime * efficiencyMultiplier;
            if ((now - plot.plantedAt) / 1000 >= adjustedGrowthTime) {
              changed = true;
              return { ...plot, isHarvestable: true };
            }
          }
          return plot;
        });
        const newAnimals = prev.animals.map(animal => {
          if (!animal.isReady) {
            const adjustedProdTime = ANIMALS[animal.type].productionTime * efficiencyMultiplier;
            if ((now - animal.lastProducedAt) / 1000 >= adjustedProdTime) {
              changed = true;
              return { ...animal, isReady: true };
            }
          }
          return animal;
        });
        return changed ? { ...prev, plots: newPlots, animals: newAnimals } : prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [efficiencyMultiplier]);

  const handleLevelUp = (prev: GameState, newXP: number): GameState => {
    const leveledUp = newXP >= prev.level * XP_PER_LEVEL;
    if (leveledUp) {
      const newNewsItem: NewsItem = {
        id: `lvl-${Date.now()}`,
        type: 'levelUp',
        title: `Nível ${prev.level + 1}!`,
        message: `Parabéns! Você ganhou 6 minutos de Bio-Acelerador Grátis!`,
        timestamp: Date.now(),
        icon: '⭐'
      };
      return {
        ...prev,
        xp: newXP - (prev.level * XP_PER_LEVEL),
        level: prev.level + 1,
        temporaryBioAcceleratorUntil: Date.now() + BIO_BONUS_DURATION,
        news: [...prev.news.slice(-19), newNewsItem],
        evolutionHistory: [...prev.evolutionHistory, {
          timestamp: Date.now(),
          money: prev.money,
          grossValue: prev.money + (prev.staffCount * 500) + (prev.plots.length * 1000),
          xpTotal: prev.xp + newXP,
          level: prev.level + 1
        }]
      };
    }
    return { ...prev, xp: newXP };
  };

  const handlePlant = (plotId: number, crop: CropType) => {
    if (!state.ownedFarmId || (state.seedInventory[crop] || 0) <= 0) return;
    setState(prev => {
      const newSeeds = { ...prev.seedInventory };
      newSeeds[crop] -= 1;
      return {
        ...prev,
        seedInventory: newSeeds,
        plots: prev.plots.map(p => p.id === plotId ? { ...p, crop, plantedAt: Date.now(), isHarvestable: false } : p)
      };
    });
  };

  const handleMassPlant = (crop: CropType) => {
    setState(prev => {
      let seedsAvailable = prev.seedInventory[crop] || 0;
      if (seedsAvailable <= 0) return prev;
      const newPlots = prev.plots.map(plot => {
        if (!plot.crop && seedsAvailable > 0) {
          seedsAvailable--;
          return { ...plot, crop, plantedAt: Date.now(), isHarvestable: false };
        }
        return plot;
      });
      return {
        ...prev,
        seedInventory: { ...prev.seedInventory, [crop]: seedsAvailable },
        plots: newPlots
      };
    });
    setShowMassPlantPicker(false);
  };

  const handleHarvest = (plotId: number) => {
    const plot = state.plots.find(p => p.id === plotId);
    if (!plot || !plot.crop || !plot.isHarvestable) return;
    if ((state.inventory[plot.crop] || 0) >= siloCapacityPerCrop) return;
    setState(prev => {
      const newInventory = { ...prev.inventory };
      newInventory[plot.crop!] = (newInventory[plot.crop!] || 0) + 1;
      return handleLevelUp({
        ...prev,
        inventory: newInventory,
        plots: prev.plots.map(p => p.id === plotId ? { ...p, crop: undefined, plantedAt: undefined, isHarvestable: false } : p)
      }, prev.xp + 25);
    });
  };

  const handleMassHarvest = () => {
    setState(prev => {
      let newInventory = { ...prev.inventory };
      let totalXpGained = 0;
      let changed = false;
      const newPlots = prev.plots.map(plot => {
        if (plot.isHarvestable && plot.crop) {
          const currentInSilo = newInventory[plot.crop] || 0;
          if (currentInSilo < siloCapacityPerCrop) {
            newInventory[plot.crop] = currentInSilo + 1;
            totalXpGained += 25;
            changed = true;
            return { ...plot, crop: undefined, plantedAt: undefined, isHarvestable: false };
          }
        }
        return plot;
      });
      if (!changed) return prev;
      return handleLevelUp({ ...prev, inventory: newInventory, plots: newPlots }, prev.xp + totalXpGained);
    });
  };

  const handleSellCrop = (resourceName: string) => {
    const qty = state.inventory[resourceName] || 0;
    if (qty <= 0) return;
    let basePrice = 0;
    if (CROPS[resourceName as CropType]) basePrice = CROPS[resourceName as CropType].salePrice;
    else {
      const animalType = Object.keys(ANIMALS).find(k => ANIMALS[k as AnimalType].resourceName === resourceName) as AnimalType;
      if (animalType) basePrice = ANIMALS[animalType].resourcePrice;
    }
    const marketMultiplier = (state.marketTrend?.resourceName === resourceName) ? state.marketTrend.multiplier : 1;
    const total = Math.floor(basePrice * staffBonus * marketMultiplier * qty);
    addTransaction('income', total, `Venda de ${qty}x ${resourceName}`, 'Mercado');
    setState(prev => {
      const newInv = { ...prev.inventory };
      delete newInv[resourceName];
      return { ...prev, money: prev.money + total, inventory: newInv };
    });
  };

  const handleSellAll = () => {
    let totalIncome = 0;
    const itemsSold: string[] = [];
    
    Object.entries(state.inventory).forEach(([resourceName, qty]) => {
      if (qty <= 0) return;
      
      let basePrice = 0;
      if (CROPS[resourceName as CropType]) {
        basePrice = CROPS[resourceName as CropType].salePrice;
      } else {
        const animalType = Object.keys(ANIMALS).find(k => ANIMALS[k as AnimalType].resourceName === resourceName) as AnimalType;
        if (animalType) basePrice = ANIMALS[animalType].resourcePrice;
      }
      
      const marketMultiplier = (state.marketTrend?.resourceName === resourceName) ? state.marketTrend.multiplier : 1;
      const total = Math.floor(basePrice * staffBonus * marketMultiplier * qty);
      totalIncome += total;
      itemsSold.push(`${qty}x ${resourceName}`);
    });

    if (totalIncome > 0) {
      addTransaction('income', totalIncome, `Liquidação de Estoque (${itemsSold.length} tipos)`, 'Mercado');
      setState(prev => ({
        ...prev,
        money: prev.money + totalIncome,
        inventory: {}
      }));
    }
  };

  const handleBuySeeds = (crop: CropType, quantity: number) => {
    const cropData = CROPS[crop];
    const totalCost = cropData.cost * quantity;
    if (state.money < totalCost) return;
    addTransaction('expense', totalCost, `Compra de ${quantity}x Sementes de ${crop}`, 'Mercado');
    setState(prev => {
      const newSeeds = { ...prev.seedInventory };
      newSeeds[crop] = (newSeeds[crop] || 0) + quantity;
      return { ...prev, money: prev.money - totalCost, seedInventory: newSeeds };
    });
  };

  const handleBuyAnimal = (type: AnimalType) => {
    const animalData = ANIMALS[type];
    if (state.money < animalData.cost) return;
    addTransaction('expense', animalData.cost, `Aquisição de ${type}`, 'Pecuária');
    setState(prev => ({
      ...prev,
      money: prev.money - animalData.cost,
      animals: [...prev.animals, { id: Math.random().toString(36).substr(2, 9), type, lastProducedAt: Date.now(), isReady: false }]
    }));
  };

  const handleCollectAnimal = (id: string) => {
    setState(prev => {
      const animal = prev.animals.find(a => a.id === id);
      if (!animal || !animal.isReady) return prev;
      const animalData = ANIMALS[animal.type];
      const newInventory = { ...prev.inventory };
      newInventory[animalData.resourceName] = (newInventory[animalData.resourceName] || 0) + 1;
      const newAnimals = prev.animals.map(a => a.id === id ? { ...a, isReady: false, lastProducedAt: Date.now() } : a);
      return handleLevelUp({ ...prev, inventory: newInventory, animals: newAnimals }, prev.xp + 50);
    });
  };

  const handleMassAnimalCollect = () => {
    setState(prev => {
      let newInventory = { ...prev.inventory };
      let totalXpGained = 0;
      let changed = false;
      const newAnimals = prev.animals.map(animal => {
        if (animal.isReady) {
          const animalData = ANIMALS[animal.type];
          newInventory[animalData.resourceName] = (newInventory[animalData.resourceName] || 0) + 1;
          totalXpGained += 50;
          changed = true;
          return { ...animal, isReady: false, lastProducedAt: Date.now() };
        }
        return animal;
      });
      if (!changed) return prev;
      return handleLevelUp({ ...prev, inventory: newInventory, animals: newAnimals }, prev.xp + totalXpGained);
    });
  };

  const handleHireStaff = () => {
    if (state.money < currentStaffPrice || state.staffCount >= STAFF_LIMIT) return;
    addTransaction('expense', currentStaffPrice, `Contratação de colaborador #${state.staffCount + 1}`, 'Gestão');
    setState(prev => ({ ...prev, money: prev.money - currentStaffPrice, staffCount: prev.staffCount + 1 }));
  };

  const handleBuyMachinery = () => {
    if (state.money < currentMachineryPrice || state.machineryCount >= MACHINERY_LIMIT) return;
    addTransaction('expense', currentMachineryPrice, `Compra de maquinário #${state.machineryCount + 1}`, 'Gestão');
    setState(prev => ({ ...prev, money: prev.money - currentMachineryPrice, machineryCount: prev.machineryCount + 1 }));
  };

  const handleExpandPlots = () => {
    if (state.money < plotExpansionPrice || !canExpandMore || !state.ownedFarmId) return;
    addTransaction('expense', plotExpansionPrice, `Expansão de Lote #${state.plots.length + 1}`, 'Lavouras');
    setState(prev => ({
      ...prev,
      money: prev.money - plotExpansionPrice,
      plots: [...prev.plots, { id: prev.plots.length, isHarvestable: false }]
    }));
  };

  const handlePurchaseTech = (techId: 'plant' | 'harvest' | 'bio' | 'animal_auto') => {
    let price = 0;
    let update: Partial<GameState> = {};
    let desc = "";

    if (techId === 'plant') { price = 8999; update = { autoPlantUnlocked: true }; desc = "Módulo de Plantio em Massa"; }
    else if (techId === 'harvest') { price = 8999; update = { autoHarvestUnlocked: true }; desc = "Sistema de Colheita Inteligente"; }
    else if (techId === 'animal_auto') { price = 15000; update = { autoAnimalCollectUnlocked: true }; desc = "Coleta Automatizada Pecuária"; }
    else if (techId === 'bio') { price = 125000; update = { bioAcceleratorUnlocked: true }; desc = "Bio-Acelerador Genético"; }

    if (state.money < price) return;
    addTransaction('expense', price, `Compra de Tecnologia: ${desc}`, 'Tecnologia');
    setState(prev => ({ ...prev, money: prev.money - price, ...update }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} ownedFarmId={state.ownedFarmId} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header state={state} onOpenFinancialHistory={() => setShowHistoryModal(true)} onOpenWarehouse={() => setShowWarehouseModal(true)} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'fazenda' && (
            <div className="max-w-6xl mx-auto h-full">
              {!state.ownedFarmId ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-32 h-32 bg-green-50 text-green-600 rounded-[3rem] flex items-center justify-center text-6xl mb-8 shadow-inner border-2 border-green-100"><i className="fas fa-map-location-dot"></i></div>
                  <h2 className="text-4xl font-black text-stone-900 mb-4">Comece sua Jornada Rural</h2>
                  <p className="text-stone-500 text-xl max-w-xl mb-10">Para iniciar o plantio, adquira sua primeira propriedade na Imobiliária!</p>
                  <button onClick={() => setActiveTab('imobiliaria')} className="px-10 py-5 bg-stone-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-green-600 transition-all">Ir para Imobiliária</button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight">Gerenciamento de Lotes ({state.plots.length})</h3>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Expansão disponível: {extraPlotsCount}/{maxExtraPlots} lotes extras</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        disabled={!canExpandMore || state.money < plotExpansionPrice}
                        onClick={handleExpandPlots}
                        className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 border-2 ${
                          canExpandMore && state.money >= plotExpansionPrice 
                            ? 'bg-amber-500 text-white border-amber-400 hover:bg-amber-600' 
                            : 'bg-stone-100 text-stone-300 border-stone-200 grayscale cursor-not-allowed'
                        }`}
                      >
                        <i className="fas fa-expand"></i> 
                        {canExpandMore ? `Expandir Lote (R$ ${plotExpansionPrice.toLocaleString()})` : 'Limite de Expansão Atingido'}
                      </button>
                      {state.autoPlantUnlocked && (
                        <button onClick={() => setShowMassPlantPicker(true)} className="px-5 py-3 bg-blue-600 text-white border-2 border-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                          <i className="fas fa-layer-group"></i> Plantio Massa
                        </button>
                      )}
                      {state.autoHarvestUnlocked && (
                        <button onClick={handleMassHarvest} className="px-5 py-3 bg-green-600 text-white border-2 border-green-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all flex items-center gap-2">
                          <i className="fas fa-wheat-awn-circle-exclamation"></i> Colheita Massa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="farm-grid">
                    {state.plots.map((plot, index) => (
                      <FarmPlotComponent key={`${plot.id}-${index}`} plot={plot} playerLevel={state.level} seedInventory={state.seedInventory} efficiencyMultiplier={efficiencyMultiplier} siloCapacity={siloCapacityPerCrop} currentCropStock={plot.crop ? state.inventory[plot.crop] || 0 : 0} onPlant={(crop) => handlePlant(plot.id, crop)} onHarvest={(e) => handleHarvest(plot.id)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'pecuaria' && <Livestock state={state} onBuyAnimal={handleBuyAnimal} onCollect={handleCollectAnimal} onMassCollect={handleMassAnimalCollect} autoCollectUnlocked={!!state.autoAnimalCollectUnlocked} efficiencyMultiplier={efficiencyMultiplier} />}
          {activeTab === 'mercado' && <Marketplace state={state} onBuySeeds={handleBuySeeds} />}
          {activeTab === 'imobiliaria' && <FarmShop state={state} onBuy={(t) => setState(p => ({ ...p, ownedFarmId: t.id, money: p.money - t.price, plots: Array.from({ length: t.plotCount }, (_, i) => ({ id: i, isHarvestable: false })) }))} />}
          {activeTab === 'noticias' && <FarmNews news={state.news} />}
          {activeTab === 'seguranca' && <BackupCentral state={state} onImport={setState} />}
          {activeTab === 'gestao' && (
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
              <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-stone-100 max-w-sm mx-auto">
                <button 
                  onClick={() => setGestaoSubTab('operacoes')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gestaoSubTab === 'operacoes' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Operações
                </button>
                <button 
                  onClick={() => setGestaoSubTab('tecnologia')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gestaoSubTab === 'tecnologia' ? 'bg-blue-600 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Pesquisa (P&D)
                </button>
              </div>

              {gestaoSubTab === 'operacoes' ? (
                <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><i className="fas fa-users"></i></div>
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Lucratividade</span>
                       <span className="text-2xl font-black text-stone-800">+{Math.round((staffBonus - 1) * 100)}%</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><i className="fas fa-bolt"></i></div>
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Eficiência</span>
                       <span className="text-2xl font-black text-stone-800">{Math.round((1 - efficiencyMultiplier) * 100)}%</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4"><i className="fas fa-warehouse"></i></div>
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Capacidade Silo</span>
                       <span className="text-2xl font-black text-stone-800">{siloCapacityPerCrop}</span>
                    </div>
                  </div>

                  <EvolutionCharts history={state.evolutionHistory} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg"><i className="fas fa-user-plus"></i></div>
                        <div>
                          <h4 className="font-black text-stone-800 text-lg tracking-tight">Equipe</h4>
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Atuais: {state.staffCount} / {STAFF_LIMIT}</p>
                        </div>
                      </div>
                      <p className="text-stone-500 text-xs mb-6 flex-1 leading-relaxed">Aumenta permanentemente o lucro de todas as vendas em <span className="text-blue-600 font-black">+2%</span> por membro (Máx: 75%).</p>
                      <button onClick={handleHireStaff} disabled={state.money < currentStaffPrice || state.staffCount >= STAFF_LIMIT} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all">
                        {state.staffCount >= STAFF_LIMIT ? 'LUCRO MÁXIMO ATINGIDO' : `Contratar (R$ ${currentStaffPrice.toLocaleString('pt-BR')})`}
                      </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg"><i className="fas fa-tractor"></i></div>
                        <div>
                          <h4 className="font-black text-stone-800 text-lg tracking-tight">Frota</h4>
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Atuais: {state.machineryCount} / {MACHINERY_LIMIT}</p>
                        </div>
                      </div>
                      <p className="text-stone-500 text-xs mb-6 flex-1 leading-relaxed">Acelera o tempo de crescimento em <span className="text-orange-600 font-black">+5%</span> por máquina (Máx: 75%).</p>
                      <button onClick={handleBuyMachinery} disabled={state.money < currentMachineryPrice || state.machineryCount >= MACHINERY_LIMIT} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-700 disabled:opacity-50 transition-all">
                        {state.machineryCount >= MACHINERY_LIMIT ? 'EFICIÊNCIA MÁXIMA ATINGIDA' : `Adquirir (R$ ${currentMachineryPrice.toLocaleString('pt-BR')})`}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <TechnologyTab state={state} onPurchase={handlePurchaseTech} />
                </div>
              )}
            </div>
          )}
        </div>
        
        {showMassPlantPicker && <MassPlantPicker seedInventory={state.seedInventory} onSelect={handleMassPlant} onClose={() => setShowMassPlantPicker(false)} />}
        {showWarehouseModal && <WarehouseModal inventory={state.inventory} seedInventory={state.seedInventory} capacityPerCrop={siloCapacityPerCrop} staffCount={state.staffCount} marketTrend={state.marketTrend} onSellAll={handleSellAll} onSellCrop={handleSellCrop} onClose={() => setShowWarehouseModal(false)} />}
        {showHistoryModal && <FinancialHistoryModal history={state.financialHistory} onClose={() => setShowHistoryModal(false)} />}
      </main>
    </div>
  );
};

export default App;
