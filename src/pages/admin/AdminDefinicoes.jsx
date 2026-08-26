import { useState } from 'react';
import { adminAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

export default function AdminDefinicoes() {
  const [form, setForm] = useState({ user_id: '', montante_mensal: 50000, moeda: 'AOA', data_vencimento: '' });
  const [loading, setLoading] = useState(false);
  function set(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.value })); }

  const { data, loading: seminaristasLoading } = useApi(() => adminAPI.listSeminaristas({ limit: 500 }), []);
  const seminaristas = (data?.seminaristas || [])
    .filter(u => u.permissoes === 'seminarista')
    .sort((a, b) => a.nome.localeCompare(b.nome));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.user_id) return toast.error('Seleccione um seminarista');
    setLoading(true);
    try {
      await adminAPI.configurarPropina(form);
      toast.success('Propina configurada com sucesso');
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao configurar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Definições</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Configurar Propina de Seminarista</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Seminarista *</label>
            <select value={form.user_id} onChange={set('user_id')} className="input" required disabled={seminaristasLoading}>
              <option value="">{seminaristasLoading ? 'A carregar...' : 'Seleccione um seminarista'}</option>
              {seminaristas.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nome}{u.ano_formacao ? ` — ${u.ano_formacao}º Ano` : ''}
                </option>
              ))}
            </select>
            {!seminaristasLoading && !seminaristas.length && (
              <p className="text-xs text-gray-400 mt-1">Nenhum seminarista encontrado. Cria primeiro em Membros e Seminaristas.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Montante Mensal</label><input type="number" value={form.montante_mensal} onChange={set('montante_mensal')} className="input" min="0" /></div>
            <div><label className="label">Moeda</label>
              <select value={form.moeda} onChange={set('moeda')} className="input">
                <option>AOA</option><option>EUR</option><option>USD</option>
              </select>
            </div>
          </div>
          <div><label className="label">Data de Vencimento</label><input type="date" value={form.data_vencimento} onChange={set('data_vencimento')} className="input" /></div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'A guardar...' : 'Configurar Propina'}</button>
        </form>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-2">Configurações do Sistema</h3>
        <p className="text-sm text-amber-800">Para configurações avançadas (chaves de pagamento, SMTP, backups), edite o ficheiro <code>.env</code> no servidor e reinicie o backend.</p>
      </div>
    </div>
  );
}
