import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { semináristaAPI } from '../../api';
import { formatDateTime } from '../../utils/format';
import { MessageSquare, Send, CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

function Autor({ nome }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700 text-xs shrink-0">
        {nome?.charAt(0)}
      </div>
      {nome}
    </div>
  );
}

function ReplyForm({ onSubmit, onCancel }) {
  const [conteudo, setConteudo] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!conteudo.trim()) return;
    setSending(true);
    try {
      await onSubmit(conteudo.trim());
      setConteudo('');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        type="text" value={conteudo} onChange={e => setConteudo(e.target.value)}
        className="input flex-1 text-sm" placeholder="Escreva uma resposta..." autoFocus
      />
      <button type="submit" disabled={sending || !conteudo.trim()} className="btn-primary text-sm px-4 disabled:opacity-50">
        {sending ? '...' : 'Enviar'}
      </button>
      <button type="button" onClick={onCancel} className="btn-secondary text-sm px-3">Cancelar</button>
    </form>
  );
}

export default function Forum() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(() => semináristaAPI.getForumPosts({ page }), [page]);
  const [novo, setNovo] = useState({ titulo: '', conteudo: '', categoria: 'geral' });
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [replyingId, setReplyingId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!novo.conteudo) return toast.error('Conteúdo obrigatório');
    setCreating(true);
    try {
      await semináristaAPI.createForumPost(novo);
      toast.success('Publicação criada');
      setNovo({ titulo: '', conteudo: '', categoria: 'geral' });
      setShowForm(false);
      setPage(1);
      reload();
    } catch {
      toast.error('Erro ao publicar');
    } finally {
      setCreating(false);
    }
  }

  async function handleReply(postId, conteudo) {
    try {
      await semináristaAPI.createForumPost({ conteudo, parent_id: postId });
      toast.success('Resposta publicada');
      setReplyingId(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao responder');
      throw err;
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
            <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Send size={16} /> {creating ? 'A publicar...' : 'Publicar'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : error ? (
        <div className="card text-center py-10 text-gray-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {!data?.posts?.length && <div className="card text-center py-10 text-gray-500">Nenhuma publicação ainda. Seja o primeiro!</div>}
          {data?.posts?.map(post => (
            <div key={post.id} className="card hover:shadow-sm transition-shadow">
              {post.fixado && <span className="badge bg-yellow-100 text-yellow-700 text-xs mb-2">📌 Fixado</span>}
              {post.titulo && <h2 className="font-semibold text-gray-900 mb-2">{post.titulo}</h2>}
              <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.conteudo}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <Autor nome={post.autor?.nome} />
                <span>·</span>
                <span>{formatDateTime(post.createdAt)}</span>
                <span className="badge bg-gray-100 text-gray-600 capitalize">{post.categoria}</span>
                <button
                  onClick={() => setReplyingId(replyingId === post.id ? null : post.id)}
                  className="ml-auto flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <CornerDownRight size={13} /> Responder
                </button>
              </div>

              {/* Respostas */}
              {post.respostas?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  {post.respostas.map(r => (
                    <div key={r.id} className="pl-4 border-l-2 border-gray-100">
                      <p className="text-gray-700 text-sm leading-relaxed mb-1.5 whitespace-pre-wrap">{r.conteudo}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Autor nome={r.autor?.nome} />
                        <span>·</span>
                        <span>{formatDateTime(r.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário de resposta */}
              {replyingId === post.id && (
                <ReplyForm
                  onSubmit={(conteudo) => handleReply(post.id, conteudo)}
                  onCancel={() => setReplyingId(null)}
                />
              )}
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
