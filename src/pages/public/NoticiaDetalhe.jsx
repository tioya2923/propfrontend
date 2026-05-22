import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { publicAPI } from '../../api';
import { formatDate } from '../../utils/format';
import { ArrowLeft } from 'lucide-react';

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const { data: noticia, loading, error } = useApi(() => publicAPI.getNoticia(id), [id]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !noticia) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-500 mb-4">Notícia não encontrada.</p>
      <Link to="/noticias" className="btn-primary">Ver todas as notícias</Link>
    </div>
  );

  return (
    <article className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/noticias" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft size={16} /> Todas as notícias
        </Link>

        <span className="badge bg-primary-100 text-primary-800 mb-4 capitalize">{noticia.categoria}</span>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{noticia.titulo}</h1>
        <p className="text-gray-500 text-sm mb-8">{formatDate(noticia.data_publicacao)}</p>

        {noticia.imagem_url && (
          <img src={noticia.imagem_url} alt={noticia.titulo} className="w-full rounded-xl mb-8 object-contain" />
        )}

        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: noticia.conteudo }} />
      </div>
    </article>
  );
}
