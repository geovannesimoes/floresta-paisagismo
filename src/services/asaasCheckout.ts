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

        let errorMessage = 'Falha ao conectar com servidor de pagamento.'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        return { error: errorMessage }
      }

      console.log('[AsaasCheckout] Response Data:', data)

      if (data.error) {
        console.error('[AsaasCheckout] API Error:', data.error, data.details)
        // Combine error and details for better feedback
        const fullMessage = data.details
          ? `${data.error}: ${data.details}`
          : data.error
        return { error: fullMessage }
      }

      if (data.missing) {
        // Handle explicit missing environment variables error
        const missingVars = Object.keys(data.missing)
          .filter((k) => data.missing[k])
          .join(', ')
        console.error('[AsaasCheckout] Missing Config:', missingVars)
        return {
          error: `Erro de configuração do servidor (Variáveis ausentes: ${missingVars})`,
        }
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
