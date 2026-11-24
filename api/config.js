import fs from 'fs';
import path from 'path';

function getConfig() {
  const defaults = {
    mercado_pago_access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-7458996510149615-110903-8738600b8589a9741d32a85a8040d38b-408387365",
    mercado_pago_public_key: process.env.MERCADO_PAGO_PUBLIC_KEY || "APP_USR-59d9f687-662c-4fc7-8c16-026ed86df6bc",
    product_title: "Faça sua série animada e ganhe com isso",
    product_price: 9.90,
    tutorial_url: "https://youtu.be/xxJby0kUv08"
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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const config = getConfig();
  const token = config.mercado_pago_access_token || '';
  const preview = token.length > 12 ? `${token.slice(0, 7)}...${token.slice(-4)}` : '';

  return res.status(200).json({
    has_token: !!token,
    token_preview: preview,
    product_price: config.product_price || 9.90,
    product_title: config.product_title || "Série Animada do Zero",
    tutorial_url: config.tutorial_url || "https://youtu.be/xxJby0kUv08"
  });
}
