import { useApi } from '../../hooks/useApi';
import { semináristaAPI } from '../../api';
import { Download, FileText, BookOpen } from 'lucide-react';
import { formatDate } from '../../utils/format';

const ICON = { documento: FileText, livro: BookOpen, apresentacao: FileText };

export default function Materiais() {
  const { data: materiais, loading } = useApi(() => semináristaAPI.getMateriais(), []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Materiais Académicos</h1>
      {!materiais?.length ? (
        <div className="card text-center py-10 text-gray-500">Nenhum material disponível.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map(m => {
            const Icon = ICON[m.tipo] || FileText;
            return (
              <div key={m.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">{m.titulo}</p>
                    {m.descricao && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{m.tipo}</span>
                  <a href={m.ficheiro_url} target="_blank" rel="noreferrer" download className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                    <Download size={14} /> Descarregar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
