import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { semináristaAPI, authAPI } from '../../api';
import { formatDate } from '../../utils/format';
import { User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Perfil() {
  const { user } = useAuth();
  const [tab, setTab] = useState('perfil');
  const [nome, setNome] = useState(user?.nome || '');
  const [pwd, setPwd] = useState({ atual: '', nova: '', confirmar: '' });
  const [saving, setSaving] = useState(false);

  async function savePerfil(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await semináristaAPI.updatePerfil({ nome });
      toast.success('Perfil actualizado');
    } catch { toast.error('Erro ao guardar'); }
    finally { setSaving(false); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pwd.nova !== pwd.confirmar) return toast.error('As passwords não coincidem');
    if (pwd.nova.length < 8) return toast.error('Password deve ter mínimo 8 caracteres');
    setSaving(true);
    try {
      await authAPI.changePassword(pwd.atual, pwd.nova);
      toast.success('Password alterada com sucesso');
      setPwd({ atual: '', nova: '', confirmar: '' });
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao alterar password'); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>

      <div className="flex gap-1 mb-6">
        {[['perfil', User, 'Dados Pessoais'], ['password', Lock, 'Password']].map(([t, Icon, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Icon size={16} />{l}
          </button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-700">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{user?.nome}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="badge bg-primary-100 text-primary-700 text-xs capitalize">{user?.permissoes}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            {[
              ['Ano de Formação', user?.ano_formacao ? `${user.ano_formacao}º Ano` : '—'],
              ['Data de Entrada', formatDate(user?.data_entrada)],
              ['Email', user?.email],
              ['Último Login', formatDate(user?.ultimo_login)],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{l}</p>
                <p className="font-medium text-gray-900">{v}</p>
              </div>
            ))}
          </div>

          <form onSubmit={savePerfil} className="space-y-4">
            <div><label className="label">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="input" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'A guardar...' : 'Guardar alterações'}</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={savePassword} className="space-y-4">
            {[['Password Atual', 'atual'], ['Nova Password', 'nova'], ['Confirmar Nova Password', 'confirmar']].map(([l, f]) => (
              <div key={f}><label className="label">{l}</label>
                <input type="password" value={pwd[f]} onChange={e => setPwd(p => ({ ...p, [f]: e.target.value }))} className="input" required minLength={f !== 'atual' ? 8 : undefined} />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'A alterar...' : 'Alterar Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
