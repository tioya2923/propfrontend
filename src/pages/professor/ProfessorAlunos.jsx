import { useEffect, useState } from 'react';
import { Users, ChevronDown, ChevronUp, Plus, Trash2, Check } from 'lucide-react';
import { professorAPI } from '../../api';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

const PERIODOS = ['1º Semestre', '2º Semestre', 'Anual'];

export default function ProfessorAlunos() {
  const confirm = useConfirm();
  const [alunos, setAlunos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ seminarista_id: '', materia: '', periodo: PERIODOS[0], valor: '', observacao: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([professorAPI.getAlunos(), professorAPI.getNotas()])
      .then(([a, n]) => { setAlunos(a.data); setNotas(n.data); })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  function notasDoAluno(id) { return notas.filter(n => n.seminarista_id === id); }

  function openForm(alunoId) {
    setForm({ seminarista_id: alunoId, materia: '', periodo: PERIODOS[0], valor: '', observacao: '' });
    setExpanded(alunoId);
  }

  async function guardarNota(e) {
    e.preventDefault();
    if (!form.materia || form.valor === '') return toast.error('Preencha todos os campos');
    setSaving(true);
    try {
      const res = await professorAPI.upsertNota({ ...form, valor: parseFloat(form.valor) });
      setNotas(prev => {
        const idx = prev.findIndex(n => n.id === res.data.id);
        return idx >= 0 ? prev.map((n, i) => i === idx ? res.data : n) : [...prev, res.data];
      });
      setForm(f => ({ ...f, materia: '', valor: '', observacao: '' }));
      toast.success('Nota guardada');
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao guardar'); }
    finally { setSaving(false); }
  }

  async function apagar(id) {
    if (!(await confirm('Eliminar esta nota?'))) return;
    try {
      await professorAPI.deleteNota(id);
      setNotas(prev => prev.filter(n => n.id !== id));
      toast.success('Nota eliminada');
    } catch { toast.error('Erro ao eliminar'); }
  }

  const byAno = alunos.reduce((acc, a) => {
    const k = `Ano ${a.ano_formacao}`;
    (acc[k] = acc[k] || []).push(a);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Alunos e Notas</h1>
      </div>

      {Object.keys(byAno).length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Nenhum aluno encontrado</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byAno).map(([ano, lista]) => (
            <div key={ano}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{ano}</h2>
              <div className="space-y-2">
                {lista.map(aluno => {
                  const aN = notasDoAluno(aluno.id);
                  const isOpen = expanded === aluno.id;
                  return (
                    <div key={aluno.id} className="card">
                      <button className="w-full flex items-center justify-between" onClick={() => setExpanded(isOpen ? null : aluno.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                            {aluno.nome[0]}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{aluno.nome}</p>
                            <p className="text-xs text-gray-400">{aluno.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{aN.length} nota{aN.length !== 1 ? 's' : ''}</span>
                          {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-4 border-t pt-4">
                          {aN.length > 0 && (
                            <table className="w-full text-sm mb-4">
                              <thead><tr className="text-gray-500 text-xs uppercase"><th className="text-left pb-1">Matéria</th><th className="text-left pb-1">Período</th><th className="text-left pb-1">Valor</th><th /></tr></thead>
                              <tbody>
                                {aN.map(n => (
                                  <tr key={n.id} className="border-t">
                                    <td className="py-1.5">{n.materia}</td>
                                    <td className="py-1.5 text-gray-500">{n.periodo}</td>
                                    <td className="py-1.5 font-bold text-primary-700">{n.valor} / 20</td>
                                    <td className="py-1.5 text-right">
                                      <button onClick={() => apagar(n.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          <form onSubmit={guardarNota} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <input className="input col-span-2 sm:col-span-1" placeholder="Matéria" value={form.seminarista_id === aluno.id ? form.materia : ''}
                              onChange={e => { if (form.seminarista_id !== aluno.id) openForm(aluno.id); setForm(f => ({ ...f, materia: e.target.value })); }} required />
                            <select className="input" value={form.seminarista_id === aluno.id ? form.periodo : PERIODOS[0]}
                              onChange={e => { if (form.seminarista_id !== aluno.id) openForm(aluno.id); setForm(f => ({ ...f, periodo: e.target.value })); }}>
                              {PERIODOS.map(p => <option key={p}>{p}</option>)}
                            </select>
                            <input className="input" type="number" min="0" max="20" step="0.1" placeholder="Nota (0-20)"
                              value={form.seminarista_id === aluno.id ? form.valor : ''}
                              onChange={e => { if (form.seminarista_id !== aluno.id) openForm(aluno.id); setForm(f => ({ ...f, valor: e.target.value })); }} required />
                            <button type="submit" onClick={() => { if (form.seminarista_id !== aluno.id) openForm(aluno.id); }}
                              disabled={saving} className="btn-primary flex items-center justify-center gap-1 text-sm">
                              <Plus size={14} /> Guardar
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
