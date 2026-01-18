import { supabase } from '@/lib/supabase/client'

export interface SendEmailParams {
  template: string
  to: string | string[]
  data: any
  relatedOrderId?: string
  relatedUserId?: string
}

export const emailService = {
  async sendEmail(params: SendEmailParams) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    })
    return { data, error }
  },

  async notifyStatusUpdate(order: any, newStatus: string) {
    return this.sendEmail({
      template: 'status_update',
      to: order.client_email,
      relatedOrderId: order.id,
      data: {
        client_name: order.client_name,
        code: order.code,
        status: newStatus,
      },
    })
  },

  async notifyProjectDelivered(order: any) {
    return this.sendEmail({
      template: 'project_delivered',
      to: order.client_email,
      relatedOrderId: order.id,
      data: {
        client_name: order.client_name,
        code: order.code,
      },
    })
  },

  async notifyRevisionRequested(order: any, description: string) {
    return this.sendEmail({
      template: 'revision_requested_admin',
      to: 'ADMINS',
      relatedOrderId: order.id,
      data: {
        client_name: order.client_name,
        code: order.code,
        description: description,
      },
    })
  },

  async notifyRevisedProjectDelivered(order: any) {
    return this.sendEmail({
      template: 'revised_project_delivered',
      to: order.client_email,
      relatedOrderId: order.id,
      data: {
        client_name: order.client_name,
        code: order.code,
      },
    })
  },
}
