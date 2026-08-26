import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { professorAPI } from '../../api';
import toast from 'react-hot-toast';

const EMPTY = { titulo: '', descricao: '', data_entrega: '', ano_formacao: '', materia: '', publicado: false };

export default function ProfessorTrabalhos() {
  const [trabalhos, setTrabalhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [entregas, setEntregas] = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try { const r = await professorAPI.getTrabalhos(); setTrabalhos(r.data); }
    catch { toast.error('Erro ao carregar trabalhos'); }
    finally { setLoading(false); }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, ano_formacao: form.ano_formacao ? parseInt(form.ano_formacao) : null };
      const r = await professorAPI.createTrabalho(payload);
      setTrabalhos(prev => [r.data, ...prev]);
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Trabalho criado');
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao criar'); }
    finally { setSaving(false); }
  }

  async function togglePublicado(t) {
    try {
      const r = await professorAPI.updateTrabalho(t.id, { ...t, publicado: !t.publicado });
      setTrabalhos(prev => prev.map(x => x.id === t.id ? r.data : x));
    } catch { toast.error('Erro ao atualizar'); }
  }

  async function apagar(id) {
    if (!confirm('Eliminar este trabalho?')) return;
    try { await professorAPI.deleteTrabalho(id); setTrabalhos(prev => prev.filter(t => t.id !== id)); toast.success('Eliminado'); }
    catch { toast.error('Erro ao eliminar'); }
  }

  async function verEntregas(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!entregas[id]) {
      try {
        const r = await professorAPI.getEntregas(id);
        setEntregas(prev => ({ ...prev, [id]: r.data }));
      } catch { toast.error('Erro ao carregar entregas'); }
    }
  }

  async function avaliar(trabalhoId, seminarista_id, nota_valor, comentario) {
    try {
      const r = await professorAPI.avaliarEntrega(trabalhoId, { seminarista_id, nota_valor: parseFloat(nota_valor), comentario });
      setEntregas(prev => ({
        ...prev,
        [trabalhoId]: (prev[trabalhoId] || []).map(e => e.seminarista_id === seminarista_id ? r.data : e),
      }));
      toast.success('Avaliado');
    } catch { toast.error('Erro ao avaliar'); }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Trabalhos</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Trabalho
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Novo Trabalho</h2>
          <form onSubmit={submit} className="space-y-3">
            <input className="input" placeholder="Título *" value={form.titulo} onChange={e => set('titulo', e.target.value)} required />
            <textarea className="input min-h-[80px]" placeholder="Descrição" value={form.descricao} onChange={e => set('descricao', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Data de Entrega</label>
                <input type="date" className="input" value={form.data_entrega} onChange={e => set('data_entrega', e.target.value)} />
              </div>
              <div>
                <label className="label">Ano de Formação</label>
                <input type="number" className="input" placeholder="Todos" min="1" max="3" value={form.ano_formacao} onChange={e => set('ano_formacao', e.target.value)} />
              </div>
            </div>
            <input className="input" placeholder="Matéria" value={form.materia} onChange={e => set('materia', e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.publicado} onChange={e => set('publicado', e.target.checked)} className="w-4 h-4" />
              Publicar imediatamente
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'A guardar...' : 'Criar'}</button>
            </div>
          </form>
        </div>
      )}

      {trabalhos.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Nenhum trabalho criado</div>
      ) : (
        <div className="space-y-3">
          {trabalhos.map(t => {
            const isOpen = expanded === t.id;
            const ents = entregas[t.id] || [];
            const entregues = ents.filter(e => e.estado !== 'pendente').length;
            return (
              <div key={t.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{t.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.publicado ? 'bg-wine-100 text-wine-700' : 'bg-gray-100 text-gray-500'}`}>
                        {t.publicado ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    {t.materia && <p className="text-xs text-gray-500 mt-0.5">{t.materia}{t.ano_formacao ? ` · Ano ${t.ano_formacao}` : ''}</p>}
                    {t.data_entrega && <p className="text-xs text-gray-400 mt-0.5">Entrega: {new Date(t.data_entrega).toLocaleDateString('pt-PT')}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePublicado(t)} title={t.publicado ? 'Despublicar' : 'Publicar'}
                      className={`p-1.5 rounded text-xs ${t.publicado ? 'text-wine-600 hover:bg-wine-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => apagar(t.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                    <button onClick={() => verEntregas(t.id)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100 flex items-center gap-1 text-xs">
                      Entregas {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t pt-4">
                    {ents.length === 0 ? (
                      <p className="text-sm text-gray-400">Nenhuma entrega ainda</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase font-semibold">{entregues}/{ents.length} entregues</p>
                        {ents.map(e => (
                          <EntregaRow key={e.id} entrega={e} trabalhoId={t.id} onAvaliar={avaliar} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EntregaRow({ entrega: e, trabalhoId, onAvaliar }) {
  const [nota, setNota] = useState(e.nota_valor ?? '');
  const [comentario, setComentario] = useState(e.comentario ?? '');

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-sm text-gray-900">{e.seminarista?.nome}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          e.estado === 'avaliado' ? 'bg-blue-100 text-blue-700' :
          e.estado === 'entregue' ? 'bg-wine-100 text-wine-700' :
          'bg-gray-100 text-gray-400'}`}>
          {e.estado}
        </span>
      </div>
      {e.ficheiro_url && <a href={e.ficheiro_url} className="text-xs text-primary-600 hover:underline" target="_blank" rel="noreferrer">Ver ficheiro</a>}
      {e.texto && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{e.texto}</p>}
      <div className="flex gap-2 mt-2">
        <input type="number" min="0" max="20" step="0.1" className="input text-sm w-24" placeholder="Nota" value={nota} onChange={ev => setNota(ev.target.value)} />
        <input className="input text-sm flex-1" placeholder="Comentário" value={comentario} onChange={ev => setComentario(ev.target.value)} />
        <button onClick={() => onAvaliar(trabalhoId, e.seminarista_id, nota, comentario)} className="btn-primary text-xs px-3">Avaliar</button>
      </div>
    </div>
  );
}
