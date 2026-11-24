import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

function getConfig() {
  const defaults = {
    mercado_pago_access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-7458996510149615-110903-8738600b8589a9741d32a85a8040d38b-408387365",
    product_title: "Faça sua série animada e ganhe com isso",
    product_price: 9.90
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body || '{}');
      } catch (err) {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const cpf = (body.cpf || '11067115803').replace(/\D/g, '') || '11067115803';

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const config = getConfig();
    const token = (config.mercado_pago_access_token || '').trim();
    const price = Number(config.product_price || 9.90);
    const title = config.product_title || 'Série Animada do Zero';

    const parts = name.split(/\s+/);
    const firstName = parts[0] || 'Cliente';
    const lastName = parts.slice(1).join(' ') || 'Comprador';

    const mpPayload = {
      transaction_amount: price,
      description: title,
      payment_method_id: 'pix',
      notification_url: 'https://lucasvideos.vercel.app/api/pix/webhook',
      metadata: {
        buyer_email: email,
        buyer_name: name
      },
      payer: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF',
          number: cpf.length === 11 ? cpf : '11067115803'
        }
      }
    };

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': randomUUID(),
        'User-Agent': 'Vercel-Checkout-Pix/1.0'
      },
      body: JSON.stringify(mpPayload)
    });

    const respData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago Error:', respData);
      let errMsg = respData.message || 'Erro ao gerar Pix no Mercado Pago.';
      if (respData.cause && respData.cause.length > 0) {
        errMsg += ` (${respData.cause[0].description || ''})`;
      }
      return res.status(mpRes.status).json({ error: errMsg, details: respData });
    }

    const poi = respData.point_of_interaction?.transaction_data || {};
    return res.status(200).json({
      success: true,
      demo: false,
      payment_id: String(respData.id),
      qr_code: poi.qr_code || '',
      qr_code_base64: poi.qr_code_base64 || '',
      is_svg: false,
      amount: price,
      status: respData.status
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
