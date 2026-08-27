import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Facebook, Twitter, Instagram } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { publicAPI } from '../../api';
import { useConteudo } from '../../hooks/useConteudo';

const DEFAULTS = {
  citacao: '«Que o Senhor envie à sua Igreja novos obreiros da messe, sacerdotes sábios e santos, para que a evangelização chegue a todos os cantos de Angola e o Evangelho transforme os corações dos homens.»',
  hero_subtitulo: 'Seminário Propedêutico',
  hero_titulo: 'DE São João Evangelista',
};

/* ── Social sidebar ────────────────────────────────────────────────────────── */
function SocialSidebar() {
  const c = useConteudo('contactos', {});
  if (!c.facebook_url && !c.twitter_url && !c.instagram_url) return null;
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col">
      {c.facebook_url && (
        <a href={c.facebook_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-[#3b5998] text-white hover:bg-[#2d4373] transition-colors"
          aria-label="Facebook"><Facebook size={15} /></a>
      )}
      {c.twitter_url && (
        <a href={c.twitter_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-[#1da1f2] text-white hover:bg-[#1a8fd1] transition-colors"
          aria-label="Twitter"><Twitter size={15} /></a>
      )}
      {c.instagram_url && (
        <a href={c.instagram_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-[#c13584] text-white hover:bg-[#a0286c] transition-colors"
          aria-label="Instagram"><Instagram size={15} /></a>
      )}
    </div>
  );
}

/* ── Hero Slider — título/imagens genéricos configurados pelo admin.
   As notícias já têm o seu próprio espaço na secção "Notícias + Testemunhos"
   logo abaixo, por isso não voltam a passar aqui. ───────────────────────── */
function HeroSlider({ subtituloFallback, tituloFallback, imagensFallback }) {
  const [slide, setSlide] = useState(0);
  const srcs = imagensFallback.length ? imagensFallback : ['/images/hero.svg'];
  const total = srcs.length;

  const next = useCallback(() => setSlide(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setSlide(i => (i === 0 ? total - 1 : i - 1)), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, total]);

  return (
    <section className="relative group bg-gray-900 overflow-hidden h-[55vw] min-h-[320px] md:h-[70vh] md:min-h-[480px]">
      {srcs.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          fetchpriority={i === 0 ? 'high' : 'low'}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />

      {/* text */}
      <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 md:px-20 lg:px-28 max-w-3xl">
        <p className="text-white/75 uppercase tracking-[0.2em] mb-2 text-xs sm:text-sm md:text-base font-light">
          {subtituloFallback}
        </p>
        <h1 className="text-white font-serif font-bold leading-tight"
          style={{ fontSize: 'clamp(1.75rem, 6vw, 5.5rem)' }}>
          {tituloFallback}
        </h1>
        <div className="mt-4 w-12 h-1 bg-primary-500" />
      </div>

      {/* arrows */}
      {total > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary-700 text-white p-2 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Slide anterior"><ChevronLeft size={20} /></button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary-700 text-white p-2 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Próximo slide"><ChevronRight size={20} /></button>
        </>
      )}
    </section>
  );
}

/* ── Notícias (versão compacta, para ficar lado-a-lado com Testemunhos) ────── */
function NoticiasCard({ noticias }) {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (noticias.length <= 1) return;
    const t = setInterval(() => setCur(i => (i === noticias.length - 1 ? 0 : i + 1)), 6000);
    return () => clearInterval(t);
  }, [noticias.length]);

  const prev = e => { e.stopPropagation(); setCur(i => (i === 0 ? noticias.length - 1 : i - 1)); };
  const next = e => { e.stopPropagation(); setCur(i => (i === noticias.length - 1 ? 0 : i + 1)); };
  const n = noticias[cur];
  const href = n ? `/noticias/${n.slug || n.id}` : '/noticias';

  return (
    <div className="relative group bg-gray-100 overflow-hidden border border-gray-100 min-h-[300px] md:min-h-[440px]">
      <Link to={href} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />

      {n?.imagem_url
        ? <img src={n.imagem_url} alt={n.titulo} loading="lazy" decoding="async"
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 will-change-transform" />
        : <div className="absolute inset-0 bg-gray-100" />}

      <div className="absolute top-0 left-0 bg-primary-700 px-5 py-2.5 z-10">
        <span className="text-white font-bold text-xs tracking-widest uppercase">Notícias</span>
      </div>

      {noticias.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary-700 text-white p-2 z-20 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Anterior"><ChevronLeft size={20} /></button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary-700 text-white p-2 z-20 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Seguinte"><ChevronRight size={20} /></button>
        </>
      )}

      <Link to={href}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 lg:w-2/5 xl:w-1/4 bg-primary-700/70 hover:bg-primary-700/90 transition-colors px-4 py-3 z-10 block text-center backdrop-blur-sm">
        <p className="text-white font-semibold text-sm">{n ? n.titulo : 'Últimas notícias'}</p>
      </Link>
    </div>
  );
}

/* ── Testimonials Slider ───────────────────────────────────────────────────── */
function TestemunhosSlider() {
  const [list, setList] = useState([]);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    publicAPI.getConteudo('vocacao')
      .then(r => { const l = Array.isArray(r.data?.testemunhos) ? r.data.testemunhos : []; if (l.length) setList(l); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setCur(i => (i === list.length - 1 ? 0 : i + 1)), 6000);
    return () => clearInterval(t);
  }, [list.length]);

  const prev = e => { e.stopPropagation(); setCur(i => (i === 0 ? list.length - 1 : i - 1)); };
  const goNext = e => { e.stopPropagation(); setCur(i => (i === list.length - 1 ? 0 : i + 1)); };
  const t = list[cur];

  return (
    <div className="relative group bg-gray-100 overflow-hidden border border-gray-100 min-h-[300px] md:min-h-[440px]">
      <Link to="/vocacao" className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />

      {t?.foto_url
        ? <img src={t.foto_url} alt={t.nome} loading="lazy" decoding="async"
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 will-change-transform" />
        : <div className="absolute inset-0 bg-gray-100" />}

      <div className="absolute top-0 left-0 bg-primary-700 px-5 py-2.5 z-10">
        <span className="text-white font-bold text-xs tracking-widest uppercase">Testemunhos</span>
      </div>

      {list.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary-700 text-white p-2 z-20 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Anterior"><ChevronLeft size={20} /></button>
          <button onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary-700 text-white p-2 z-20 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Seguinte"><ChevronRight size={20} /></button>
        </>
      )}

      <Link to="/vocacao"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 lg:w-2/5 xl:w-1/4 bg-primary-700/70 hover:bg-primary-700/90 transition-colors px-4 py-3 z-10 block text-center backdrop-blur-sm">
        {t
          ? <><p className="text-white font-semibold text-sm">{t.nome}</p>
              {t.ano && <p className="text-primary-200 text-xs mt-0.5">{t.ano}</p>}</>
          : <p className="text-white font-semibold text-sm">Testemunhos de vida</p>}
      </Link>
    </div>
  );
}

/* ── Banner section (Olivais-style: full-width image + white box + red bar) ── */
function Banner({ imageSrc, title, subtitle, href, objectFit = 'object-contain' }) {
  return (
    <Link to={href} className="relative block group overflow-hidden bg-gray-100 border border-gray-100 h-[350px] sm:h-[450px] md:h-[550px] lg:h-[700px]">
      <img src={imageSrc} alt={title} loading="lazy" decoding="async"
        className={`absolute inset-0 w-full h-full ${objectFit} transition-transform duration-700 group-hover:scale-105 will-change-transform`} />

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 sm:pb-14 md:pb-16">
        <div className="w-3/4 sm:w-1/2 md:w-2/5 lg:w-1/4 text-center">
          <div className="bg-white/65 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-sm">
            <span className="text-primary-700 font-bold text-lg sm:text-xl md:text-2xl uppercase tracking-widest font-serif">
              {title}
            </span>
          </div>
          {subtitle && (
            <div className="bg-primary-700/70 px-4 py-2 sm:px-6 sm:py-2.5 backdrop-blur-sm">
              <span className="text-white text-xs sm:text-sm font-medium tracking-wide">{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Half-card (Reitor / Um Dia) ───────────────────────────────────────────── */
function HalfCard({ imageSrc, label, href }) {
  return (
    <Link to={href} className="relative block group overflow-hidden bg-gray-100 border border-gray-100 h-[260px] sm:h-[300px] md:h-[340px]">
      <img src={imageSrc} alt={label} loading="lazy" decoding="async"
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 will-change-transform" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 lg:w-2/5 xl:w-1/4 bg-primary-700/70 py-3 px-4 text-center backdrop-blur-sm">
        <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-widest">{label}</span>
      </div>
    </Link>
  );
}

/* ── Divider ───────────────────────────────────────────────────────────────── */
function Div() { return <div className="h-10 bg-gray-100" />; }

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function Home() {
  const { data: noticiaData } = useApi(() => publicAPI.getNoticias({ destaque: true }));
  const noticias = noticiaData?.noticias || [];
  const hp = useConteudo('homepage', DEFAULTS);

  const citacao       = hp.citacao       || DEFAULTS.citacao;
  const heroSubtitulo = hp.hero_subtitulo || DEFAULTS.hero_subtitulo;
  const heroTitulo    = hp.hero_titulo    || DEFAULTS.hero_titulo;
  const heroImagens   = [hp.hero_imagem_1, hp.hero_imagem_2].filter(Boolean);

  return (
    <div>
      <SocialSidebar />

      {/* ── 1. Hero — título/imagem genéricos configurados pelo admin ──────── */}
      <HeroSlider
        subtituloFallback={heroSubtitulo}
        tituloFallback={heroTitulo}
        imagensFallback={heroImagens}
      />

      {/* ── 2. Citação ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-10 h-0.5 bg-primary-600 mx-auto mb-6" />
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed italic font-serif">
            {citacao}
          </p>
          <div className="w-10 h-0.5 bg-primary-600 mx-auto mt-6" />
        </div>
      </section>

      <Div />

      {/* ── 3. Notícias + Testemunhos ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
        <NoticiasCard noticias={noticias} />
        <TestemunhosSlider />
      </div>

      <Div />

      {/* ── 4. Comunidade ──────────────────────────────────────────────────── */}
      <Banner
        imageSrc={hp.imagem_comunidade || '/images/comunidade.svg'}
        title="Comunidade"
        subtitle="2025/2026"
        href="/comunidade"
      />

      <Div />

      {/* ── 5. Formação ────────────────────────────────────────────────────── */}
      <Banner
        imageSrc={hp.imagem_formacao || '/images/formacao.svg'}
        title="Formação"
        subtitle="Linhas orientadoras"
        href="/formacao"
      />

      <Div />

      {/* ── 6. Como Ajudar ─────────────────────────────────────────────────── */}
      <Banner
        imageSrc={hp.imagem_ajudar || '/images/ajudar.svg'}
        title="Como Ajudar?"
        subtitle="Quero ajudar o Seminário"
        href="/ajudar"
      />

      <Div />

      {/* ── 7. Reitor + Um Dia ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
        <HalfCard
          imageSrc={hp.imagem_reitor || '/images/reitor.svg'}
          label="Mensagem do Reitor"
          href="/seminario"
        />
        <HalfCard
          imageSrc={hp.imagem_um_dia || '/images/um-dia.svg'}
          label="Um Dia no Seminário"
          href="/um-dia"
        />
      </div>
    </div>
  );
}
