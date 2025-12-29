
import React from 'react';
import { ProgressSnapshot } from '../types';

interface EvolutionChartsProps {
  history: ProgressSnapshot[];
}

const renderSparkline = (data: number[], color: string) => {
  if (data.length < 2) return <div className="h-20 flex items-center justify-center text-[10px] text-stone-400 uppercase font-black">Coletando dados...</div>;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 300;
  const height = 80;
  const padding = 5;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 drop-shadow-sm overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="animate-[draw_1s_ease-out]"
      />
      <style>{`
        @keyframes draw {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
};

const EvolutionCharts: React.FC<EvolutionChartsProps> = ({ history }) => {
  const latest = history.length > 0 ? history[history.length - 1] : { money: 0, grossValue: 0, xpTotal: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico Patrimônio (Dinheiro e Ativos) */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Análise de Balanço</span>
              <h4 className="text-xl font-black text-stone-800">Evolução de Patrimônio</h4>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:rotate-12 transition-transform">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          
          <div className="mb-6">
             {/* O gráfico mostra a tendência do patrimônio bruto para refletir o crescimento real */}
             {renderSparkline(history.map(s => s.grossValue || s.money), '#d97706')}
          </div>

          {/* Divisão solicitada: Bruto e Líquido */}
          <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
            <div className="border-r border-stone-100 pr-2">
              <div className="flex items-center gap-1.5 mb-1">
                <i className="fas fa-wallet text-amber-500 text-[10px]"></i>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">Patrimônio Líquido</span>
              </div>
              <div className="text-lg font-black text-stone-900 leading-none">
                R$ {latest.money.toLocaleString()}
              </div>
              <p className="text-[8px] text-stone-400 font-bold mt-1 uppercase">Saldo em Conta</p>
            </div>
            
            <div className="pl-2">
              <div className="flex items-center gap-1.5 mb-1">
                <i className="fas fa-building-columns text-stone-800 text-[10px]"></i>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">Patrimônio Bruto</span>
              </div>
              <div className="text-lg font-black text-stone-900 leading-none">
                R$ {(latest.grossValue || latest.money).toLocaleString()}
              </div>
              <p className="text-[8px] text-stone-400 font-bold mt-1 uppercase">Total de Ativos</p>
            </div>
          </div>
        </div>

        {/* Gráfico XP */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Experiência Acumulada</span>
              <h4 className="text-xl font-black text-stone-800">Progresso de Carreira</h4>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:-rotate-12 transition-transform">
              <i className="fas fa-star"></i>
            </div>
          </div>
          <div className="mb-4">
             {renderSparkline(history.map(s => s.xpTotal), '#16a34a')}
          </div>
          <div className="flex justify-between items-end mt-4 pt-4 border-t border-stone-100">
             <div>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter block mb-1">Total acumulado</span>
                <span className="text-2xl font-black text-stone-900 leading-none">{latest.xpTotal.toLocaleString()} XP</span>
             </div>
             <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Em Ascensão</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionCharts;
