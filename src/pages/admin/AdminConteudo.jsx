import { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Upload, X, Lock, Edit2, Check } from 'lucide-react';

// ── Upload / URL de imagem ─────────────────────────────────────────────────────
function ImagemUpload({ label, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ficheiro demasiado grande. Máximo: 50 MB');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const r = await adminAPI.uploadImagem(file);
      onChange(r.data.url);
      toast.success('Imagem carregada');
    } catch {
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="input flex-1 text-sm"
          placeholder="Cole um URL ou use o botão Upload"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-sm py-1.5 px-3 shrink-0 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Upload size={14} />
          {uploading ? 'A carregar…' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-gray-400 hover:text-red-500 shrink-0" title="Remover imagem">
            <X size={16} />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="h-28 w-auto max-w-xs object-cover rounded border border-gray-200"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
}

// ── Campo simples ──────────────────────────────────────────────────────────────
function Campo({ label, value, onChange, multiline, hint, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} className="input font-mono text-sm" placeholder={placeholder} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className="input" placeholder={placeholder} />}
    </div>
  );
}

// ── Lista de strings ───────────────────────────────────────────────────────────
function ListaEditor({ label, items, onChange, placeholder }) {
  function update(i, val) { const n = [...items]; n[i] = val; onChange(n); }
  function add() { onChange([...items, '']); }
  function remove(i) { onChange(items.filter((_, j) => j !== i)); }
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={item} onChange={e => update(i, e.target.value)} className="input flex-1 text-sm" placeholder={placeholder} />
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700 shrink-0"><Trash2 size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
          <Plus size={14} /> Adicionar item
        </button>
      </div>
    </div>
  );
}

// ── Lista de objectos ──────────────────────────────────────────────────────────
function ListaObjEditor({ label, items, campos, onChange }) {
  function update(i, key, val) { const n = [...items]; n[i] = { ...n[i], [key]: val }; onChange(n); }
  function add() { onChange([...items, Object.fromEntries(campos.map(c => [c.key, '']))]); }
  function remove(i) { onChange(items.filter((_, j) => j !== i)); }
  function move(i, dir) {
    const n = [...items];
    const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  }
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={15} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={15} /></button>
                <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
              </div>
            </div>
            {campos.map(c => (
              <div key={c.key} className="mb-2">
                <label className="text-xs text-gray-500 mb-0.5 block">{c.label}</label>
                {c.type === 'image'
                  ? <ImagemUpload value={item[c.key] || ''} onChange={val => update(i, c.key, val)} />
                  : c.multiline
                    ? <textarea value={item[c.key] || ''} onChange={e => update(i, c.key, e.target.value)} rows={2} className="input text-sm w-full" />
                    : <input type="text" value={item[c.key] || ''} onChange={e => update(i, c.key, e.target.value)} className="input text-sm w-full" placeholder={c.placeholder} />}
              </div>
            ))}
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
          <Plus size={14} /> Adicionar
        </button>
      </div>
    </div>
  );
}

// ── Editor de currículo por anos ───────────────────────────────────────────────
function CurriculoEditor({ label, items, onChange }) {
  function updateAno(i, key, val) {
    const n = [...items]; n[i] = { ...n[i], [key]: val }; onChange(n);
  }
  function updateDisciplinas(i, list) { updateAno(i, 'disciplinas', list); }
  function addAno() { onChange([...items, { ano: '', disciplinas: [] }]); }
  function removeAno(i) { onChange(items.filter((_, j) => j !== i)); }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={item.ano || ''}
                onChange={e => updateAno(i, 'ano', e.target.value)}
                className="input text-sm font-semibold w-40"
                placeholder="Ex: 1.º Ano"
              />
              <button type="button" onClick={() => removeAno(i)} className="text-red-500 hover:text-red-700 ml-auto">
                <Trash2 size={15} />
              </button>
            </div>
            <ListaEditor
              items={Array.isArray(item.disciplinas) ? item.disciplinas : []}
              onChange={list => updateDisciplinas(i, list)}
              placeholder="Nome da disciplina"
            />
          </div>
        ))}
        <button type="button" onClick={addAno} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
          <Plus size={14} /> Adicionar Ano
        </button>
      </div>
    </div>
  );
}

// ── Secção Equipa ──────────────────────────────────────────────────────────────
const EMPTY_MEMBRO = { nome: '', cargo: '', area: '', ordem: 0, ativo: true };

function SecçãoEquipa() {
  const [membros, setMembros] = useState([]);
  const [editId, setEditId] = useState(null); // null = a criar; string = a editar esse id
  const [form, setForm] = useState({ ...EMPTY_MEMBRO });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const r = await adminAPI.getEquipa(); setMembros(r.data); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function abrirEditar(m) {
    setEditId(m.id);
    setForm({ nome: m.nome, cargo: m.cargo, area: m.area || '', ordem: m.ordem ?? 0, ativo: m.ativo });
  }

  function cancelarEdicao() {
    setEditId(null);
    setForm({ ...EMPTY_MEMBRO });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await adminAPI.updateMembro(editId, form);
        toast.success('Membro actualizado');
      } else {
        await adminAPI.createMembro(form);
        toast.success('Membro adicionado');
      }
      cancelarEdicao();
      load();
    } catch {
      toast.error(editId ? 'Erro ao actualizar membro' : 'Erro ao adicionar membro');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar membro?')) return;
    try {
      await adminAPI.deleteMembro(id);
      toast.success('Eliminado');
      if (editId === id) cancelarEdicao();
      load();
    } catch { toast.error('Erro ao eliminar'); }
  }

  const lista = [...membros].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-primary-700 mb-3">Direcção</h3>
        {loading ? (
          <p className="text-sm text-gray-400">A carregar...</p>
        ) : (
          <div className="space-y-2">
            {lista.map(m => (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg border ${editId === m.id ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                  <p className="font-medium text-sm text-gray-900 flex items-center gap-2">
                    {m.nome}
                    {!m.ativo && <span className="badge bg-gray-200 text-gray-500 text-xs">Inactivo</span>}
                  </p>
                  <p className="text-xs text-gray-500">{m.cargo}{m.area ? ` · ${m.area}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => abrirEditar(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {!lista.length && <p className="text-sm text-gray-400 text-center py-4">Nenhum membro</p>}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="card border-dashed">
        <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Editar Membro da Direcção' : 'Adicionar Membro da Direcção'}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Nome *</label><input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="input" /></div>
          <div><label className="label">Cargo *</label><input required value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} className="input" /></div>
          <div><label className="label">Área</label><input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className="input" placeholder="Ex: Direcção, Espiritual" /></div>
          <div><label className="label">Ordem de exibição</label><input type="number" value={form.ordem} onChange={e => setForm(f => ({ ...f, ordem: parseInt(e.target.value) || 0 }))} className="input" /></div>
          {editId && (
            <div>
              <label className="label">Estado</label>
              <select value={form.ativo ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, ativo: e.target.value === 'true' }))} className="input">
                <option value="true">Activo (visível no site)</option>
                <option value="false">Inactivo (oculto do site)</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {editId ? <Check size={16} /> : <Plus size={16} />}
            {saving ? 'A guardar…' : (editId ? 'Guardar alterações' : 'Adicionar')}
          </button>
          {editId && <button type="button" onClick={cancelarEdicao} className="btn-secondary">Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'homepage', label: 'Página Inicial' },
  { id: 'contactos', label: 'Contactos' },
  { id: 'ajudar', label: 'Como Ajudar' },
  { id: 'seminario', label: 'Seminário' },
  { id: 'vocacao', label: 'Deus Chama-me?' },
  { id: 'comunidade', label: 'Comunidade' },
  { id: 'formacao', label: 'Formação' },
  { id: 'um_dia', label: 'Um Dia' },
  { id: 'equipa', label: 'Equipa Formadora' },
  { id: 'privacidade', label: 'Política de Privacidade' },
  { id: 'termos', label: 'Termos de Uso' },
];

export default function AdminConteudo() {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('homepage');
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (pagina) => {
    if (pagina === 'equipa') return;
    try { const r = await adminAPI.getConteudo(pagina); setData(r.data); }
    catch { setData({}); }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  function set(chave) { return val => setData(d => ({ ...d, [chave]: val })); }

  async function save(campos) {
    setSaving(true);
    try {
      await adminAPI.saveConteudo(activeTab, campos);
      toast.success('Conteúdo guardado');
    } catch { toast.error('Erro ao guardar'); }
    finally { setSaving(false); }
  }

  function SaveBtn({ campos }) {
    return (
      <button onClick={() => save(campos)} disabled={saving} className="btn-primary flex items-center gap-2 mt-6">
        <Save size={16} />{saving ? 'A guardar...' : 'Guardar alterações'}
      </button>
    );
  }

  function SectionHeader({ children }) {
    return (
      <h3 className="font-semibold border-l-4 pl-3 mb-4 border-primary-500 text-primary-700">{children}</h3>
    );
  }

  function renderTab() {
    switch (activeTab) {

      // ── Página Inicial ────────────────────────────────────────────────────────
      case 'homepage':
        return (
          <div className="space-y-5 max-w-2xl">
            <p className="text-sm text-gray-500">Conteúdo textual e imagens da página inicial.</p>

            <SectionHeader>Hero — Texto</SectionHeader>
            <Campo
              label="Subtítulo (acima do título grande)"
              value={data.hero_subtitulo || ''}
              onChange={set('hero_subtitulo')}
              placeholder="Seminário Propedêutico"
            />
            <Campo
              label="Título grande"
              value={data.hero_titulo || ''}
              onChange={set('hero_titulo')}
              placeholder="DE São João Evangelista"
            />

            <SectionHeader>Hero — Imagens do Slider</SectionHeader>
            <ImagemUpload label="Imagem 1 do Slider" value={data.hero_imagem_1 || ''} onChange={set('hero_imagem_1')} />
            <ImagemUpload label="Imagem 2 do Slider" value={data.hero_imagem_2 || ''} onChange={set('hero_imagem_2')} />

            <SectionHeader>Citação</SectionHeader>
            <Campo
              label="Texto da citação"
              value={data.citacao || ''}
              onChange={set('citacao')}
              multiline
              hint="Frase exibida na secção abaixo do hero."
              placeholder="«Que o Senhor envie...»"
            />

            <SectionHeader>Banners das Secções</SectionHeader>
            <ImagemUpload label="Imagem — Comunidade" value={data.imagem_comunidade || ''} onChange={set('imagem_comunidade')} />
            <ImagemUpload label="Imagem — Formação" value={data.imagem_formacao || ''} onChange={set('imagem_formacao')} />
            <ImagemUpload label="Imagem — Como Ajudar" value={data.imagem_ajudar || ''} onChange={set('imagem_ajudar')} />
            <ImagemUpload label="Imagem — Mensagem do Reitor" value={data.imagem_reitor || ''} onChange={set('imagem_reitor')} />
            <ImagemUpload label="Imagem — Um Dia no Seminário" value={data.imagem_um_dia || ''} onChange={set('imagem_um_dia')} />

            <SaveBtn campos={[
              { chave: 'hero_subtitulo', valor: data.hero_subtitulo, tipo: 'text' },
              { chave: 'hero_titulo', valor: data.hero_titulo, tipo: 'text' },
              { chave: 'hero_imagem_1', valor: data.hero_imagem_1, tipo: 'text' },
              { chave: 'hero_imagem_2', valor: data.hero_imagem_2, tipo: 'text' },
              { chave: 'citacao', valor: data.citacao, tipo: 'text' },
              { chave: 'imagem_comunidade', valor: data.imagem_comunidade, tipo: 'text' },
              { chave: 'imagem_formacao', valor: data.imagem_formacao, tipo: 'text' },
              { chave: 'imagem_ajudar', valor: data.imagem_ajudar, tipo: 'text' },
              { chave: 'imagem_reitor', valor: data.imagem_reitor, tipo: 'text' },
              { chave: 'imagem_um_dia', valor: data.imagem_um_dia, tipo: 'text' },
            ]} />
          </div>
        );

      // ── Contactos ─────────────────────────────────────────────────────────────
      case 'contactos':
        if (!isSuperAdmin) {
          return (
            <div className="max-w-xl">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <Lock size={18} className="shrink-0" />
                <p className="text-sm">Esta secção é gerida exclusivamente pelo <strong>Administrador Geral</strong>.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-5 max-w-xl">
            <p className="text-sm text-gray-500">Informações de contacto exibidas no site e no rodapé.</p>

            <SectionHeader>Contacto Geral</SectionHeader>
            <Campo label="Telefone" value={data.telefone || ''} onChange={set('telefone')} />
            <Campo label="Email geral" value={data.email || ''} onChange={set('email')} />
            <Campo label="Horário de Secretaria" value={data.horario || ''} onChange={set('horario')} multiline hint="Ex: Seg–Sex: 08:00–16:00" />

            <SectionHeader>Morada</SectionHeader>
            <Campo
              label="Morada do Seminário"
              value={data.morada || ''}
              onChange={set('morada')}
              multiline
              hint="Endereço físico do Seminário Propedêutico São João Evangelista."
            />

            <SectionHeader>Redes Sociais</SectionHeader>
            <p className="text-xs text-gray-400 -mt-3">Deixe em branco para ocultar o respectivo ícone no rodapé do site.</p>
            <Campo label="Facebook" value={data.facebook_url || ''} onChange={set('facebook_url')} placeholder="https://facebook.com/..." />
            <Campo label="Instagram" value={data.instagram_url || ''} onChange={set('instagram_url')} placeholder="https://instagram.com/..." />
            <Campo label="Twitter / X" value={data.twitter_url || ''} onChange={set('twitter_url')} placeholder="https://x.com/..." />
            <Campo label="YouTube" value={data.youtube_url || ''} onChange={set('youtube_url')} placeholder="https://youtube.com/..." />

            <SectionHeader>Mapa</SectionHeader>
            <Campo
              label="URL de incorporação do Google Maps"
              value={data.mapa_embed_url || ''}
              onChange={set('mapa_embed_url')}
              hint='No Google Maps: Partilhar → Incorporar um mapa → copie apenas o valor do atributo src="..." do código fornecido.'
              placeholder="https://www.google.com/maps/embed?pb=..."
            />

            <SaveBtn campos={[
              { chave: 'telefone', valor: data.telefone, tipo: 'text' },
              { chave: 'email', valor: data.email, tipo: 'text' },
              { chave: 'horario', valor: data.horario, tipo: 'text' },
              { chave: 'morada', valor: data.morada, tipo: 'text' },
              { chave: 'facebook_url', valor: data.facebook_url, tipo: 'text' },
              { chave: 'instagram_url', valor: data.instagram_url, tipo: 'text' },
              { chave: 'twitter_url', valor: data.twitter_url, tipo: 'text' },
              { chave: 'youtube_url', valor: data.youtube_url, tipo: 'text' },
              { chave: 'mapa_embed_url', valor: data.mapa_embed_url, tipo: 'text' },
            ]} />
          </div>
        );

      // ── Como Ajudar ───────────────────────────────────────────────────────────
      case 'ajudar':
        return (
          <div className="space-y-4 max-w-2xl">
            <Campo label="Subtítulo do Cabeçalho" value={data.hero_subtitulo || ''} onChange={set('hero_subtitulo')} multiline />
            <Campo label="Descrição do Apadrinhamento" value={data.apadrinhamento_descricao || ''} onChange={set('apadrinhamento_descricao')} multiline />
            <ListaEditor label="Benefícios do Apadrinhamento" items={Array.isArray(data.apadrinhamento_beneficios) ? data.apadrinhamento_beneficios : []} onChange={set('apadrinhamento_beneficios')} />
            <Campo label="Email para Apadrinhamento" value={data.email_apadrinhamento || ''} onChange={set('email_apadrinhamento')} />
            <Campo label="Email para Pedidos de Oração" value={data.email_oracao || ''} onChange={set('email_oracao')} />
            <Campo label="Texto da Secção de Oração" value={data.oracao_texto || ''} onChange={set('oracao_texto')} multiline />
            <SaveBtn campos={[
              { chave: 'hero_subtitulo', valor: data.hero_subtitulo, tipo: 'text' },
              { chave: 'apadrinhamento_descricao', valor: data.apadrinhamento_descricao, tipo: 'text' },
              { chave: 'apadrinhamento_beneficios', valor: data.apadrinhamento_beneficios, tipo: 'json' },
              { chave: 'email_apadrinhamento', valor: data.email_apadrinhamento, tipo: 'text' },
              { chave: 'email_oracao', valor: data.email_oracao, tipo: 'text' },
              { chave: 'oracao_texto', valor: data.oracao_texto, tipo: 'text' },
            ]} />
          </div>
        );

      // ── Seminário ─────────────────────────────────────────────────────────────
      case 'seminario':
        return (
          <div className="space-y-10 max-w-3xl">

            {/* Banner */}
            <div>
              <SectionHeader>Imagem de Cabeçalho</SectionHeader>
              <ImagemUpload label="Fotografia do banner da página" value={data.hero_imagem || ''} onChange={set('hero_imagem')} hint="Imagem exibida no topo da página do Seminário." />
            </div>

            {/* Reitor */}
            <div>
              <SectionHeader>Mensagem do Reitor</SectionHeader>
              <div className="space-y-4">
                <ImagemUpload label="Fotografia do Reitor" value={data.reitor_foto || ''} onChange={set('reitor_foto')} />
                <Campo label="Nome do Reitor" value={data.reitor_nome || ''} onChange={set('reitor_nome')} />
                <Campo label="Cargo" value={data.reitor_cargo || ''} onChange={set('reitor_cargo')} />
                <Campo label="Citação (mensagem em destaque)" value={data.reitor_citacao || ''} onChange={set('reitor_citacao')} multiline />
                <Campo label="Texto descritivo" value={data.reitor_descricao || ''} onChange={set('reitor_descricao')} multiline />
              </div>
            </div>

            {/* Disciplinas */}
            <div>
              <SectionHeader>Disciplinas</SectionHeader>
              <ListaEditor
                items={Array.isArray(data.disciplinas) ? data.disciplinas : []}
                onChange={set('disciplinas')}
                placeholder="Nome da disciplina"
              />
            </div>

            {/* Estatísticas */}
            <div>
              <SectionHeader>Estatísticas</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.stats) ? data.stats : []}
                campos={[{ key: 'valor', label: 'Valor (ex: 14)' }, { key: 'desc', label: 'Descrição (ex: Seminaristas)' }]}
                onChange={set('stats')}
              />
            </div>

            {/* História */}
            <div>
              <SectionHeader>Linha do Tempo Histórica</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.historia) ? data.historia : []}
                campos={[
                  { key: 'ano', label: 'Ano (ex: 1954 ou Hoje)', placeholder: '1954' },
                  { key: 'titulo', label: 'Título do evento', placeholder: 'Fundação' },
                  { key: 'desc', label: 'Descrição', multiline: true },
                ]}
                onChange={set('historia')}
              />
            </div>

            {/* Infraestruturas */}
            <div>
              <SectionHeader>Infraestruturas</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.infraestruturas) ? data.infraestruturas : []}
                campos={[
                  { key: 'emoji', label: 'Ícone (emoji)', placeholder: '📚' },
                  { key: 'nome', label: 'Nome', placeholder: 'Biblioteca' },
                  { key: 'desc', label: 'Descrição', placeholder: '5.000+ volumes' },
                ]}
                onChange={set('infraestruturas')}
              />
            </div>

            <SaveBtn campos={[
              { chave: 'hero_imagem', valor: data.hero_imagem, tipo: 'text' },
              { chave: 'reitor_foto', valor: data.reitor_foto, tipo: 'text' },
              { chave: 'reitor_nome', valor: data.reitor_nome, tipo: 'text' },
              { chave: 'reitor_cargo', valor: data.reitor_cargo, tipo: 'text' },
              { chave: 'reitor_citacao', valor: data.reitor_citacao, tipo: 'text' },
              { chave: 'reitor_descricao', valor: data.reitor_descricao, tipo: 'text' },
              { chave: 'disciplinas', valor: data.disciplinas, tipo: 'json' },
              { chave: 'stats', valor: data.stats, tipo: 'json' },
              { chave: 'historia', valor: data.historia, tipo: 'json' },
              { chave: 'infraestruturas', valor: data.infraestruturas, tipo: 'json' },
            ]} />
          </div>
        );

      // ── Deus Chama-me? ────────────────────────────────────────────────────────
      case 'vocacao':
        return (
          <div className="space-y-6 max-w-2xl">
            <SectionHeader>Cabeçalho</SectionHeader>
            <ImagemUpload label="Imagem do cabeçalho" value={data.hero_imagem || ''} onChange={set('hero_imagem')} />
            <Campo label="Subtítulo do Cabeçalho" value={data.hero_subtitulo || ''} onChange={set('hero_subtitulo')} multiline />

            <SectionHeader>Testemunhos</SectionHeader>
            <ListaObjEditor
              items={Array.isArray(data.testemunhos) ? data.testemunhos : []}
              campos={[
                { key: 'foto_url', label: 'Fotografia', type: 'image' },
                { key: 'nome', label: 'Nome' },
                { key: 'ano', label: 'Ano (ex: Ordenado em 2022)' },
                { key: 'texto', label: 'Testemunho', multiline: true },
              ]}
              onChange={set('testemunhos')}
            />

            <SectionHeader>Perguntas Frequentes (FAQ)</SectionHeader>
            <ListaObjEditor
              items={Array.isArray(data.faqs) ? data.faqs : []}
              campos={[{ key: 'q', label: 'Pergunta' }, { key: 'a', label: 'Resposta', multiline: true }]}
              onChange={set('faqs')}
            />
            <SaveBtn campos={[
              { chave: 'hero_imagem', valor: data.hero_imagem, tipo: 'text' },
              { chave: 'hero_subtitulo', valor: data.hero_subtitulo, tipo: 'text' },
              { chave: 'testemunhos', valor: data.testemunhos, tipo: 'json' },
              { chave: 'faqs', valor: data.faqs, tipo: 'json' },
            ]} />
          </div>
        );

      // ── Comunidade ────────────────────────────────────────────────────────────
      case 'comunidade':
        return (
          <div className="space-y-6 max-w-2xl">
            <SectionHeader>Imagem</SectionHeader>
            <ImagemUpload label="Fotografia da Comunidade (banner)" value={data.hero_imagem || ''} onChange={set('hero_imagem')} hint="Imagem principal exibida no banner da página." />

            <SectionHeader>Vida Comunitária</SectionHeader>
            <ListaObjEditor
              items={Array.isArray(data.vida_comunitaria) ? data.vida_comunitaria : []}
              campos={[{ key: 'titulo', label: 'Título' }, { key: 'desc', label: 'Descrição', multiline: true }]}
              onChange={set('vida_comunitaria')}
            />

            <SectionHeader>Associações de Apoio</SectionHeader>
            <ListaEditor
              items={Array.isArray(data.associacoes) ? data.associacoes : []}
              onChange={set('associacoes')}
            />
            <SaveBtn campos={[
              { chave: 'hero_imagem', valor: data.hero_imagem, tipo: 'text' },
              { chave: 'vida_comunitaria', valor: data.vida_comunitaria, tipo: 'json' },
              { chave: 'associacoes', valor: data.associacoes, tipo: 'json' },
            ]} />
          </div>
        );

      // ── Formação ──────────────────────────────────────────────────────────────
      case 'formacao':
        return (
          <div className="space-y-10 max-w-3xl">
            <p className="text-sm text-gray-500">Gira o conteúdo da página de Formação: dimensões, currículo propedêutico e horário típico.</p>

            <div>
              <SectionHeader>Imagem de Cabeçalho</SectionHeader>
              <ImagemUpload label="Fotografia do banner da página" value={data.hero_imagem || ''} onChange={set('hero_imagem')} hint="Imagem exibida no topo da página de Formação." />
            </div>

            <div>
              <SectionHeader>Quatro Dimensões da Formação</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.dimensoes) ? data.dimensoes : []}
                campos={[
                  { key: 'emoji', label: 'Ícone (emoji)', placeholder: '❤️' },
                  { key: 'titulo', label: 'Título', placeholder: 'Formação Humana' },
                  { key: 'desc', label: 'Descrição', multiline: true },
                ]}
                onChange={set('dimensoes')}
              />
            </div>

            <div>
              <SectionHeader>Currículo Propedêutico</SectionHeader>
              <CurriculoEditor
                items={Array.isArray(data.curriculo) ? data.curriculo : []}
                onChange={set('curriculo')}
              />
            </div>

            <div>
              <SectionHeader>Horário Típico do Dia</SectionHeader>
              <p className="text-xs text-gray-400 mb-3">Campo "tipo": use <code>espiritual</code>, <code>academico</code> ou <code>comunitario</code></p>
              <ListaObjEditor
                items={Array.isArray(data.horario_tipico) ? data.horario_tipico : []}
                campos={[
                  { key: 'hora', label: 'Hora (ex: 06:00)', placeholder: '06:00' },
                  { key: 'atividade', label: 'Actividade', placeholder: 'Laudes e Oração' },
                  { key: 'tipo', label: 'Tipo (espiritual / academico / comunitario)', placeholder: 'espiritual' },
                ]}
                onChange={set('horario_tipico')}
              />
            </div>

            <SaveBtn campos={[
              { chave: 'hero_imagem', valor: data.hero_imagem, tipo: 'text' },
              { chave: 'dimensoes', valor: data.dimensoes, tipo: 'json' },
              { chave: 'curriculo', valor: data.curriculo, tipo: 'json' },
              { chave: 'horario_tipico', valor: data.horario_tipico, tipo: 'json' },
            ]} />
          </div>
        );

      // ── Um Dia no Seminário ───────────────────────────────────────────────────
      case 'um_dia':
        if (!isSuperAdmin) {
          return (
            <div className="max-w-xl">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <Lock size={18} className="shrink-0" />
                <p className="text-sm">Esta secção é gerida exclusivamente pelo <strong>Administrador Geral</strong>.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-10 max-w-3xl">
            <p className="text-sm text-gray-500">Conteúdo da página «Um Dia no Seminário».</p>

            <div>
              <SectionHeader>Cabeçalho</SectionHeader>
              <ImagemUpload label="Imagem de fundo do cabeçalho" value={data.hero_imagem || ''} onChange={set('hero_imagem')} hint="Fotografia exibida no topo da página." />
              <div className="mt-4">
                <Campo label="Texto de introdução" value={data.texto_introducao || ''} onChange={set('texto_introducao')} multiline hint="Parágrafo descritivo exibido abaixo do título." />
              </div>
            </div>

            <div>
              <SectionHeader>Horário Típico do Dia</SectionHeader>
              <p className="text-xs text-gray-400 mb-3">Campo "tipo": use <code>espiritual</code>, <code>academico</code> ou <code>comunitario</code></p>
              <ListaObjEditor
                items={Array.isArray(data.horario_tipico) ? data.horario_tipico : []}
                campos={[
                  { key: 'hora', label: 'Hora (ex: 06:00)', placeholder: '06:00' },
                  { key: 'atividade', label: 'Actividade', placeholder: 'Laudes e Oração' },
                  { key: 'tipo', label: 'Tipo (espiritual / academico / comunitario)', placeholder: 'espiritual' },
                ]}
                onChange={set('horario_tipico')}
              />
            </div>

            <div>
              <SectionHeader>Actividades</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.atividades) ? data.atividades : []}
                campos={[
                  { key: 'emoji', label: 'Ícone (emoji)', placeholder: '⚽' },
                  { key: 'nome', label: 'Nome da actividade', placeholder: 'Desporto' },
                  { key: 'desc', label: 'Descrição', multiline: true },
                ]}
                onChange={set('atividades')}
              />
            </div>

            <div>
              <SectionHeader>Galeria de Fotografias</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.galeria) ? data.galeria : []}
                campos={[
                  { key: 'url', label: 'Fotografia', type: 'image' },
                  { key: 'legenda', label: 'Legenda (opcional)', placeholder: 'Actividade desportiva' },
                ]}
                onChange={set('galeria')}
              />
            </div>

            <div>
              <SectionHeader>Regulamento</SectionHeader>
              <ListaObjEditor
                items={Array.isArray(data.regulamento) ? data.regulamento : []}
                campos={[
                  { key: 'titulo', label: 'Título da regra', placeholder: 'Silêncio nocturno' },
                  { key: 'descricao', label: 'Descrição', multiline: true },
                ]}
                onChange={set('regulamento')}
              />
            </div>

            <SaveBtn campos={[
              { chave: 'hero_imagem', valor: data.hero_imagem, tipo: 'text' },
              { chave: 'texto_introducao', valor: data.texto_introducao, tipo: 'text' },
              { chave: 'horario_tipico', valor: data.horario_tipico, tipo: 'json' },
              { chave: 'atividades', valor: data.atividades, tipo: 'json' },
              { chave: 'galeria', valor: data.galeria, tipo: 'json' },
              { chave: 'regulamento', valor: data.regulamento, tipo: 'json' },
            ]} />
          </div>
        );

      case 'equipa':
        return <SecçãoEquipa />;

      // ── Política de Privacidade ───────────────────────────────────────────────
      case 'privacidade':
        if (!isSuperAdmin) {
          return (
            <div className="max-w-xl">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <Lock size={18} className="shrink-0" />
                <p className="text-sm">Esta secção é gerida exclusivamente pelo <strong>Administrador Geral</strong>.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-gray-500">Conteúdo exibido na página pública «Política de Privacidade».</p>
            <Campo label="Título da página" value={data.titulo || ''} onChange={set('titulo')} placeholder="Política de Privacidade" />
            <Campo label="Texto" value={data.conteudo || ''} onChange={set('conteudo')} multiline hint="Escreva um parágrafo por linha." />
            <SaveBtn campos={[
              { chave: 'titulo', valor: data.titulo, tipo: 'text' },
              { chave: 'conteudo', valor: data.conteudo, tipo: 'text' },
            ]} />
          </div>
        );

      // ── Termos de Uso ─────────────────────────────────────────────────────────
      case 'termos':
        if (!isSuperAdmin) {
          return (
            <div className="max-w-xl">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <Lock size={18} className="shrink-0" />
                <p className="text-sm">Esta secção é gerida exclusivamente pelo <strong>Administrador Geral</strong>.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-gray-500">Conteúdo exibido na página pública «Termos de Uso».</p>
            <Campo label="Título da página" value={data.titulo || ''} onChange={set('titulo')} placeholder="Termos de Uso" />
            <Campo label="Texto" value={data.conteudo || ''} onChange={set('conteudo')} multiline hint="Escreva um parágrafo por linha." />
            <SaveBtn campos={[
              { chave: 'titulo', valor: data.titulo, tipo: 'text' },
              { chave: 'conteudo', valor: data.conteudo, tipo: 'text' },
            ]} />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Conteúdo</h1>
      <p className="text-sm text-gray-500 mb-6">Edite o conteúdo de todas as páginas públicas do site.</p>

      <div className="flex flex-wrap gap-1 mb-8 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === t.id
                ? 'bg-white border border-b-white border-gray-200 text-primary-700 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-64">{renderTab()}</div>
    </div>
  );
}
