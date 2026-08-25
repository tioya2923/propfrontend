import { useState } from 'react';
import { adminAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import { formatDateTime } from '../../utils/format';
import { MessageSquare, Pin, PinOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIAS = ['todas', 'geral', 'liturgia', 'estudo', 'lazer', 'avisos', 'academico'];

function PostCard({ post, isReply, onTogglePin, onDelete }) {
  return (
    <div className={isReply ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''}>
      <div className="card hover:shadow-sm transition-shadow">
        {post.fixado && <span className="badge bg-yellow-100 text-yellow-700 text-xs mb-2">📌 Fixado</span>}
        {post.titulo && <h2 className="font-semibold text-gray-900 mb-2">{post.titulo}</h2>}
        <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.conteudo}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700 text-xs shrink-0">
              {post.autor?.nome?.charAt(0)}
            </div>
            {post.autor?.nome}
          </div>
          <span>·</span>
          <span>{formatDateTime(post.createdAt)}</span>
          <span className="badge bg-gray-100 text-gray-600 capitalize">{post.categoria}</span>
          <div className="ml-auto flex items-center gap-1">
            {!isReply && (
              <button onClick={() => onTogglePin(post)} title={post.fixado ? 'Desafixar' : 'Fixar'}
                className={`p-1.5 rounded-lg transition-colors ${post.fixado ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                {post.fixado ? <PinOff size={15} /> : <Pin size={15} />}
              </button>
            )}
            <button onClick={() => onDelete(post)} title="Eliminar" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
      {!isReply && post.respostas?.length > 0 && (
        <div className="space-y-3 mt-3">
          {post.respostas.map(r => (
            <PostCard key={r.id} post={r} isReply onTogglePin={onTogglePin} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminForum() {
  const [page, setPage] = useState(1);
  const [categoria, setCategoria] = useState('todas');
  const { data, loading, reload } = useApi(
    () => adminAPI.listForum(categoria === 'todas' ? { page } : { page, categoria }),
    [page, categoria],
  );

  function mudarCategoria(c) { setCategoria(c); setPage(1); }

  async function handleTogglePin(post) {
    try {
      await adminAPI.pinForumPost(post.id);
      toast.success(post.fixado ? 'Publicação desafixada' : 'Publicação fixada');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao actualizar');
    }
  }

  async function handleDelete(post) {
    const aviso = post.respostas?.length
      ? `Eliminar esta publicação e as suas ${post.respostas.length} resposta(s)?`
      : 'Eliminar esta publicação?';
    if (!confirm(aviso)) return;
    try {
      await adminAPI.deleteForumPost(post.id);
      toast.success('Publicação eliminada');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao eliminar');
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Moderação do Fórum</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => mudarCategoria(c)}
            className={`badge px-4 py-2 text-sm cursor-pointer transition-colors capitalize ${categoria === c ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-4">
          {!data?.posts?.length && <div className="card text-center py-10 text-gray-500">Nenhuma publicação encontrada.</div>}
          {data?.posts?.map(post => (
            <PostCard key={post.id} post={post} onTogglePin={handleTogglePin} onDelete={handleDelete} />
          ))}
          {data?.total > 20 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Anterior</button>
              <span className="px-4 py-2 text-sm text-gray-600">Página {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Seguinte</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
