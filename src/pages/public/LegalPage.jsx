import { useConteudo } from '../../hooks/useConteudo';

export default function LegalPage({ pagina, tituloDefault }) {
  const c = useConteudo(pagina, { titulo: tituloDefault, conteudo: 'Esta página está em construção.' });

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 prose">
      <h1>{c.titulo || tituloDefault}</h1>
      <div className="whitespace-pre-line">{c.conteudo}</div>
    </div>
  );
}
