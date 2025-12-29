
import React, { useState, useEffect } from 'react';
import { GameState, AnimalType, AnimalState } from '../types';
import { ANIMALS } from '../constants';

interface LivestockProps {
  state: GameState;
  onBuyAnimal: (type: AnimalType) => void;
  onCollect: (id: string) => void;
  onMassCollect: () => void;
  autoCollectUnlocked: boolean;
  efficiencyMultiplier: number;
}

const Livestock: React.FC<LivestockProps> = ({ 
  state, 
  onBuyAnimal, 
  onCollect, 
  onMassCollect, 
  autoCollectUnlocked, 
  efficiencyMultiplier 
}) => {
  const [activeShop, setActiveShop] = useState(false);
  const isUnlocked = state.ownedFarmId !== null && state.ownedFarmId !== 'sitio';

  if (!isUnlocked) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border-2 border-amber-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">Unidade de Pecuária Bloqueada</h2>
          <p className="text-stone-500 text-lg mb-8 max-w-md leading-relaxed">
            Sua propriedade atual não possui infraestrutura para criação de animais. Adquira a <span className="text-amber-600 font-black">Fazenda Alvorada</span> ou superior na Imobiliária para desbloquear este setor.
          </p>
          <div className="flex gap-4">
             <div className="bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100 text-left">
               <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Status Requisito</span>
               <span className="text-sm font-bold text-red-500 uppercase">Não Atendido</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const readyToCollectCount = state.animals.filter(a => a.isReady).length;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-2xl border border-stone-800">
        <div>
          <div className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-amber-500/30">
            Unidade de Produção Animal
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Pecuária Master</h2>
          <p className="text-stone-400 text-sm max-w-md leading-relaxed italic opacity-80">
            Crie animais para produção contínua de recursos valiosos. Diferente das plantas, animais ficam na fazenda para sempre!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-0">
          {autoCollectUnlocked && !activeShop && state.animals.length > 0 && (
            <button 
              onClick={onMassCollect}
              disabled={readyToCollectCount === 0}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                readyToCollectCount > 0 
                  ? 'bg-green-600 text-white border-green-500 hover:bg-green-700 shadow-xl' 
                  : 'bg-stone-800 text-stone-600 border-stone-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-hand-holding-hand"></i> Coleta em Massa ({readyToCollectCount})
            </button>
          )}
          <button 
            onClick={() => setActiveShop(!activeShop)}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeShop ? 'bg-stone-700 text-white' : 'bg-amber-600 text-white hover:bg-amber-500 shadow-xl shadow-amber-900/20'}`}
          >
            {activeShop ? 'VOLTAR PARA REBANHO' : 'ADQUIRIR ANIMAIS'}
          </button>
        </div>
      </div>

      {activeShop ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-[fadeIn_0.3s_ease-out]">
          {(Object.values(ANIMALS)).map(animal => {
            const isIndividualLocked = state.level < animal.unlockLevel;
            const canAfford = state.money >= animal.cost;

            return (
              <div key={animal.type} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all flex flex-col relative ${isIndividualLocked ? 'opacity-60 grayscale border-stone-100' : 'border-stone-100 hover:border-amber-200 shadow-sm hover:shadow-xl'}`}>
                {isIndividualLocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-white/40 backdrop-blur-[1px] rounded-[2.5rem]">
                    <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <i className="fas fa-lock"></i>
                    </div>
                    <span className="text-xs font-black text-stone-900 uppercase">Nível {animal.unlockLevel}</span>
                  </div>
                )}
                <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner mx-auto">
                  {animal.icon}
                </div>
                <h3 className="text-xl font-black text-stone-800 text-center mb-1">{animal.type}</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center mb-6">Produz {animal.resourceName}</p>
                
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex justify-between text-xs p-3 bg-stone-50 rounded-xl">
                    <span className="font-bold text-stone-400 uppercase">Tempo Ciclo</span>
                    <span className="font-black text-stone-800">{animal.productionTime}s</span>
                  </div>
                  <div className="flex justify-between text-xs p-3 bg-stone-50 rounded-xl">
                    <span className="font-bold text-stone-400 uppercase">Preço Venda</span>
                    <span className="font-black text-green-600">R$ {animal.resourcePrice}</span>
                  </div>
                </div>

                <button 
                  disabled={isIndividualLocked || !canAfford}
                  onClick={() => onBuyAnimal(animal.type)}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${canAfford && !isIndividualLocked ? 'bg-stone-900 text-white hover:bg-green-600' : 'bg-stone-100 text-stone-300'}`}
                >
                  COMPRAR (R$ {animal.cost.toLocaleString()})
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {state.animals.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center border-2 border-dashed border-stone-200 rounded-[3rem] bg-white">
              <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 text-4xl mb-4">
                 <i className="fas fa-paw"></i>
              </div>
              <p className="text-stone-400 font-black uppercase tracking-widest">Nenhum animal no rebanho</p>
              <button onClick={() => setActiveShop(true)} className="mt-4 text-amber-600 font-bold hover:underline">Ir para a loja</button>
            </div>
          ) : (
            state.animals.map(animal => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                onCollect={() => onCollect(animal.id)} 
                efficiencyMultiplier={efficiencyMultiplier}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const AnimalCard: React.FC<{ animal: AnimalState, onCollect: () => void, efficiencyMultiplier: number }> = ({ animal, onCollect, efficiencyMultiplier }) => {
  const [progress, setProgress] = useState(0);
  const data = ANIMALS[animal.type];

  useEffect(() => {
    if (animal.isReady) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      const adjustedProdTime = data.productionTime * efficiencyMultiplier;
      const elapsed = (Date.now() - animal.lastProducedAt) / 1000;
      const p = Math.min(100, (elapsed / adjustedProdTime) * 100);
      setProgress(p);
    }, 100);

    return () => clearInterval(interval);
  }, [animal.isReady, animal.lastProducedAt, efficiencyMultiplier, data.productionTime]);

  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 relative group ${animal.isReady ? 'border-amber-400 bg-amber-50/30' : 'border-stone-100'}`}>
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner ${animal.isReady ? 'bg-amber-100 animate-sway' : 'bg-stone-50'}`}>
        {data.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-black text-stone-800 text-lg leading-tight">{animal.type}</h4>
        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3">Produzindo {data.resourceName}</p>
        
        {animal.isReady ? (
          <button 
            onClick={onCollect}
            className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all"
          >
            COLETAR {data.resourceName.toUpperCase()}
          </button>
        ) : (
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-100">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      {animal.isReady && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
          PRONTO
        </div>
      )}
    </div>
  );
};

export default Livestock;
