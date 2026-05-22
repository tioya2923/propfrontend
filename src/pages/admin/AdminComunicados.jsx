import { useState } from 'react';
import { adminAPI } from '../../api';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminComunicados() {
  const [form, setForm] = useState({ titulo: '', conteudo: '', destinatarios: 'todos' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);

  function set(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo || !form.conteudo) return toast.error('Título e conteúdo obrigatórios');
    setLoading(true);
    try {
      const res = await adminAPI.enviarComunicado(form);
      setSent(res.data);
      toast.success(res.data.mensagem);
      setForm({ titulo: '', conteudo: '', destinatarios: 'todos' });
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao enviar comunicado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enviar Comunicado</h1>

      {sent && (
        <div className="bg-wine-50 border border-wine-200 rounded-xl p-4 mb-6 text-wine-800 text-sm">
          ✓ {sent.mensagem}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Destinatários</label>
            <select value={form.destinatarios} onChange={set('destinatarios')} className="input">
              <option value="todos">Todos</option>
              <option value="seminaristas">Apenas Seminaristas</option>
              <option value="staff">Apenas Staff</option>
              <option value="admin">Apenas Administradores</option>
            </select>
          </div>
          <div>
            <label className="label">Título *</label>
            <input type="text" value={form.titulo} onChange={set('titulo')} className="input" required placeholder="Assunto do comunicado" />
          </div>
          <div>
            <label className="label">Conteúdo *</label>
            <textarea value={form.conteudo} onChange={set('conteudo')} rows={8} className="input" required placeholder="Escreva o conteúdo do comunicado..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Send size={16} /> {loading ? 'A enviar...' : 'Enviar Comunicado'}
          </button>
        </form>
      </div>

      <div className="card mt-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> O comunicado será enviado por email a todos os destinatários seleccionados e ficará visível no painel de cada utilizador.
        </p>
      </div>
    </div>
  );
}
