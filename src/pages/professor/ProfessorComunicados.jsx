import { useEffect, useState } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { professorAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ProfessorComunicados() {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', conteudo: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    professorAPI.getComunicados()
      .then(r => setComunicados(r.data))
      .catch(() => toast.error('Erro ao carregar comunicados'))
      .finally(() => setLoading(false));
  }, []);

  async function enviar(e) {
    e.preventDefault();
    if (!form.titulo || !form.conteudo) return toast.error('Preencha todos os campos');
    setSending(true);
    try {
      const r = await professorAPI.enviarComunicado(form);
      setComunicados(prev => [r.data, ...prev]);
      setForm({ titulo: '', conteudo: '' });
      setShowForm(false);
      toast.success('Comunicado enviado');
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao enviar'); }
    finally { setSending(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Megaphone size={24} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Comunicado
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Enviar Comunicado aos Alunos</h2>
          <form onSubmit={enviar} className="space-y-3">
            <input className="input" placeholder="Título *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
            <textarea className="input min-h-[120px]" placeholder="Conteúdo *" value={form.conteudo} onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))} required />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
              <button type="submit" disabled={sending} className="btn-primary text-sm">{sending ? 'A enviar...' : 'Enviar'}</button>
            </div>
          </form>
        </div>
      )}

      {comunicados.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Nenhum comunicado enviado</div>
      ) : (
        <div className="space-y-3">
          {comunicados.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{c.titulo}</h3>
                <span className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(c.created_at).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{c.conteudo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
