import { useState, useMemo } from 'react';
import { adminAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { CARGO_LABEL, TIPOS_UTILIZADOR } from '../../utils/format';
import toast from 'react-hot-toast';

// ── Configuração dos grupos ────────────────────────────────────────────────────
const GRUPOS = [
  { cargo: 'seminarista',   label: 'Seminaristas',         icon: '📖', cor: 'blue'   },
  { cargo: 'professor',     label: 'Professores',           icon: '🎓', cor: 'wine'   },
  { cargo: 'funcionario',   label: 'Funcionários',          icon: '🏢', cor: 'gray'   },
  { cargo: 'direccao',      label: 'Membros da Direcção',  icon: '⭐', cor: 'purple' },
  { cargo: 'administrador', label: 'Administradores',       icon: '🛡️', cor: 'red'    },
];

const COR_CLASSES = {
  blue:   { tab: 'border-blue-500 text-blue-700 bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  wine:   { tab: 'border-wine-500 text-wine-700 bg-wine-50',   badge: 'bg-wine-100 text-wine-700',   dot: 'bg-wine-500'   },
  gray:   { tab: 'border-gray-400 text-gray-700 bg-gray-50',   badge: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400'   },
  purple: { tab: 'border-purple-500 text-purple-700 bg-purple-50', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  red:    { tab: 'border-red-500 text-red-700 bg-red-50',      badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500'    },
};

// Anos de formação do propedêutico
const ANOS_FORMACAO = [1, 2, 3];

// Normaliza o cargo de um utilizador (para lidar com registos antigos sem cargo)
function cargoEfetivo(u) {
  if (u.cargo && CARGO_LABEL[u.cargo]) return u.cargo;
  if (u.permissoes === 'seminarista') return 'seminarista';
  if (u.permissoes === 'staff') return 'funcionario';
  if (u.permissoes === 'admin') return 'administrador';
  return 'funcionario';
}

const EMPTY_FORM = { nome: '', email: '', password: '', ano_formacao: 1, cargo: '' };

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminSeminaristas() {
  const { isSuperAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [grupoAtivo, setGrupoAtivo] = useState('seminarista');

  // Modal criar
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  const [createSaving, setCreateSaving] = useState(false);

  // Modal editar
  const [editModal, setEditModal] = useState(null); // { user }
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Confirm delete
  const [deleteConfirm, setDeleteConfirm] = useState(null); // user id

  const { data, loading, reload } = useApi(
    () => adminAPI.listSeminaristas({ limit: 500 }),
    [],
  );

  // Agrupa e filtra localmente
  const grupos = useMemo(() => {
    const todos = data?.seminaristas || [];
    const filtrado = todos.filter(u => {
      if (search && !u.nome.toLowerCase().includes(search.toLowerCase()) &&
          !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const mapa = {};
    GRUPOS.forEach(g => { mapa[g.cargo] = []; });
    filtrado.forEach(u => {
      const c = cargoEfetivo(u);
      if (mapa[c]) mapa[c].push(u);
    });
    return mapa;
  }, [data, search]);

  const grupoInfo = GRUPOS.find(g => g.cargo === grupoAtivo);
  const utilizadoresGrupo = grupos[grupoAtivo] || [];

  // ── Create ────────────────────────────────────────────────────────────────
  function setCf(f) { return e => setCreateForm(p => ({ ...p, [f]: e.target.value })); }

  function abrirCriar(cargo) {
    setCreateForm({ ...EMPTY_FORM, cargo: cargo || grupoAtivo });
    setShowCreate(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.cargo) return toast.error('Seleccione o tipo');
    setCreateSaving(true);
    try {
      await adminAPI.createSeminarista(createForm);
      toast.success('Utilizador criado');
      setShowCreate(false);
      reload();
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao criar'); }
    finally { setCreateSaving(false); }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  function abrirEditar(u) {
    setEditForm({
      nome: u.nome, email: u.email, password: '',
      cargo: cargoEfetivo(u),
      ano_formacao: u.ano_formacao || 1,
      ativo: u.ativo,
    });
    setEditModal({ user: u });
  }

  function setEf(f) { return e => setEditForm(p => ({ ...p, [f]: e.target.value })); }

  async function handleEdit(e) {
    e.preventDefault();
    setEditSaving(true);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      await adminAPI.updateSeminarista(editModal.user.id, payload);
      toast.success('Utilizador actualizado');
      setEditModal(null);
      reload();
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao actualizar'); }
    finally { setEditSaving(false); }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await adminAPI.deleteSeminarista(id);
      toast.success('Utilizador eliminado');
      setDeleteConfirm(null);
      reload();
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao eliminar'); }
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros e Seminaristas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Seminário Propedêutico São João Evangelista</p>
        </div>
        <button onClick={() => abrirCriar()} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Pesquisar nome ou email…" value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {GRUPOS.map(g => {
              const count = grupos[g.cargo]?.length || 0;
              const cor = COR_CLASSES[g.cor];
              const ativo = grupoAtivo === g.cargo;
              return (
                <button key={g.cargo} onClick={() => setGrupoAtivo(g.cargo)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium whitespace-nowrap transition-all
                    ${ativo ? `${cor.tab} border-current` : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}>
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                  <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${ativo ? cor.badge : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tabela do grupo activo */}
          <div className="card overflow-hidden p-0">
            <div className={`px-5 py-3 flex items-center justify-between border-b border-gray-100`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{grupoInfo?.icon}</span>
                <h2 className="font-semibold text-gray-800">{grupoInfo?.label}</h2>
                <span className={`badge text-xs ${COR_CLASSES[grupoInfo?.cor || 'gray'].badge}`}>
                  {utilizadoresGrupo.length}
                </span>
              </div>
              <button onClick={() => abrirCriar(grupoAtivo)}
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                <Plus size={13} /> Adicionar {grupoInfo?.label.slice(0, -1)}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    {grupoAtivo === 'seminarista' && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ano</th>}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {utilizadoresGrupo.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${COR_CLASSES[grupoInfo?.cor || 'gray'].badge}`}>
                            {u.nome?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      {grupoAtivo === 'seminarista' && (
                        <td className="px-4 py-3 text-gray-500">{u.ano_formacao ? `${u.ano_formacao}º Ano` : '—'}</td>
                      )}
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${u.ativo ? 'bg-wine-100 text-wine-700' : 'bg-red-100 text-red-600'}`}>
                          {u.ativo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => abrirEditar(u)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar">
                            <Edit2 size={15} />
                          </button>
                          {deleteConfirm === u.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(u.id)}
                                className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                title="Confirmar eliminação">
                                <Check size={15} />
                              </button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={15} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(u.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {utilizadoresGrupo.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <div className="text-3xl mb-2">{grupoInfo?.icon}</div>
                        Nenhum {grupoInfo?.label.toLowerCase().slice(0, -1)} registado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Criar ─────────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Adicionar Membro</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {/* Tipo */}
              <div>
                <label className="label mb-2">Tipo *</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {TIPOS_UTILIZADOR.map(t => (
                    <button key={t.cargo} type="button" onClick={() => setCreateForm(p => ({ ...p, cargo: t.cargo, ano_formacao: 1 }))}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all
                        ${createForm.cargo === t.cargo
                          ? 'border-primary-600 bg-primary-50 text-primary-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                      <span className="text-lg">{t.icon}</span>
                      <span className="font-medium text-sm">{t.label}</span>
                      {createForm.cargo === t.cargo && (
                        <span className="ml-auto w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div><label className="label">Nome completo *</label><input type="text" onChange={setCf('nome')} className="input" required /></div>
              <div><label className="label">Email *</label><input type="email" onChange={setCf('email')} className="input" required /></div>
              <div>
                <label className="label">Password *</label>
                <input type="password" onChange={setCf('password')} className="input" required minLength={8} />
                <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
              </div>

              {createForm.cargo === 'seminarista' && (
                <div>
                  <label className="label">Ano de Formação</label>
                  <select value={createForm.ano_formacao} onChange={setCf('ano_formacao')} className="input">
                    {ANOS_FORMACAO.map(n => <option key={n} value={n}>{n}º Ano</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={createSaving || !createForm.cargo} className="btn-primary flex-1">
                  {createSaving ? 'A criar…' : `Criar ${TIPOS_UTILIZADOR.find(t => t.cargo === createForm.cargo)?.label || ''}`}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Editar ─────────────────────────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="font-semibold text-lg">Editar Utilizador</h2>
                <p className="text-sm text-gray-500">{editModal.user.nome}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              {/* Tipo */}
              <div>
                <label className="label mb-2">Tipo</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {TIPOS_UTILIZADOR.map(t => (
                    <button key={t.cargo} type="button" onClick={() => setEditForm(p => ({ ...p, cargo: t.cargo }))}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all
                        ${editForm.cargo === t.cargo
                          ? 'border-primary-600 bg-primary-50 text-primary-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                      <span className="text-lg">{t.icon}</span>
                      <span className="font-medium text-sm">{t.label}</span>
                      {editForm.cargo === t.cargo && (
                        <span className="ml-auto w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div><label className="label">Nome *</label><input type="text" value={editForm.nome} onChange={setEf('nome')} className="input" required /></div>
              <div><label className="label">Email *</label><input type="email" value={editForm.email} onChange={setEf('email')} className="input" required /></div>
              <div>
                <label className="label">Nova Password</label>
                <input type="password" value={editForm.password} onChange={setEf('password')} className="input" minLength={8} placeholder="Deixe em branco para não alterar" />
              </div>

              {editForm.cargo === 'seminarista' && (
                <div>
                  <label className="label">Ano de Formação</label>
                  <select value={editForm.ano_formacao} onChange={setEf('ano_formacao')} className="input">
                    {ANOS_FORMACAO.map(n => <option key={n} value={n}>{n}º Ano</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Estado</label>
                <select value={editForm.ativo ?? true} onChange={e => setEditForm(p => ({ ...p, ativo: e.target.value === 'true' }))} className="input">
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={editSaving} className="btn-primary flex-1">
                  {editSaving ? 'A guardar…' : 'Guardar alterações'}
                </button>
                <button type="button" onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
