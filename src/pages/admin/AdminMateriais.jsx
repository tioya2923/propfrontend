import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { Upload, Trash2, FileDown, FileText, BookOpen, Presentation } from 'lucide-react';
import { formatDate, MATERIAL_TIPO_LABEL } from '../../utils/format';
import toast from 'react-hot-toast';

const BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const ICON = { documento: FileText, livro: BookOpen, apresentacao: Presentation };

export default function AdminMateriais() {
  const [form, setForm] = useState({ titulo: '', descricao: '', tipo: 'documento', ano_formacao: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const loadMateriais = useCallback(async () => {
    try { const r = await adminAPI.listMateriaisAdmin(); setMateriais(r.data); }
    catch { /* secundário — falha silenciosamente */ }
    finally { setListLoading(false); }
  }, []);

  useEffect(() => { loadMateriais(); }, [loadMateriais]);

  function set(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return toast.error('Selecione um ficheiro');
    if (!form.titulo) return toast.error('Título obrigatório');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('ficheiro', file);
      await adminAPI.uploadMaterial(fd);
      toast.success('Material carregado com sucesso');
      setForm({ titulo: '', descricao: '', tipo: 'documento', ano_formacao: '' });
      setFile(null);
      e.target.reset();
      loadMateriais();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao carregar ficheiro');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar este material?')) return;
    try {
      await adminAPI.deleteMaterialAdmin(id);
      toast.success('Material eliminado');
      setMateriais(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao eliminar');
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Materiais Académicos</h1>
      <div className="card">
        <h2 className="font-semibold mb-5">Carregar Novo Material</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Título *</label><input type="text" value={form.titulo} onChange={set('titulo')} className="input" required /></div>
          <div><label className="label">Descrição</label><textarea value={form.descricao} onChange={set('descricao')} rows={3} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tipo</label>
              <select value={form.tipo} onChange={set('tipo')} className="input">
                {['documento', 'livro', 'apresentacao', 'outro'].map(t => <option key={t} value={t}>{MATERIAL_TIPO_LABEL[t] || t}</option>)}
              </select>
            </div>
            <div><label className="label">Ano de Formação (opcional)</label>
              <select value={form.ano_formacao} onChange={set('ano_formacao')} className="input">
                <option value="">Todos os anos</option>
                {[1, 2, 3].map(n => <option key={n} value={n}>{n}º Ano</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Ficheiro *</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" />
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG, WEBP</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Upload size={16} /> {loading ? 'A carregar...' : 'Carregar Material'}
          </button>
        </form>
      </div>

      {/* Lista de materiais carregados */}
      <div className="card mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">Materiais Carregados</h2>
        {listLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">A carregar...</p>
        ) : !materiais.length ? (
          <p className="text-sm text-gray-500 text-center py-6">Nenhum material carregado ainda.</p>
        ) : (
          <div className="space-y-2">
            {materiais.map(m => {
              const Icon = ICON[m.tipo] || FileText;
              return (
                <div key={m.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{m.titulo}</p>
                      <p className="text-xs text-gray-400">
                        {m.ano_formacao ? `${m.ano_formacao}º Ano` : 'Todos os anos'}
                        {m.autor?.nome ? ` · ${m.autor.nome}` : ''} · {formatDate(m.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={`${BACKEND}${m.ficheiro_url}`} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded text-primary-600 hover:bg-primary-100" title="Descarregar">
                      <FileDown size={16} />
                    </a>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
