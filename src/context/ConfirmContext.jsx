import { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

// Substitui o window.confirm() nativo do browser (o popup cinzento com o
// endereço do site lá dentro) por um diálogo próprio, consistente com o
// resto do visual do site. Um único diálogo global, montado uma vez — cada
// página só chama confirm(mensagem) e espera pela resposta.
export function ConfirmProvider({ children }) {
  const [pedido, setPedido] = useState(null); // { mensagem, resolve }

  const confirm = useCallback((mensagem) => {
    return new Promise((resolve) => setPedido({ mensagem, resolve }));
  }, []);

  function responder(resultado) {
    pedido?.resolve(resultado);
    setPedido(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pedido && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center px-4"
          onClick={() => responder(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <p className="text-gray-800 text-sm leading-relaxed pt-2">{pedido.mensagem}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => responder(false)} className="btn-secondary text-sm">Cancelar</button>
              <button
                onClick={() => responder(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// Devolve uma função confirm(mensagem) => Promise<boolean> — usar com
// await no lugar exacto onde antes estava o window.confirm().
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm() só pode ser usado dentro de <ConfirmProvider>');
  return ctx;
}
