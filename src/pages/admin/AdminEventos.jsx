import { useState, useRef } from 'react';
import { adminAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import { Plus, Edit2, Trash2, X, ImagePlus } from 'lucide-react';
import { formatDate, resolveAssetUrl } from '../../utils/format';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

const TIPOS = ['liturgico', 'academico', 'formacao', 'comunitario', 'outro'];
const EMPTY = { titulo: '', descricao: '', data_inicio: '', data_fim: '', local: '', imagem_url: '', tipo: 'outro', publico: true };

function ImageUpload({ value, onChange }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await adminAPI.uploadImagem(file);
      onChange(resolveAssetUrl(r.data.url));
      toast.success('Imagem carregada');
    } catch { toast.error('Erro ao carregar imagem'); }
    finally { setUploading(false); ref.current.value = ''; }
  }

  return (
    <div>
      <label className="label">Fotografia (opcional)</label>
      {value && (
        <div className="relative mb-2 inline-block">
          <img src={value} alt="preview" className="h-32 rounded-lg object-cover border border-gray-200"
            onError={e => { e.target.style.display = 'none'; }} />
          <button type="button" onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            <X size={10} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => ref.current.click()} disabled={uploading}
          className="btn-secondary text-sm flex items-center gap-2 py-2">
          <ImagePlus size={15} /> {uploading ? 'A carregar...' : 'Escolher imagem'}
        </button>
        {!value && <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="ou cole um URL de imagem" className="input flex-1 text-sm" />}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function AdminEventos() {
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, loading, reload } = useApi(() => adminAPI.listEventos({ page }), [page]);

  function abrirCriar() { setForm(EMPTY); setModal({ mode: 'create' }); }
  function abrirEditar(ev) {
    setForm({
      titulo: ev.titulo, descricao: ev.descricao || '', local: ev.local || '',
      data_inicio: ev.data_inicio ? ev.data_inicio.slice(0, 16) : '',
      data_fim: ev.data_fim ? ev.data_fim.slice(0, 16) : '',
      imagem_url: ev.imagem_url || '',
      tipo: ev.tipo, publico: ev.publico,
    });
    setModal({ mode: 'edit', id: ev.id });
  }

  function set(f) { return e => setForm(d => ({ ...d, [f]: typeof e === 'string' ? e : e.target.value })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, publico: form.publico === true || form.publico === 'true' };
      if (modal.mode === 'create') await adminAPI.createEvento(payload);
      else await adminAPI.updateEvento(modal.id, payload);
      toast.success(modal.mode === 'create' ? 'Evento criado' : 'Evento actualizado');
      setModal(null);
      reload();
    } catch (err) { toast.error(err.response?.data?.erro || 'Erro ao guardar'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!(await confirm('Eliminar este evento?'))) return;
    try { await adminAPI.deleteEvento(id); toast.success('Evento eliminado'); reload(); }
    catch { toast.error('Erro ao eliminar'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Eventos e Calendário</h1>
        <button onClick={abrirCriar} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} />Novo Evento</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Título', 'Tipo', 'Data início', 'Local', 'Visível', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.eventos?.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {ev.imagem_url && <img src={ev.imagem_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
                      <span className="font-medium text-gray-900">{ev.titulo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{ev.tipo}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(ev.data_inicio)}</td>
                  <td className="px-4 py-3 text-gray-500">{ev.local || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${ev.publico ? 'bg-wine-100 text-wine-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ev.publico ? 'Público' : 'Interno'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => abrirEditar(ev)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(ev.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.eventos?.length && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Nenhum evento</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Anterior</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page} / {Math.ceil(data.total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Seguinte</button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-semibold text-lg">{modal.mode === 'create' ? 'Novo Evento' : 'Editar Evento'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div><label className="label">Título *</label><input value={form.titulo} onChange={set('titulo')} className="input" required /></div>
              <div><label className="label">Descrição</label><textarea value={form.descricao} onChange={set('descricao')} rows={3} className="input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Data/Hora de Início *</label><input type="datetime-local" value={form.data_inicio} onChange={set('data_inicio')} className="input" required /></div>
                <div><label className="label">Data/Hora de Fim</label><input type="datetime-local" value={form.data_fim} onChange={set('data_fim')} className="input" /></div>
              </div>
              <div><label className="label">Local</label><input value={form.local} onChange={set('local')} className="input" placeholder="Ex: Sala T10, Capela, etc." /></div>
              <ImageUpload value={form.imagem_url} onChange={v => setForm(f => ({ ...f, imagem_url: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Tipo</label>
                  <select value={form.tipo} onChange={set('tipo')} className="input">
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label">Visibilidade</label>
                  <select value={String(form.publico)} onChange={e => setForm(f => ({ ...f, publico: e.target.value === 'true' }))} className="input">
                    <option value="true">Público (visível no site)</option>
                    <option value="false">Interno (só intranet)</option>
                  </select>
                </div>
              </div>
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
