import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Em memória por instância lambda para evitar disparos duplicados
const sentDeliveries = new Set();

function getConfig() {
  const defaults = {
    mercado_pago_access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-7458996510149615-110903-8738600b8589a9741d32a85a8040d38b-408387365",
    product_title: "Faça sua série animada e ganhe com isso",
    smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
    smtp_port: 465,
    smtp_user: process.env.SMTP_USER || "glcodingweb@gmail.com",
    smtp_pass: process.env.SMTP_PASS || "pazgfxmesdsdknuk",
    tutorial_url: process.env.TUTORIAL_URL || "https://youtu.be/xxJby0kUv08",
    pdf_url: process.env.PDF_URL || "https://lucasvideos.vercel.app/Curso_Visual_Historias_Animadas_Parte_1.pdf"
  };
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...defaults, ...data };
    }
  } catch (e) {}
  return defaults;
}

async function sendEmail(buyerEmail, buyerName, tutorialUrl, pdfUrl) {
  const config = getConfig();
  if (!buyerEmail || !config.smtp_user || !config.smtp_pass) {
    console.warn('[Webhook] Dados de e-mail ausentes:', { buyerEmail, hasUser: !!config.smtp_user });
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: 465,
    secure: true,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass
    }
  });

  const title = config.product_title || "Faça sua série animada e ganhe com isso";
  const name = buyerName || "Aluno(a)";
  const finalTutorialUrl = tutorialUrl || config.tutorial_url;
  const finalPdfUrl = pdfUrl || config.pdf_url;

  const mailOptions = {
    from: `"${title}" <${config.smtp_user}>`,
    to: buyerEmail,
    subject: `🎉 Seus Acessos Chegaram: ${title} (Vídeo Aula + E-book PDF)`,
    text: `Olá, ${name}!\n\nSeu pagamento de R$ 9,90 via Pix foi confirmado com sucesso!\n\nAqui estão os seus links de acesso:\n\n1) VÍDEO AULA COMPLETA:\n${finalTutorialUrl}\n\n2) E-BOOK GUIA COMPLETO COM PROMPTS (PDF):\n${finalPdfUrl}\n\nBons estudos!\nEquipe ${title} · @caio.deferias`,
    html: `
      <div style="font-family: sans-serif; background-color: #FFF7F2; padding: 20px; color: #16131F;">
        <div style="max-width: 540px; margin: 0 auto; background: #fff; border: 3px solid #16131F; border-radius: 18px; padding: 30px 24px;">
          <h1 style="font-size: 24px; margin: 0 0 12px 0;">Parabéns, ${name}! 🎉</h1>
          <p style="font-size: 16px; line-height: 1.5;">O seu pagamento de <b>R$ 9,90</b> via Pix foi aprovado com sucesso!</p>
          <p style="font-size: 15px; color: #555;">Seus 2 entregáveis completos já estão liberados abaixo:</p>

          <div style="background: #FFE3EC; border: 2px dashed #FF5D8F; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">🎬 1. Vídeo Aula Prática Passo a Passo</p>
            <a href="${finalTutorialUrl}" target="_blank" style="display: inline-block; background: #FF5D8F; color: #ffffff; text-decoration: none; font-size: 17px; font-weight: bold; padding: 14px 24px; border: 2px solid #16131F; border-radius: 10px;">👉 ACESSAR A VÍDEO AULA AGORA</a>
            <p style="margin: 8px 0 0 0; font-size: 12px;"><a href="${finalTutorialUrl}" style="color: #20A5A0;">${finalTutorialUrl}</a></p>
          </div>

          <div style="background: #E8F8F7; border: 2px dashed #20A5A0; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">📖 2. E-book Guia Completo com Prompts (PDF)</p>
            <a href="${finalPdfUrl}" target="_blank" style="display: inline-block; background: #20A5A0; color: #ffffff; text-decoration: none; font-size: 17px; font-weight: bold; padding: 14px 24px; border: 2px solid #16131F; border-radius: 10px;">📥 BAIXAR O E-BOOK COMPLETO (PDF)</a>
            <p style="margin: 8px 0 0 0; font-size: 12px;"><a href="${finalPdfUrl}" style="color: #20A5A0;">${finalPdfUrl}</a></p>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 24px;">Bons estudos e muito sucesso criando sua série animada!<br><b>${title}</b> · @caio.deferias</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Webhook] E-mail enviado com sucesso para ${buyerEmail}: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('[Webhook] Erro ao enviar e-mail:', err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch(e) { body = {}; }
  } else if (!body) {
    body = {};
  }

  // Identificação do pagamento por Webhook (v2) ou IPN (v1)
  const paymentId = 
    body?.data?.id || 
    body?.id || 
    req.query?.['data.id'] || 
    req.query?.id;

  console.log('[Webhook MP] Notificação recebida:', {
    query: req.query,
    paymentId,
    action: body?.action,
    type: body?.type
  });

  if (!paymentId) {
    return res.status(200).json({ received: true, note: 'Sem ID de pagamento no evento' });
  }

  const config = getConfig();
  const token = (config.mercado_pago_access_token || '').trim();

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Vercel-Checkout-Pix/1.0'
      }
    });

    if (!mpRes.ok) {
      console.warn(`[Webhook MP] Falha ao consultar pagamento ${paymentId}: status ${mpRes.status}`);
      return res.status(200).json({ received: true, status: 'fetch_failed' });
    }

    const data = await mpRes.json();
    console.log(`[Webhook MP] Pagamento ${paymentId} status: ${data.status}`);

    if (data.status === 'approved') {
      const buyerEmail = data.payer?.email || data.metadata?.buyer_email;
      const buyerName = `${data.payer?.first_name || ''} ${data.payer?.last_name || ''}`.trim() || data.metadata?.buyer_name || 'Aluno(a)';

      const key = `${paymentId}_${buyerEmail}`;
      if (!sentDeliveries.has(key)) {
        sentDeliveries.add(key);
        await sendEmail(buyerEmail, buyerName, config.tutorial_url, config.pdf_url);
      }
    }

    return res.status(200).json({ received: true, status: data.status, pdf_url: config.pdf_url, tutorial_url: config.tutorial_url });
  } catch (err) {
    console.error('[Webhook MP] Erro geral ao processar webhook:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
