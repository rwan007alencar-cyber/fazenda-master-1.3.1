
import React, { useState } from 'react';
import { CROPS, ANIMALS } from '../constants';
import { CropType, AnimalType } from '../types';

interface WarehouseModalProps {
  inventory: Record<string, number>;
  seedInventory: Record<string, number>;
  marketTrend?: { resourceName: string; multiplier: number };
  staffCount: number;
  capacityPerCrop: number;
  onSellAll: () => void;
  onSellCrop: (cropName: string) => void;
  onClose: () => void;
  onGoToMarket?: () => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ 
  inventory, 
  seedInventory, 
  marketTrend, 
  staffCount, 
  capacityPerCrop,
  onSellAll, 
  onSellCrop, 
  onClose,
  onGoToMarket 
}) => {
  const [activeTab, setActiveTab] = useState<'silo' | 'sementes'>('silo');
  
  const inventoryItems = (Object.entries(inventory) as [string, number][]).filter(([_, qty]) => qty > 0);
  const seedItems = (Object.entries(seedInventory) as [string, number][]).filter(([_, qty]) => qty > 0);
  const staffBonus = 1 + (staffCount * 0.02);

  let totalSiloValue = 0;
  inventoryItems.forEach(([name, qty]) => {
    let base = 0;
    const crop = CROPS[name as CropType];
    if (crop) base = crop.salePrice;
    else {
      const animal = Object.values(ANIMALS).find(a => a.resourceName === name);
      if (animal) base = animal.resourcePrice;
    }
    const multiplier = (marketTrend && marketTrend.resourceName === name) ? marketTrend.multiplier : 1;
    totalSiloValue += Math.floor(base * staffBonus * multiplier * qty);
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-stone-50 border-b border-stone-100 p-2">
          <div className="flex p-1 bg-stone-200/50 rounded-2xl">
            <button 
              onClick={() => setActiveTab('silo')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'silo' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <i className="fas fa-warehouse mr-2"></i> Silo & Estoque
            </button>
            <button 
              onClick={() => setActiveTab('sementes')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sementes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <i className="fas fa-seedling mr-2"></i> Sementes
            </button>
          </div>
        </div>

        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-800">Armazém Master</h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Gerenciamento de Ativos</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'silo' ? (
            inventoryItems.length === 0 ? (
              <div className="text-center py-20 text-stone-300">
                <i className="fas fa-box-open text-5xl mb-4"></i>
                <p className="font-black uppercase text-xs">Vazio</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {inventoryItems.map(([name, qty]) => {
                  let icon = '📦';
                  const crop = CROPS[name as CropType];
                  if (crop) icon = crop.icon;
                  else {
                    const animal = Object.values(ANIMALS).find(a => a.resourceName === name);
                    if (animal) icon = animal.icon;
                  }
                  const isTrending = marketTrend?.resourceName === name;
                  return (
                    <div key={name} className={`bg-white border rounded-3xl p-4 transition-all ${isTrending ? 'border-amber-400 bg-amber-50/20' : 'border-stone-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-2xl">{icon.startsWith('http') ? <img src={icon} className="w-8 h-8 object-contain" /> : icon}</div>
                          <div>
                            <h4 className="font-black text-stone-800 text-sm flex items-center gap-2">
                              {name} {isTrending && <span className="bg-amber-400 text-stone-900 text-[8px] px-2 py-0.5 rounded-full uppercase animate-pulse">Alta Demanda</span>}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-bold uppercase">{qty} unidades</p>
                          </div>
                        </div>
                        <button onClick={() => onSellCrop(name)} className="px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase">Vender</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
             <div className="grid grid-cols-1 gap-3">
                {seedItems.map(([name, qty]) => (
                   <div key={name} className="bg-white border border-stone-100 rounded-3xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-2xl">🌱</div>
                        <div><h4 className="font-black text-stone-800 text-sm">{name}</h4><p className="text-[10px] text-stone-400 font-bold uppercase">{qty} pacotes</p></div>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-100">
          {activeTab === 'silo' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Valor Total de Mercado</span>
                <span className="text-3xl font-black text-green-600">R$ {totalSiloValue.toLocaleString()}</span>
              </div>
              <button disabled={inventoryItems.length === 0} onClick={onSellAll} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl disabled:opacity-50">VENDER TUDO</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;
