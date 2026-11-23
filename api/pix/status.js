import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const sentEmails = new Set();

function getConfig() {
  const defaults = {
    mercado_pago_access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-7458996510149615-110903-8738600b8589a9741d32a85a8040d38b-408387365",
    product_title: "Série Animada do Zero",
    smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
    smtp_port: 465,
    smtp_user: process.env.SMTP_USER || "glcodingweb@gmail.com",
    smtp_pass: process.env.SMTP_PASS || "pazgfxmesdsdknuk",
    tutorial_url: process.env.TUTORIAL_URL || "https://youtu.be/xxJby0kUv08"
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

async function sendEmail(buyerEmail, buyerName, tutorialUrl) {
  const config = getConfig();
  if (!buyerEmail || !config.smtp_user || !config.smtp_pass) return false;

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: 465,
    secure: true,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass
    }
  });

  const title = config.product_title || "Série Animada do Zero";
  const name = buyerName || "Aluno(a)";

  const mailOptions = {
    from: `"${title}" <${config.smtp_user}>`,
    to: buyerEmail,
    subject: `🎉 Seu Acesso Chegou: ${title} (Vídeo Aula Completa)`,
    text: `Olá, ${name}!\n\nSeu pagamento de R$ 9,90 via Pix foi confirmado com sucesso!\n\nAqui está o seu link de acesso à vídeo aula:\n${tutorialUrl}\n\nBons estudos!\nEquipe ${title} · @caio.deferias`,
    html: `
      <div style="font-family: sans-serif; background-color: #FFF7F2; padding: 20px; color: #16131F;">
        <div style="max-width: 520px; margin: 0 auto; background: #fff; border: 3px solid #16131F; border-radius: 18px; padding: 30px 24px;">
          <h1 style="font-size: 24px; margin: 0 0 12px 0;">Parabéns, ${name}! 🎉</h1>
          <p>O seu pagamento de <b>R$ 9,90</b> via Pix foi aprovado com sucesso!</p>
          <div style="background: #FFE3EC; border: 2px dashed #FF5D8F; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">👇 Clique abaixo para assistir à vídeo aula:</p>
            <a href="${tutorialUrl}" target="_blank" style="display: inline-block; background: #FF5D8F; color: #fff; text-decoration: none; font-size: 18px; font-weight: bold; padding: 14px 28px; border: 2px solid #16131F; border-radius: 10px;">👉 ACESSAR A VÍDEO AULA AGORA</a>
            <p style="margin: 10px 0 0 0; font-size: 12px;"><a href="${tutorialUrl}" style="color: #20A5A0;">${tutorialUrl}</a></p>
          </div>
          <p>Bons estudos e sucesso na sua série!<br><b>${title}</b> · @caio.deferias</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado com sucesso para ${buyerEmail}`);
    return true;
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const paymentId = req.query?.id;
  if (!paymentId) {
    return res.status(400).json({ error: "Parâmetro 'id' é obrigatório" });
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
      return res.status(200).json({ id: paymentId, status: 'pending' });
    }

    const data = await mpRes.json();
    const status = data.status;
    let emailSent = false;

    if (status === 'approved' && !sentEmails.has(paymentId)) {
      sentEmails.add(paymentId);
      const buyerEmail = data.payer?.email;
      const buyerName = `${data.payer?.first_name || ''} ${data.payer?.last_name || ''}`.trim();
      await sendEmail(buyerEmail, buyerName, config.tutorial_url);
      emailSent = true;
    }

    return res.status(200).json({
      id: data.id,
      status: status,
      status_detail: data.status_detail,
      tutorial_url: config.tutorial_url,
      email_sent: emailSent
    });
  } catch (err) {
    return res.status(200).json({ id: paymentId, status: 'pending', error: err.message });
  }
}
