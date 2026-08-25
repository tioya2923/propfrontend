import { useState, useRef } from 'react';
import { adminAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, ImagePlus } from 'lucide-react';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

const BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const CATEGORIAS = ['geral', 'eventos', 'academico', 'formacao', 'comunidade', 'vocacao'];
const CATEGORIA_LABEL = {
  geral: 'Geral', eventos: 'Eventos', academico: 'Académico',
  formacao: 'Formação', comunidade: 'Comunidade', vocacao: 'Vocação',
};
const EMPTY = { titulo: '', resumo: '', conteudo: '', imagem_url: '', categoria: 'geral', destaque: false, publicado: false };

function ImageUpload({ value, onChange }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await adminAPI.uploadImagem(file);
      onChange(BACKEND + r.data.url);
      toast.success('Imagem carregada');
    } catch { toast.error('Erro ao carregar imagem'); }
    finally { setUploading(false); ref.current.value = ''; }
  }

  return (
    <div>
      <label className="label">Fotografia (opcional)</label>
      {value && (
        <div className="relative mb-2 inline-block">
          <img src={value} alt="preview" className="h-32 rounded-lg object-cover border border-gray-200" />
          <button type="button" onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            <X size={10} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => ref.current.click()} disabled={uploading}
          className="btn-secondary text-sm flex items-center gap-2 py-2">
          <ImagePlus size={15} /> {uploading ? 'A carregar...' : 'Escolher imagem'}
        </button>
        {!value && <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="ou cole um URL de imagem" className="input flex-1 text-sm" />}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function AdminNoticias() {
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data, loading, reload } = useApi(() => adminAPI.listNoticias({ page }), [page]);

  function abrirCriar() { setForm(EMPTY); setModal({ mode: 'create' }); }
  async function abrirEditar(id) {
    try {
      const r = await adminAPI.getNoticia(id);
      setForm({
        titulo: r.data.titulo, resumo: r.data.resumo || '',
        conteudo: r.data.conteudo, imagem_url: r.data.imagem_url || '',
        categoria: r.data.categoria, destaque: r.data.destaque, publicado: r.data.publicado,
      });
      setModal({ mode: 'edit', id });
    } catch { toast.error('Erro ao carregar notícia'); }
  }

  function set(f) { return v => setForm(d => ({ ...d, [f]: v })); }
  function setChk(f) { return e => setForm(d => ({ ...d, [f]: e.target.checked })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') await adminAPI.createNoticia(form);
      else await adminAPI.updateNoticia(modal.id, form);
      toast.success(modal.mode === 'create' ? 'Notícia criada' : 'Notícia actualizada');
      setModal(null);
      reload();
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao guardar'); }
    finally { setSaving(false); }
  }

  async function togglePublicar(n) {
    try {
      await adminAPI.updateNoticia(n.id, { publicado: !n.publicado });
      toast.success(n.publicado ? 'Notícia despublicada' : 'Notícia publicada');
      reload();
    } catch { toast.error('Erro'); }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar esta notícia? Esta acção é irreversível.')) return;
    try { await adminAPI.deleteNoticia(id); toast.success('Notícia eliminada'); reload(); }
    catch { toast.error('Erro ao eliminar'); }
  }

  const noticias = (data?.noticias || []).filter(n => !filtro || n.titulo.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
        <button onClick={abrirCriar} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} />Nova Notícia</button>
      </div>

      <input type="text" placeholder="Filtrar por título..." value={filtro} onChange={e => setFiltro(e.target.value)} className="input mb-6 max-w-sm" />

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Título', 'Categoria', 'Data', 'Estado', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {noticias.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {n.imagem_url && <img src={n.imagem_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
                      <div>
                        <p className="font-medium text-gray-900">{n.titulo}</p>
                        {n.destaque && <span className="badge bg-yellow-100 text-yellow-700 text-xs mt-1">Destaque</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{CATEGORIA_LABEL[n.categoria] || n.categoria}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(n.data_publicacao || n.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${n.publicado ? 'bg-wine-100 text-wine-700' : 'bg-gray-100 text-gray-500'}`}>
                      {n.publicado ? 'Publicada' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => togglePublicar(n)} title={n.publicado ? 'Despublicar' : 'Publicar'} className="text-gray-400 hover:text-primary-600">
                        {n.publicado ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => abrirEditar(n.id)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(n.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!noticias.length && <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nenhuma notícia</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Anterior</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page} / {Math.ceil(data.total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Seguinte</button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-semibold text-lg">{modal.mode === 'create' ? 'Nova Notícia' : 'Editar Notícia'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div><label className="label">Título *</label><input value={form.titulo} onChange={e => set('titulo')(e.target.value)} className="input" required /></div>
              <div><label className="label">Resumo</label><textarea value={form.resumo} onChange={e => set('resumo')(e.target.value)} rows={2} className="input" /></div>
              <div><label className="label">Conteúdo *</label><textarea value={form.conteudo} onChange={e => set('conteudo')(e.target.value)} rows={8} className="input font-mono text-sm" required placeholder="Pode usar HTML básico: <p>, <strong>, <em>, <ul>, <li>" /></div>
              <ImageUpload value={form.imagem_url} onChange={set('imagem_url')} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Categoria</label>
                  <select value={form.categoria} onChange={e => set('categoria')(e.target.value)} className="input">
                    {CATEGORIAS.map(c => <option key={c} value={c}>{CATEGORIA_LABEL[c] || c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.destaque} onChange={setChk('destaque')} className="w-4 h-4" />
                    <span className="text-sm text-gray-700">Notícia em destaque</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.publicado} onChange={setChk('publicado')} className="w-4 h-4" />
                    <span className="text-sm text-gray-700">Publicar imediatamente</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
