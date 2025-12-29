
import React from 'react';
import { GameState } from '../types';

interface TechnologyTabProps {
  state: GameState;
  onPurchase: (techId: 'plant' | 'harvest' | 'bio' | 'animal_auto') => void;
}

const TechnologyTab: React.FC<TechnologyTabProps> = ({ state, onPurchase }) => {
  const techs = [
    {
      id: 'plant' as const,
      name: 'Módulo de Plantio em Massa',
      price: 8999,
      icon: 'fa-layer-group',
      description: 'Libera a interface de plantio industrial. Preencha todos os lotes disponíveis de uma só vez consultando o estoque do armazém.',
      unlocked: state.autoPlantUnlocked,
      color: 'blue'
    },
    {
      id: 'harvest' as const,
      name: 'Sistema de Colheita Inteligente',
      price: 8999,
      icon: 'fa-wheat-awn-circle-exclamation',
      description: 'Colha instantaneamente todas as culturas prontas da fazenda até o limite de capacidade do seu silo.',
      unlocked: state.autoHarvestUnlocked,
      color: 'cyan'
    },
    {
      id: 'animal_auto' as const,
      name: 'Coleta Automatizada (Pecuária)',
      price: 15000,
      icon: 'fa-hand-holding-hand',
      description: 'Recolha todos os produtos de origem animal (ovos, leite, lã, carne) prontos para coleta com um único comando centralizado.',
      unlocked: state.autoAnimalCollectUnlocked,
      color: 'amber'
    },
    {
      id: 'bio' as const,
      name: 'Bio-Acelerador Genético',
      price: 125000,
      icon: 'fa-dna',
      description: 'Reduz permanentemente em 50% o tempo de crescimento de todas as plantas e o ciclo de produção dos animais.',
      unlocked: state.bioAcceleratorUnlocked,
      color: 'indigo'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl border border-blue-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="inline-block bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-400/30">
            P&D - Pesquisa e Desenvolvimento
          </div>
          <h2 className="text-4xl font-black mb-3 tracking-tight">Centro de Tecnologia</h2>
          <p className="text-blue-100/70 text-lg max-w-2xl leading-relaxed italic">
            Invista em engenharia de ponta para automatizar sua fazenda e multiplicar a eficiência da sua produção.
          </p>
        </div>
        <div className="absolute right-10 bottom-0 opacity-10 text-[12rem] select-none translate-y-10">
           <i className="fas fa-microchip"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {techs.map((tech) => (
          <div 
            key={tech.id} 
            className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all flex flex-col relative overflow-hidden ${tech.unlocked ? 'border-blue-500 bg-blue-50/10' : 'border-stone-100 hover:shadow-xl'}`}
          >
            {tech.unlocked && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg z-20">
                ADQUIRIDO
              </div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg ${tech.unlocked ? 'bg-blue-600 text-white' : 'bg-stone-50 text-stone-400'}`}>
              <i className={`fas ${tech.icon}`}></i>
            </div>
            
            <h3 className="text-xl font-black text-stone-800 mb-2 leading-tight">{tech.name}</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-8 flex-1">
              {tech.description}
            </p>
            
            <div className="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100">
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Custo de Licenciamento</span>
               <span className="text-xl font-black text-stone-900">R$ {tech.price.toLocaleString()}</span>
            </div>

            <button
              disabled={tech.unlocked || state.money < tech.price}
              onClick={() => onPurchase(tech.id)}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                tech.unlocked 
                  ? 'bg-blue-100 text-blue-500 cursor-default' 
                  : state.money >= tech.price 
                    ? 'bg-stone-900 text-white hover:bg-blue-600 shadow-xl shadow-blue-200' 
                    : 'bg-stone-100 text-stone-300'
              }`}
            >
              {tech.unlocked ? 'ATIVO NO SISTEMA' : `COMPRAR AGORA`}
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-stone-900 p-8 rounded-[2.5rem] flex items-center gap-6 border border-stone-800">
        <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <p className="text-stone-400 text-xs font-medium italic">
          As tecnologias adquiridas são permanentes e vinculadas à sua sede de comando. Elas não são perdidas ao trocar de propriedade na imobiliária.
        </p>
      </div>
    </div>
  );
};

export default TechnologyTab;
