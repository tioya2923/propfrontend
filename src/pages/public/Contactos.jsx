import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { publicAPI } from '../../api';
import { useConteudo } from '../../hooks/useConteudo';
import toast from 'react-hot-toast';

const DEFAULTS = {
  morada: 'Huambo, Angola',
  telefone: '+244 222 000 000',
  email: 'info@sje.ao',
  horario: 'Seg–Sex: 08:00–16:00\nSáb: 08:00–12:00',
};

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
}

export default function Contactos() {
  const c = useConteudo('contactos', DEFAULTS);
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.mensagem) return toast.error('Preencha os campos obrigatórios');
    setLoading(true);
    try {
      await publicAPI.submitContacto(form);
      setSent(true);
      toast.success('Mensagem enviada com sucesso!');
    } catch { toast.error('Erro ao enviar mensagem. Tente mais tarde.'); }
    finally { setLoading(false); }
  }

  const morada = c.morada || DEFAULTS.morada;

  return (
    <div>
      <section className="bg-dark-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">Fale Connosco</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Contactos</h1>
          <p className="text-xl text-gray-300 leading-relaxed">Estamos ao seu dispor para qualquer questão ou informação.</p>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Coluna de informações */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Informações</h2>

              <InfoItem icon={Phone} label="Telefone" value={c.telefone} />
              <InfoItem icon={Mail} label="Email" value={c.email} />
              <InfoItem icon={Clock} label="Horário de Secretaria" value={c.horario} />

              {/* Morada */}
              {morada && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Morada</p>
                    <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-0.5">Seminário Propedêutico São João Evangelista</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{morada}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Formulário */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="card text-center py-16">
                  <div className="text-5xl mb-4">✉️</div>
                  <h3 className="text-xl font-semibold mb-2">Mensagem enviada!</h3>
                  <p className="text-gray-600">Responderemos em breve. Obrigado pelo contacto.</p>
                </div>
              ) : (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-6">Formulário de Contacto</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label">Nome *</label><input type="text" value={form.nome} onChange={set('nome')} className="input" required /></div>
                      <div><label className="label">Email *</label><input type="email" value={form.email} onChange={set('email')} className="input" required /></div>
                    </div>
                    <div><label className="label">Assunto</label><input type="text" value={form.assunto} onChange={set('assunto')} className="input" /></div>
                    <div><label className="label">Mensagem *</label><textarea value={form.mensagem} onChange={set('mensagem')} rows={6} className="input" required /></div>
                    <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
                      {loading ? 'A enviar...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
