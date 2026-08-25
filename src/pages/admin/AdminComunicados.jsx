import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { Send, Trash2, Bell } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';

const DESTINATARIOS_LABEL = {
  todos: 'Todos', seminarista: 'Seminaristas', staff: 'Staff', admin: 'Administradores',
};

export default function AdminComunicados() {
  const [form, setForm] = useState({ titulo: '', conteudo: '', destinatarios: 'todos' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(true);

  const loadHistorico = useCallback(async () => {
    try { const r = await adminAPI.listComunicados(); setHistorico(r.data); }
    catch { /* histórico é secundário — falha silenciosamente */ }
    finally { setHistoricoLoading(false); }
  }, []);

  useEffect(() => { loadHistorico(); }, [loadHistorico]);

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
      loadHistorico();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao enviar comunicado');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar este comunicado? Já foi enviado por email — isto só o remove do site.')) return;
    try {
      await adminAPI.deleteComunicado(id);
      toast.success('Comunicado eliminado');
      setHistorico(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao eliminar');
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Comunicados</h1>

      {sent && (
        <div className="bg-wine-50 border border-wine-200 rounded-xl p-4 mb-6 text-wine-800 text-sm">
          ✓ {sent.mensagem}
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">Enviar Novo Comunicado</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Destinatários</label>
            <select value={form.destinatarios} onChange={set('destinatarios')} className="input">
              <option value="todos">Todos</option>
              <option value="seminarista">Apenas Seminaristas</option>
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
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Send size={16} /> {loading ? 'A enviar...' : 'Enviar Comunicado'}
          </button>
        </form>
      </div>

      <div className="card mt-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> O comunicado será enviado por email a todos os destinatários seleccionados e ficará visível no painel de cada utilizador.
        </p>
      </div>

      {/* Histórico */}
      <div className="card mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">Comunicados Enviados</h2>
        {historicoLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">A carregar...</p>
        ) : !historico.length ? (
          <p className="text-sm text-gray-500 text-center py-6">Nenhum comunicado enviado ainda.</p>
        ) : (
          <div className="space-y-3">
            {historico.map(c => (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Bell size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-gray-900">{c.titulo}</p>
                    <span className="text-xs text-gray-400 shrink-0">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.conteudo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge bg-gray-100 text-gray-600 text-xs">{DESTINATARIOS_LABEL[c.destinatarios] || c.destinatarios}</span>
                    {c.autor?.nome && <span className="text-xs text-gray-400">por {c.autor.nome}</span>}
                    {!c.enviado_email && <span className="badge bg-amber-100 text-amber-700 text-xs">Email não enviado</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600 shrink-0" title="Eliminar">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
