import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, FileDown } from 'lucide-react';
import { professorAPI } from '../../api';
import toast from 'react-hot-toast';

const BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const TIPOS = ['outro', 'apostila', 'exercicio', 'leitura', 'apresentacao'];

export default function ProfessorMateriais() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', tipo: 'outro', ano_formacao: '' });
  const fileRef = useRef(null);

  useEffect(() => {
    professorAPI.getMateriais()
      .then(r => setMateriais(r.data))
      .catch(() => toast.error('Erro ao carregar materiais'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Selecione um ficheiro');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('ficheiro', file);
      fd.append('titulo', form.titulo || file.name);
      fd.append('descricao', form.descricao);
      fd.append('tipo', form.tipo);
      if (form.ano_formacao) fd.append('ano_formacao', form.ano_formacao);
      const r = await professorAPI.uploadMaterial(fd);
      setMateriais(prev => [r.data, ...prev]);
      setForm({ titulo: '', descricao: '', tipo: 'outro', ano_formacao: '' });
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Material enviado');
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao enviar'); }
    finally { setUploading(false); }
  }

  async function apagar(id) {
    if (!confirm('Eliminar este material?')) return;
    try {
      await professorAPI.deleteMaterial(id);
      setMateriais(prev => prev.filter(m => m.id !== id));
      toast.success('Eliminado');
    } catch { toast.error('Erro ao eliminar'); }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Upload size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Materiais Didáticos</h1>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Enviar Material</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <input ref={fileRef} type="file" className="input" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar" required />
          <input className="input" placeholder="Título (opcional — usa o nome do ficheiro por omissão)" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ano de Formação</label>
              <input type="number" className="input" placeholder="Todos" min="1" max="6" value={form.ano_formacao} onChange={e => setForm(f => ({ ...f, ano_formacao: e.target.value }))} />
            </div>
          </div>
          <input className="input" placeholder="Descrição" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          <button type="submit" disabled={uploading} className="btn-primary w-full">
            {uploading ? 'A enviar...' : 'Enviar Material'}
          </button>
        </form>
      </div>

      {materiais.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Nenhum material enviado</div>
      ) : (
        <div className="space-y-3">
          {materiais.map(m => (
            <div key={m.id} className="card flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{m.titulo}</p>
                <p className="text-xs text-gray-400">{m.tipo}{m.ano_formacao ? ` · Ano ${m.ano_formacao}` : ' · Todos os anos'}</p>
                {m.descricao && <p className="text-sm text-gray-500 mt-0.5">{m.descricao}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {m.ficheiro_url && (
                  <a href={`${BACKEND}${m.ficheiro_url}`} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded text-primary-600 hover:bg-primary-50" title="Descarregar">
                    <FileDown size={16} />
                  </a>
                )}
                <button onClick={() => apagar(m.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
