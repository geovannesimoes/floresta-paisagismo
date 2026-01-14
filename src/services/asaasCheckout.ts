import { supabase } from '@/lib/supabase/client'

interface CreateCheckoutParams {
  orderId: string
  orderCode: string
  planName: string
  price: number
  siteUrl: string
}

interface CreateCheckoutResponse {
  checkoutUrl?: string
  error?: string
}

export const asaasCheckoutService = {
  async createCheckout(
    params: CreateCheckoutParams,
  ): Promise<CreateCheckoutResponse> {
    console.log('[AsaasCheckout] Initiating checkout with params:', params)

    try {
      const { data, error } = await supabase.functions.invoke(
        'create-asaas-checkout',
        {
          body: params,
        },
      )

      if (error) {
        console.error('[AsaasCheckout] Invocation Error:', error)
        // Edge Function Invocation Failed (Network, 500, etc)
        // Try to parse the response body if available in error context, usually Supabase client returns a structured error
        // But if it's a FunctionInvokeError, we might check details.

        let errorMessage = 'Falha ao conectar com servidor de pagamento.'

        // If the edge function returned a specific error structure in the body despite the http error code
        // The supabase client might put it in `error.context` or similar, but simplified:
        if (error instanceof Error) {
          errorMessage = error.message
        }

        return {
          error: errorMessage,
        }
      }

      console.log('[AsaasCheckout] Response Data:', data)

      if (data.error) {
        console.error('[AsaasCheckout] API Error:', data.error)
        return { error: data.error }
      }

      if (!data.checkoutUrl) {
        console.error('[AsaasCheckout] Missing URL in response')
        return { error: 'Link de pagamento não recebido.' }
      }

      return { checkoutUrl: data.checkoutUrl }
    } catch (err: any) {
      console.error('[AsaasCheckout] Unexpected Exception:', err)
      return { error: err.message || 'Erro inesperado ao criar pagamento' }
    }
  },
}
