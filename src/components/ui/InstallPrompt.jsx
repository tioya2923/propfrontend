import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const DISMISS_KEY = 'pwa_install_dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Já instalada, ou o utilizador já dispensou o convite anteriormente.
    if (isStandalone()) return;
    let dismissed = false;
    try { dismissed = !!localStorage.getItem(DISMISS_KEY); } catch { /* Safari privado, etc. */ }
    if (dismissed) return;

    // iOS/Safari não dispara "beforeinstallprompt" — não há forma automática
    // de instalar, mostramos instruções manuais em vez de um botão.
    if (isIos()) {
      setShowIosHint(true);
      setVisible(true);
      return;
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === 'accepted') {
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-[100] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-primary-700 flex items-center justify-center text-white text-lg font-bold shrink-0">✝</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">Instale a nossa app</p>
        {showIosHint ? (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Toque em <Share size={12} className="inline -mt-0.5" strokeWidth={2.5} /> <strong>Partilhar</strong> e depois em <strong>"Adicionar ao Ecrã Principal"</strong>.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mt-1 mb-3">Acesso rápido ao portal, directamente do seu ecrã inicial.</p>
            <button onClick={handleInstall} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Download size={13} /> Instalar
            </button>
          </>
        )}
      </div>
      <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Fechar">
        <X size={16} />
      </button>
    </div>
  );
}
