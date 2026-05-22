import { useState } from 'react';
import { adminAPI } from '../../api';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminMateriais() {
  const [form, setForm] = useState({ titulo: '', descricao: '', tipo: 'documento', ano_formacao: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao carregar ficheiro');
    } finally {
      setLoading(false);
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
                {['documento', 'livro', 'apresentacao', 'outro'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Ano de Formação (opcional)</label>
              <select value={form.ano_formacao} onChange={set('ano_formacao')} className="input">
                <option value="">Todos os anos</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}º Ano</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Ficheiro *</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="input" accept=".pdf,.doc,.docx,.jpg,.png" />
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG · máx. 10MB</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Upload size={16} /> {loading ? 'A carregar...' : 'Carregar Material'}
          </button>
        </form>
      </div>
    </div>
  );
}
