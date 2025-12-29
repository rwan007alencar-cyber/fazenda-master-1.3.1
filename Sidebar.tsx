
import React from 'react';

interface SidebarProps {
  activeTab: 'fazenda' | 'pecuaria' | 'mercado' | 'gestao' | 'imobiliaria' | 'noticias' | 'seguranca';
  setActiveTab: (tab: 'fazenda' | 'pecuaria' | 'mercado' | 'gestao' | 'imobiliaria' | 'noticias' | 'seguranca') => void;
  ownedFarmId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, ownedFarmId }) => {
  const hasFarm = ownedFarmId !== null;
  const isLivestockUnlocked = hasFarm && ownedFarmId !== 'sitio';

  const menuItems = [
    { 
      id: 'fazenda', 
      icon: hasFarm ? 'fa-seedling' : 'fa-lock', 
      label: 'Lavouras', 
      locked: !hasFarm,
      requirement: 'Requer Terra'
    },
    { 
      id: 'pecuaria', 
      icon: isLivestockUnlocked ? 'fa-cow' : 'fa-lock', 
      label: 'Pecuária', 
      locked: !isLivestockUnlocked,
      requirement: !hasFarm ? 'Requer Terra' : 'Fazenda Alvorada' 
    },
    { id: 'imobiliaria', icon: 'fa-sign-hanging', label: 'Imobiliária', locked: false },
    { 
      id: 'mercado', 
      icon: hasFarm ? 'fa-shop' : 'fa-lock', 
      label: 'Mercado', 
      locked: !hasFarm,
      requirement: 'Requer Terra'
    },
    { 
      id: 'gestao', 
      icon: hasFarm ? 'fa-user-gear' : 'fa-lock', 
      label: 'Gestão', 
      locked: !hasFarm,
      requirement: 'Requer Terra'
    },
    { id: 'seguranca', icon: 'fa-shield-halved', label: 'Segurança', locked: false },
    { 
      id: 'noticias', 
      icon: hasFarm ? 'fa-newspaper' : 'fa-lock', 
      label: 'Noticias', 
      locked: !hasFarm,
      requirement: 'Requer Terra'
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-stone-900 text-stone-400 flex flex-row md:flex-col z-20 sticky bottom-0 md:relative shadow-2xl">
      <div className="hidden md:flex p-6 mb-4 items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <i className="fas fa-tractor text-lg"></i>
        </div>
        <h1 className="text-white text-lg font-black tracking-tight uppercase">
          Fazenda <span className="text-green-500">Master</span>
        </h1>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 py-4 md:py-0 gap-1 overflow-x-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            disabled={item.locked}
            onClick={() => setActiveTab(item.id as any)}
            className={`
              flex flex-col md:flex-row items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 shrink-0 relative
              ${activeTab === item.id 
                ? 'bg-stone-800 text-white shadow-inner scale-[1.02]' 
                : item.locked 
                  ? 'opacity-40 grayscale cursor-not-allowed' 
                  : 'hover:bg-stone-800/50 hover:text-stone-300'}
            `}
          >
            <i className={`fas ${item.icon} text-lg ${activeTab === item.id ? 'text-green-500' : ''}`}></i>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">{item.label}</span>
              {item.locked && (
                <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter leading-none hidden md:block">
                  {item.requirement}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>

      <div className="hidden md:block p-6 border-t border-stone-800">
        <div className="bg-stone-800/50 rounded-2xl p-4 text-center border border-stone-700/50">
          <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-1">Versão 1.3.1-CEO</p>
          <div className="text-[9px] font-bold text-green-600/60 uppercase tracking-widest">
            Backup Local Ativo
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
