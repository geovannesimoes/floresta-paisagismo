export const getEmailTemplate = (
  template: string,
  data: any,
): { subject: string; html: string } => {
  const logoUrl =
    data.logoUrl ||
    'https://img.usecurling.com/i?q=Viveiro%20Floresta%20Logo%20Trees&color=green&shape=hand-drawn'
  const siteUrl = data.siteUrl || 'https://viveirofloresta.com.br'
  const primaryColor = '#346a32'

  const baseLayout = (content: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: ${primaryColor}; padding: 20px; text-align: center; }
          .header img { max-height: 50px; }
          .content { padding: 30px 20px; }
          .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888; }
          .button { display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0; }
          .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 15px 0; }
          h1 { color: ${primaryColor}; font-size: 24px; margin-top: 0; }
          h2 { font-size: 18px; margin-top: 20px; color: #444; }
          p { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Viveiro Floresta">
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Floresta Paisagismo. Todos os direitos reservados.</p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `

  switch (template) {
    case 'account_created':
      return {
        subject: 'Bem-vindo(a) ao Viveiro Floresta',
        html: baseLayout(`
          <h1>Bem-vindo(a), ${data.name}!</h1>
          <p>Sua conta foi criada com sucesso. Agora você pode acompanhar seus projetos e pedidos através da nossa Área do Cliente.</p>
          <div class="info-box">
            <p><strong>Seus dados de acesso:</strong></p>
            <p>E-mail: ${data.email}</p>
            <p>Senha Temporária: <strong>${data.password}</strong></p>
          </div>
          <p>Recomendamos que você altere sua senha após o primeiro acesso.</p>
          <center><a href="${siteUrl}/area-cliente" class="button">Acessar Área do Cliente</a></center>
        `),
      }

    case 'password_changed':
      return {
        subject: 'Sua senha foi alterada',
        html: baseLayout(`
          <h1>Senha Atualizada</h1>
          <p>Olá, ${data.name}.</p>
          <p>A senha da sua conta foi alterada com sucesso recentemente.</p>
          <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>
        `),
      }

    case 'new_order_admin':
      return {
        subject: `[Novo Pedido] #${data.code} - ${data.client_name}`,
        html: baseLayout(`
          <h1>Novo Pedido Recebido</h1>
          <p>Um novo pedido foi criado no sistema.</p>
          <div class="info-box">
            <p><strong>Pedido:</strong> #${data.code}</p>
            <p><strong>Cliente:</strong> ${data.client_name}</p>
            <p><strong>Plano:</strong> ${data.plan}</p>
            <p><strong>Valor:</strong> R$ ${data.price}</p>
          </div>
          <center><a href="${siteUrl}/admin" class="button">Gerenciar Pedido</a></center>
        `),
      }

    case 'payment_confirmed':
      return {
        subject: 'Pagamento Confirmado - Pedido #' + data.code,
        html: baseLayout(`
          <h1>Pagamento Recebido!</h1>
          <p>Olá, ${data.client_name}.</p>
          <p>Recebemos o pagamento do seu pedido <strong>#${data.code}</strong> referente ao plano <strong>${data.plan}</strong>.</p>
          <p>Nossa equipe já vai iniciar a análise das informações e dar início ao seu projeto.</p>
          <p>O prazo estimado de entrega é de <strong>${data.deadline_days} dias úteis</strong>.</p>
          <center><a href="${siteUrl}/area-cliente" class="button">Acompanhar Pedido</a></center>
        `),
      }

    case 'status_update':
      return {
        subject: `Atualização do Pedido #${data.code}`,
        html: baseLayout(`
          <h1>Status Atualizado</h1>
          <p>Olá, ${data.client_name}.</p>
          <p>O status do seu pedido <strong>#${data.code}</strong> mudou para:</p>
          <div class="info-box" style="text-align: center; font-size: 18px; font-weight: bold;">
            ${data.status}
          </div>
          <p>Acesse a área do cliente para ver mais detalhes.</p>
          <center><a href="${siteUrl}/area-cliente" class="button">Ver Detalhes</a></center>
        `),
      }

    case 'project_delivered':
      return {
        subject: `Seu Projeto está Pronto! Pedido #${data.code}`,
        html: baseLayout(`
          <h1>Projeto Finalizado! 🎉</h1>
          <p>Olá, ${data.client_name}.</p>
          <p>Temos ótimas notícias! O projeto do seu jardim está pronto e disponível para download.</p>
          <p>Acesse sua área do cliente para visualizar as imagens, plantas e guias preparados especialmente para você.</p>
          <center><a href="${siteUrl}/area-cliente" class="button">Ver Meu Projeto</a></center>
        `),
      }

    case 'revision_requested_admin':
      return {
        subject: `[Revisão Solicitada] Pedido #${data.code}`,
        html: baseLayout(`
          <h1>Solicitação de Revisão</h1>
          <p>O cliente <strong>${data.client_name}</strong> solicitou uma revisão no pedido <strong>#${data.code}</strong>.</p>
          <div class="info-box">
            <p><strong>Solicitação:</strong></p>
            <p><em>"${data.description}"</em></p>
          </div>
          <center><a href="${siteUrl}/admin" class="button">Ver Pedido</a></center>
        `),
      }

    case 'revised_project_delivered':
      return {
        subject: `Revisão do Projeto Disponível - Pedido #${data.code}`,
        html: baseLayout(`
          <h1>Revisão Concluída</h1>
          <p>Olá, ${data.client_name}.</p>
          <p>A revisão solicitada para o seu projeto foi concluída e os novos arquivos já estão disponíveis.</p>
          <center><a href="${siteUrl}/area-cliente" class="button">Ver Revisão</a></center>
        `),
      }

    default:
      return {
        subject: 'Notificação Viveiro Floresta',
        html: baseLayout(
          `<p>${data.message || 'Você tem uma nova notificação.'}</p>`,
        ),
      }
  }
}
