import { useState, useEffect } from 'react';
import { publicAPI } from '../api';

export function useConteudo(pagina, defaults = {}) {
  const [data, setData] = useState(defaults);

  useEffect(() => {
    publicAPI.getConteudo(pagina)
      .then(r => setData(d => ({ ...d, ...r.data })))
      .catch(() => {});
  }, [pagina]);

  return data;
}
