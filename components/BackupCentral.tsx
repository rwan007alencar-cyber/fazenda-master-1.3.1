
import React, { useRef, useState } from 'react';
import { GameState } from '../types';
import { INITIAL_STATE } from '../constants';

interface BackupCentralProps {
  state: GameState;
  onImport: (newState: GameState) => void;
}

const BackupCentral: React.FC<BackupCentralProps> = ({ state, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Função para garantir que o estado importado tenha todos os campos da versão atual (v1.3.0)
  const migrateState = (importedData: any): GameState => {
    return {
      ...INITIAL_STATE, // Começa com o estado inicial para garantir campos novos
      ...importedData,  // Sobrescreve com o que veio no arquivo
      // Garante que arrays e objetos complexos existam mesmo em versões antigas (1.1.0-EVO)
      plots: importedData.plots || INITIAL_STATE.plots,
      animals: importedData.animals || [],
      inventory: importedData.inventory || {},
      seedInventory: importedData.seedInventory || INITIAL_STATE.seedInventory,
      financialHistory: importedData.financialHistory || [],
      evolutionHistory: importedData.evolutionHistory || [],
      news: importedData.news || []
    };
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fazenda_master_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Progresso exportado com sucesso!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ type: 'error', message: 'Erro ao gerar arquivo de backup.' });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rawData = JSON.parse(content);
        
        // Verificação mínima de integridade
        if (rawData && (typeof rawData.money === 'number' || typeof rawData.money === 'string')) {
          const migratedState = migrateState(rawData);
          
          if (window.confirm("Atenção: Carregar um backup (incluindo versões 1.1.0-EVO) substituirá seu progresso atual. Deseja continuar?")) {
            onImport(migratedState);
            setStatus({ type: 'success', message: 'Fazenda restaurada e atualizada com sucesso!' });
            setTimeout(() => window.location.reload(), 1200);
          }
        } else {
          throw new Error("Formato incompatível");
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Arquivo inválido ou incompatível com a versão 1.1.0-EVO.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-stone-100 relative overflow-hidden">
        {/* Elementos Decorativos */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="w-24 h-24 bg-stone-900 text-green-500 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border-4 border-stone-800">
              <i className="fas fa-shield-halved"></i>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Central de Segurança</h2>
              <p className="text-stone-500 text-lg leading-relaxed max-w-2xl">
                Salve o estado da sua fazenda em um arquivo local para nao perder seu progresso. Você pode carregar esse arquivo em qualquer outro dispositivo para continuar de onde parou.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200">
                <i className="fas fa-code-branch"></i> Compatível com Versão 1.1.0-EVO
              </div>
            </div>
          </div>

          {status && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-bounce ${
              status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
              <span className="text-sm font-black uppercase tracking-widest">{status.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={handleExport}
              className="group bg-white border-2 border-stone-100 p-8 rounded-[2.5rem] hover:border-green-500 hover:shadow-2xl transition-all text-left flex flex-col gap-4 active:scale-95"
            >
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-green-600 group-hover:text-white transition-all">
                <i className="fas fa-cloud-arrow-down"></i>
              </div>
              <div>
                <h4 className="font-black text-stone-900 text-xl">Exportar Progresso</h4>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Baixar arquivo .json</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group bg-white border-2 border-stone-100 p-8 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl transition-all text-left flex flex-col gap-4 active:scale-95"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fas fa-file-import"></i>
              </div>
              <div>
                <h4 className="font-black text-stone-900 text-xl">Importar Progresso</h4>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Selecionar arquivo .json</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-amber-200">
          <i className="fas fa-info-circle"></i>
        </div>
        <p className="text-amber-900 text-sm font-bold leading-relaxed italic">
          Aviso: Os arquivos sao salvos localmente e nao em nossos servidores. Guarde seus backups em local seguro como Google Drive ou um pendrive para máxima segurança.
        </p>
      </div>
    </div>
  );
};

export default BackupCentral;
