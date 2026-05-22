import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { semináristaAPI } from '../../api';
import { formatDateTime } from '../../utils/format';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Forum() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi(() => semináristaAPI.getForumPosts({ page }), [page]);
  const [novo, setNovo] = useState({ titulo: '', conteudo: '', categoria: 'geral' });
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!novo.conteudo) return toast.error('Conteúdo obrigatório');
    try {
      await semináristaAPI.createForumPost(novo);
      toast.success('Publicação criada');
      setNovo({ titulo: '', conteudo: '', categoria: 'geral' });
      setShowForm(false);
      setPage(1);
    } catch {
      toast.error('Erro ao publicar');
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fórum Comunitário</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          {showForm ? 'Cancelar' : '+ Nova publicação'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Nova Publicação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Título (opcional)</label><input type="text" value={novo.titulo} onChange={e => setNovo(n => ({ ...n, titulo: e.target.value }))} className="input" /></div>
            <div><label className="label">Mensagem *</label><textarea value={novo.conteudo} onChange={e => setNovo(n => ({ ...n, conteudo: e.target.value }))} rows={4} className="input" required /></div>
            <div>
              <label className="label">Categoria</label>
              <select value={novo.categoria} onChange={e => setNovo(n => ({ ...n, categoria: e.target.value }))} className="input">
                {['geral', 'liturgia', 'estudo', 'lazer', 'avisos'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Publicar</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-4">
          {!data?.posts?.length && <div className="card text-center py-10 text-gray-500">Nenhuma publicação ainda. Seja o primeiro!</div>}
          {data?.posts?.map(post => (
            <div key={post.id} className="card hover:shadow-sm transition-shadow">
              {post.fixado && <span className="badge bg-yellow-100 text-yellow-700 text-xs mb-2">📌 Fixado</span>}
              {post.titulo && <h2 className="font-semibold text-gray-900 mb-2">{post.titulo}</h2>}
              <p className="text-gray-700 text-sm leading-relaxed mb-3">{post.conteudo}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700 text-xs">
                    {post.autor?.nome?.charAt(0)}
                  </div>
                  {post.autor?.nome}
                </div>
                <span>·</span>
                <span>{formatDateTime(post.created_at)}</span>
                <span className="ml-auto badge bg-gray-100 text-gray-600 capitalize">{post.categoria}</span>
              </div>
            </div>
          ))}
          {data?.total > 20 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Seguinte</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
