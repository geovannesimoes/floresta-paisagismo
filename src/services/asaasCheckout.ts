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
    const { data, error } = await supabase.functions.invoke(
      'create-asaas-checkout',
      {
        body: params,
      },
    )

    if (error) {
      console.error('Asaas Checkout Error:', error)
      return {
        error: error.message || 'Falha ao conectar com gateway de pagamento',
      }
    }

    if (data.error) {
      console.error('Asaas Checkout API Error:', data.error)
      return { error: data.error }
    }

    return { checkoutUrl: data.checkoutUrl }
  },
}
