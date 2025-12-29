
import React from 'react';
import { CropType } from '../types';
import { CROPS } from '../constants';

interface MassPlantPickerProps {
  seedInventory: Record<string, number>;
  onSelect: (crop: CropType) => void;
  onClose: () => void;
}

const MassPlantPicker: React.FC<MassPlantPickerProps> = ({ seedInventory, onSelect, onClose }) => {
  const availableSeeds = (Object.entries(seedInventory) as [CropType, number][])
    .filter(([_, qty]) => qty > 0)
    .sort((a, b) => b[1] - a[1]);

  const renderIcon = (icon: string) => {
    if (icon.startsWith('http')) {
      return <img src={icon} alt="crop" className="w-10 h-10 object-contain" />;
    }
    return <span className="text-3xl">{icon}</span>;
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh] animate-[fadeIn_0.2s_ease-out]">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-2xl font-black text-stone-800">Plantio em Massa</h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Preencher todos os lotes vazios</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 transition-all shadow-sm">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 gap-3">
          {availableSeeds.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <i className="fas fa-box-open text-stone-200 text-5xl mb-4"></i>
              <p className="text-stone-400 font-black uppercase tracking-widest text-sm">Sem sementes em estoque</p>
              <p className="text-stone-300 text-xs mt-2 italic">Vá ao mercado para comprar sementes.</p>
            </div>
          ) : (
            availableSeeds.map(([type, qty]) => {
              const crop = CROPS[type];
              return (
                <button
                  key={type}
                  onClick={() => onSelect(type)}
                  className="bg-white border-2 border-stone-100 rounded-3xl p-5 flex items-center justify-between hover:border-green-400 hover:bg-green-50 transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-white transition-colors">
                      {renderIcon(crop.icon)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-stone-800 text-lg leading-none mb-1">{type}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        Crescimento: {crop.growthTime}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-stone-400 uppercase tracking-tighter mb-1">Disponível</span>
                    <span className="text-2xl font-black text-green-600">{qty}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100">
          <p className="text-[10px] text-stone-400 font-bold text-center uppercase tracking-widest italic">
            O sistema plantará automaticamente até o limite do estoque ou lotes disponíveis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MassPlantPicker;
