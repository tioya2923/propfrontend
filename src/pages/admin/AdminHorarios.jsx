import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { Plus, Edit2, Trash2, X, Clock } from 'lucide-react';
import { DIAS_SEMANA, ANOS_FORMACAO } from '../../utils/format';
import toast from 'react-hot-toast';

const DIA_ORDER = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const EMPTY = { ano_formacao: 1, dia_semana: 'segunda', hora_inicio: '', hora_fim: '', disciplina: '', professor: '', professor_id: '', sala: '' };

export default function AdminHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoAtivo, setAnoAtivo] = useState(1);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', id? }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [hRes, sRes] = await Promise.all([
        adminAPI.listHorarios(),
        adminAPI.listSeminaristas({ limit: 500 }),
      ]);
      setHorarios(hRes.data);
      setProfessores((sRes.data.seminaristas || []).filter(u => u.cargo === 'professor'));
    } catch {
      toast.error('Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function abrirCriar() {
    setForm({ ...EMPTY, ano_formacao: anoAtivo });
    setModal({ mode: 'create' });
  }

  function abrirEditar(h) {
    setForm({
      ano_formacao: h.ano_formacao,
      dia_semana: h.dia_semana,
      hora_inicio: (h.hora_inicio || '').slice(0, 5),
      hora_fim: (h.hora_fim || '').slice(0, 5),
      disciplina: h.disciplina,
      professor: h.professor || '',
      professor_id: h.professor_id || '',
      sala: h.sala || '',
    });
    setModal({ mode: 'edit', id: h.id });
  }

  function set(f) { return e => setForm(d => ({ ...d, [f]: e.target.value })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, professor_id: form.professor_id || null };
      if (modal.mode === 'create') await adminAPI.createHorario(payload);
      else await adminAPI.updateHorario(modal.id, payload);
      toast.success(modal.mode === 'create' ? 'Horário criado' : 'Horário actualizado');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar este horário?')) return;
    try {
      await adminAPI.deleteHorario(id);
      toast.success('Horário eliminado');
      load();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao eliminar');
    }
  }

  const doAno = horarios.filter(h => h.ano_formacao === anoAtivo);
  const porDia = DIA_ORDER.reduce((acc, d) => {
    const items = doAno.filter(h => h.dia_semana === d).sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
    if (items.length) acc[d] = items;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock size={22} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Horários de Aulas</h1>
        </div>
        <button onClick={abrirCriar} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} />Nova Aula</button>
      </div>

      {/* Tabs de ano */}
      <div className="flex gap-1 mb-6">
        {ANOS_FORMACAO.map(ano => (
          <button key={ano} onClick={() => setAnoAtivo(ano)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${anoAtivo === ano ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {ano}º Ano
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : Object.keys(porDia).length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Nenhum horário definido para o {anoAtivo}º ano.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(porDia).map(([dia, aulas]) => (
            <div key={dia} className="card">
              <h2 className="font-semibold text-gray-900 mb-4">{DIAS_SEMANA[dia]}</h2>
              <div className="space-y-2">
                {aulas.map(a => (
                  <div key={a.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-mono text-gray-500 w-28 shrink-0">{a.hora_inicio?.slice(0, 5)} – {a.hora_fim?.slice(0, 5)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{a.disciplina}</p>
                      {a.professor && <p className="text-xs text-gray-500">{a.professor}</p>}
                    </div>
                    {a.sala && <span className="badge bg-blue-100 text-blue-700 text-xs shrink-0">{a.sala}</span>}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => abrirEditar(a)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-semibold text-lg">{modal.mode === 'create' ? 'Nova Aula' : 'Editar Aula'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ano de Formação</label>
                  <select value={form.ano_formacao} onChange={e => setForm(f => ({ ...f, ano_formacao: parseInt(e.target.value) }))} className="input">
                    {ANOS_FORMACAO.map(n => <option key={n} value={n}>{n}º Ano</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Dia da Semana</label>
                  <select value={form.dia_semana} onChange={set('dia_semana')} className="input">
                    {DIA_ORDER.map(d => <option key={d} value={d}>{DIAS_SEMANA[d]}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Hora de Início *</label><input type="time" value={form.hora_inicio} onChange={set('hora_inicio')} className="input" required /></div>
                <div><label className="label">Hora de Fim *</label><input type="time" value={form.hora_fim} onChange={set('hora_fim')} className="input" required /></div>
              </div>
              <div><label className="label">Disciplina *</label><input type="text" value={form.disciplina} onChange={set('disciplina')} className="input" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Professor (ligado à conta)</label>
                  <select value={form.professor_id} onChange={e => {
                    const id = e.target.value;
                    const prof = professores.find(p => p.id === id);
                    setForm(f => ({ ...f, professor_id: id, professor: prof ? prof.nome : f.professor }));
                  }} className="input">
                    <option value="">— Nenhum —</option>
                    {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div><label className="label">Nome do Professor (texto)</label><input type="text" value={form.professor} onChange={set('professor')} className="input" placeholder="Ex: Pe. João Mendes" /></div>
              </div>
              <div><label className="label">Sala</label><input type="text" value={form.sala} onChange={set('sala')} className="input" placeholder="Ex: Sala A1" /></div>
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
