import { useApi } from '../../hooks/useApi';
import { semináristaAPI } from '../../api';
import { formatDateTime } from '../../utils/format';
import { Bell } from 'lucide-react';

export default function Comunicados() {
  const { data: comunicados, loading } = useApi(() => semináristaAPI.getComunicados(), []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Comunicados</h1>
      {!comunicados?.length ? (
        <div className="card text-center py-10 text-gray-500">Nenhum comunicado recebido.</div>
      ) : (
        <div className="space-y-4">
          {comunicados.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Bell size={18} className="text-yellow-500 mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-semibold text-gray-900">{c.titulo}</h2>
                    <span className="text-xs text-gray-400 shrink-0">{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.conteudo}</p>
                  {c.autor && <p className="text-xs text-gray-400 mt-3">— {c.autor.nome}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
