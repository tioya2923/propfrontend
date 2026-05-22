import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useConteudo } from '../../hooks/useConteudo';

const siteMap = [
  ['Início', '/'],
  ['Mensagem do Reitor', '/seminario#reitor'],
  ['História', '/seminario#historia'],
  ['Comunidade', '/comunidade'],
  ['Formação', '/formacao'],
  ['Currículo Propedêutico', '/formacao#curriculo'],
  ['Um dia no Seminário', '/um-dia'],
  ['Como ajudar', '/ajudar'],
  ['Rezar pelo Seminário', '/ajudar#oracao'],
  ['Contactos', '/contactos'],
];

const DEFAULTS = {
  email: 'info@sje.ao',
  telefone: '+244 xxx xxx xxx',
  morada: 'Huambo, Angola',
};

export default function Footer() {
  const c = useConteudo('contactos', DEFAULTS);

  return (
    <footer className="bg-primary-700 text-white pt-20 pb-10 mt-24">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">

          {/* Mapa do site */}
          <div>
            <h4 className="font-bold text-base mb-5">Mapa do site</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
              {siteMap.map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/ajudar"
              className="inline-block mt-6 border border-white text-white text-sm font-semibold px-7 py-2 hover:bg-white hover:text-primary-700 transition-colors"
            >
              Donativos
            </Link>
          </div>

          {/* Contactos */}
          <div>
            <h4 className="font-bold text-base mb-5">Contactos</h4>
            <div className="space-y-3 text-sm text-white/80">
              {c.email && (
                <p>
                  <a href={`mailto:${c.email}`} className="hover:text-white transition-colors">
                    Email: {c.email}
                  </a>
                </p>
              )}
              {c.telefone && <p>Tlf: {c.telefone}</p>}
              {(c.morada || DEFAULTS.morada) && (
                <div className="mt-2">
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-0.5">Morada</p>
                  {(c.morada || DEFAULTS.morada).split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={22} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={22} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube size={22} />
              </a>
            </div>
          </div>

          {/* Localização */}
          <div>
            <h4 className="font-bold text-base mb-5">Localização</h4>
            <div className="rounded overflow-hidden border border-white/20" style={{ height: '170px' }}>
              {/* Replace the src below with your actual Google Maps embed URL */}
              <iframe
                title="Localização Seminário Propedêutico São João Evangelista"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126094!2d15.739!3d-12.775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebb2b5c1a7c9f35%3A0x0!2zSHVhbWJv!5e0!3m2!1spt!2sao!4v1700000000000"
                width="100%"
                height="170"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-5 text-center text-xs text-white/55">
          <p>© {new Date().getFullYear()} Seminário Propedêutico São João Evangelista — Huambo, Angola</p>
        </div>
      </div>
    </footer>
  );
}
