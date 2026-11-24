import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

function extractBuyer(data) {
  const metaEmail = data.metadata?.buyer_email?.trim();
  const addlEmail = data.additional_info?.payer?.email?.trim();
  const payerEmail = data.payer?.email?.trim();

  const candidates = [metaEmail, addlEmail, payerEmail];
  let email = null;
  for (const c of candidates) {
    if (c && c.includes('@') && !c.includes('XXXXXXXXXXX') && !c.includes('mercadopago.com')) {
      email = c;
      break;
    }
  }

  const name = data.metadata?.buyer_name?.trim() || `${data.payer?.first_name || ''} ${data.payer?.last_name || ''}`.trim() || 'Aluno(a)';
  return { email, name };
}

async function sendEmail(buyerEmail, buyerName, tutorialUrl, pdfUrl) {
  const config = getConfig();
  if (!buyerEmail || !config.smtp_user || !config.smtp_pass) return false;

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: 465,
    secure: true,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  const title = config.product_title || "Faça sua série animada e ganhe com isso";
  const name = buyerName || "Aluno(a)";
  const finalTutorialUrl = tutorialUrl || config.tutorial_url;
  const finalPdfUrl = pdfUrl || config.pdf_url;

  const mailOptions = {
    from: `"${title}" <${config.smtp_user}>`,
    to: buyerEmail,
    subject: `🎉 Seus Acessos Chegaram: ${title} (Vídeo Aula + E-book PDF)`,
    text: `Olá, ${name}!\n\nSeu pagamento via Pix foi confirmado com sucesso!\n\nAqui estão os seus links de acesso:\n\n1) VÍDEO AULA COMPLETA:\n${finalTutorialUrl}\n\n2) E-BOOK GUIA COMPLETO COM PROMPTS (PDF):\n${finalPdfUrl}\n\nBons estudos!\nEquipe ${title} · @caio.deferias`,
    html: `
      <div style="font-family: sans-serif; background-color: #FFF7F2; padding: 20px; color: #16131F;">
        <div style="max-width: 540px; margin: 0 auto; background: #fff; border: 3px solid #16131F; border-radius: 18px; padding: 30px 24px;">
          <h1 style="font-size: 24px; margin: 0 0 12px 0;">Parabéns, ${name}! 🎉</h1>
          <p style="font-size: 16px; line-height: 1.5;">O seu pagamento via Pix foi aprovado com sucesso!</p>
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
    console.log(`[Sync] E-mail enviado para ${buyerEmail}: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('[Sync] Erro ao enviar e-mail:', err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const config = getConfig();
  const token = (config.mercado_pago_access_token || '').trim();

  try {
    const searchUrl = 'https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=5';
    const mpRes = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Vercel-Checkout-Pix/1.0'
      }
    });

    if (!mpRes.ok) {
      return res.status(200).json({ sync: false, error: 'MP API unavailable' });
    }

    const data = await mpRes.json();
    const results = data.results || [];
    const synced = [];

    for (const payment of results) {
      if (payment.status === 'approved') {
        const { email: buyerEmail, name: buyerName } = extractBuyer(payment);
        const key = `${payment.id}_${buyerEmail}`;

        if (buyerEmail && !sentDeliveries.has(key)) {
          const sent = await sendEmail(buyerEmail, buyerName, config.tutorial_url, config.pdf_url);
          if (sent) {
            sentDeliveries.add(key);
            synced.push({ id: payment.id, email: buyerEmail, name: buyerName });
          }
        }
      }
    }

    return res.status(200).json({ success: true, count: results.length, synced });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
}
