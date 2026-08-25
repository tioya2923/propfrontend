import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

// Carregada uma única vez para toda a aplicação — fica `null` se a chave publicável
// não estiver configurada no frontend, e nesse caso o chamador nunca deve montar este modal.
export const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ valor, moeda, submitLabel, onClose, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Erro ao processar o pagamento.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      // onSuccess normalmente fecha/substitui este modal — não repor "submitting"
      // depois disso para evitar actualizar estado de um componente já desmontado.
      await onSuccess(paymentIntent);
    } else {
      setError('O pagamento não foi concluído. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={!stripe || submitting} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'A processar...' : (submitLabel || `Pagar ${formatCurrency(valor, moeda)}`)}
        </button>
        <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary flex-1">Cancelar</button>
      </div>
    </form>
  );
}

/**
 * Modal de checkout com Stripe Elements — genérico e reutilizável.
 *
 * @param clientSecret  client_secret do PaymentIntent já criado no backend.
 * @param valor / moeda usados apenas para rotular o botão (ex: "Pagar 45,00 €").
 * @param title         título do modal (por omissão "Pagar com Cartão").
 * @param submitLabel   texto do botão de submissão (substitui o rótulo automático).
 * @param onClose        chamado ao cancelar/fechar sem pagar.
 * @param onSuccess(paymentIntent) chamado quando o Stripe confirma o pagamento
 *                       (status "succeeded" ou "processing"). Quem chama decide
 *                       o que fazer a seguir (confirmar no backend, mostrar ecrã de sucesso, etc.).
 */
export default function StripeCheckoutModal({ clientSecret, valor, moeda, title, submitLabel, onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg flex items-center gap-2"><CreditCard size={18} /> {title || 'Pagar com Cartão'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret, locale: 'pt' }}>
          <CheckoutForm valor={valor} moeda={moeda} submitLabel={submitLabel} onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </div>
    </div>
  );
}
