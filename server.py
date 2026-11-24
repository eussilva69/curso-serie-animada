import os
import sys
import json
import uuid
import smtplib
import urllib.request
import urllib.error
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 500
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
PAYMENTS_STORE_FILE = os.path.join(BASE_DIR, "payments_store.json")

# In-memory store for demo payments
demo_payments = {}

def load_config():
    default_config = {
        "mercado_pago_access_token": "",
        "mercado_pago_public_key": "",
        "product_title": "Faça sua série animada e ganhe com isso",
        "product_price": 9.90,
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 465,
        "smtp_user": "glcodingweb@gmail.com",
        "smtp_pass": "pazgfxmesdsdknuk",
        "tutorial_url": "https://youtu.be/xxJby0kUv08"
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                default_config.update(saved)
        except Exception as e:
            print("Erro ao carregar config.json:", e)
    return default_config

def save_config(new_config):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(new_config, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print("Erro ao salvar config.json:", e)
        return False

def load_payments_store():
    if os.path.exists(PAYMENTS_STORE_FILE):
        try:
            with open(PAYMENTS_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Erro ao carregar payments_store.json:", e)
    return {}

def save_payments_store(store):
    try:
        with open(PAYMENTS_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(store, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Erro ao salvar payments_store.json:", e)

def send_tutorial_email(buyer_email, buyer_name, tutorial_url):
    config = load_config()
    smtp_host = config.get("smtp_host", "smtp.gmail.com")
    smtp_port = int(config.get("smtp_port", 465))
    smtp_user = config.get("smtp_user", "glcodingweb@gmail.com")
    smtp_pass = config.get("smtp_pass", "pazgfxmesdsdknuk")
    title = config.get("product_title", "Série Animada do Zero")

    if not smtp_user or not smtp_pass or not buyer_email:
        print("[EMAIL] Falha: credenciais SMTP ou e-mail do comprador ausente.")
        return False

    display_name = buyer_name.strip() if buyer_name else "Aluno(a)"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🎉 Seu Acesso Chegou: {title} (Tutorial Completo)"
    msg["From"] = f"{title} <{smtp_user}>"
    msg["To"] = buyer_email

    # Plain text version
    text_content = f"""Olá, {display_name}!

O seu pagamento via Pix de R$ 9,90 foi confirmado com sucesso!

Aqui está o seu link de acesso com todas as vídeo aulas e materiais da {title}:
{tutorial_url}

Conteúdo incluído:
- Curso Completo em Vídeo Aulas práticas na tela
- Kit de prompts prontos para copiar e colar
- Método completo: do tema ao episódio no TikTok/Instagram

Qualquer dúvida ou suporte, basta responder a este e-mail.

Bons estudos e sucesso na sua série!
Equipe {title} · @caio.deferias
"""

    # HTML version with stylish cartoon/retro identity
    html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF7F2; margin: 0; padding: 20px; color: #16131F; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 3px solid #16131F; border-radius: 18px; box-shadow: 6px 6px 0px #16131F; padding: 30px 24px; }}
    .badge {{ display: inline-block; background: #20A5A0; color: #ffffff; font-weight: 800; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; margin-bottom: 14px; }}
    h1 {{ font-size: 26px; margin: 0 0 12px 0; color: #16131F; line-height: 1.2; }}
    p {{ font-size: 16px; line-height: 1.5; margin: 0 0 16px 0; color: #333333; }}
    .highlight-box {{ background: #FFE3EC; border: 2px dashed #FF5D8F; border-radius: 12px; padding: 14px; margin: 20px 0; text-align: center; }}
    .btn {{ display: inline-block; background: #FF5D8F; color: #ffffff !important; text-decoration: none; font-size: 18px; font-weight: 800; padding: 16px 28px; border: 3px solid #16131F; border-radius: 12px; box-shadow: 4px 4px 0px #16131F; margin: 10px 0; }}
    .footer {{ font-size: 13px; color: #777777; margin-top: 24px; border-top: 1px solid #E6E1EE; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Acesso Confirmado</span>
    <h1>Parabéns, {display_name}! 🎉</h1>
    <p>O seu pagamento de <b>R$ 9,90</b> via Pix foi confirmado instantaneamente.</p>
    <p>O seu acesso ao curso completo em vídeo aulas e materiais da <b>{title}</b> já está liberado:</p>
    
    <div class="highlight-box">
      <p style="margin-bottom: 8px; font-weight: bold; font-size: 15px;">👇 Clique no botão abaixo para acessar:</p>
      <a href="{tutorial_url}" class="btn" target="_blank">👉 ACESSAR AS VÍDEO AULAS AGORA</a>
      <p style="font-size: 12px; color: #666; margin-top: 8px;">Ou acesse diretamente pelo link:<br><a href="{tutorial_url}" style="color:#20A5A0; word-break: break-all;">{tutorial_url}</a></p>
    </div>

    <p><b>O que você vai encontrar:</b></p>
    <ul style="padding-left: 20px; font-size: 15px; line-height: 1.6;">
      <li>11 módulos em vídeo aulas práticas passo a passo</li>
      <li>Kit completo de prompts prontos para copiar e colar</li>
      <li>Método completo para criar sua série 2D com Claude e ElevenLabs</li>
    </ul>

    <div class="footer">
      Dúvidas? Basta responder a esta mensagem.<br>
      <b>{title}</b> · @caio.deferias
    </div>
  </div>
</body>
</html>
"""

    msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print(f"[EMAIL] Sucesso: tutorial enviado para {buyer_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] Erro ao enviar para {buyer_email}:", e)
        return False

# Simple SVG QR code placeholder in base64 for demo mode
DEMO_QR_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#ffffff" rx="12"/>
  <rect x="20" y="20" width="50" height="50" fill="#16131f" rx="6"/>
  <rect x="30" y="30" width="30" height="30" fill="#ffffff" rx="3"/>
  <rect x="37" y="37" width="16" height="16" fill="#16131f"/>
  <rect x="130" y="20" width="50" height="50" fill="#16131f" rx="6"/>
  <rect x="140" y="30" width="30" height="30" fill="#ffffff" rx="3"/>
  <rect x="147" y="37" width="16" height="16" fill="#16131f"/>
  <rect x="20" y="130" width="50" height="50" fill="#16131f" rx="6"/>
  <rect x="30" y="140" width="30" height="30" fill="#ffffff" rx="3"/>
  <rect x="37" y="147" width="16" height="16" fill="#16131f"/>
  <rect x="85" y="25" width="28" height="14" fill="#20a5a0"/>
  <rect x="85" y="50" width="14" height="25" fill="#16131f"/>
  <rect x="105" y="55" width="14" height="14" fill="#ff5d8f"/>
  <rect x="25" y="85" width="14" height="28" fill="#16131f"/>
  <rect x="50" y="90" width="25" height="14" fill="#ff5d8f"/>
  <rect x="85" y="85" width="30" height="30" fill="#16131f" rx="4"/>
  <rect x="125" y="85" width="20" height="15" fill="#20a5a0"/>
  <rect x="155" y="90" width="25" height="20" fill="#16131f"/>
  <rect x="85" y="125" width="20" height="25" fill="#16131f"/>
  <rect x="120" y="120" width="25" height="20" fill="#ff5d8f"/>
  <rect x="150" y="125" width="25" height="25" fill="#16131f"/>
  <rect x="85" y="160" width="45" height="18" fill="#20a5a0"/>
  <rect x="140" y="160" width="40" height="18" fill="#16131f"/>
</svg>'''

DEMO_QR_BASE64 = base64.b64encode(DEMO_QR_SVG.encode("utf-8")).decode("utf-8")

class CheckoutHandler(SimpleHTTPRequestHandler):
    def send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/config"):
            config = load_config()
            has_token = bool(config.get("mercado_pago_access_token", "").strip())
            token_val = config.get("mercado_pago_access_token", "").strip()
            preview = f"{token_val[:7]}...{token_val[-4:]}" if len(token_val) > 12 else ("Configurado" if token_val else "")
            return self.send_json(200, {
                "has_token": has_token,
                "token_preview": preview,
                "product_price": config.get("product_price", 9.90),
                "product_title": config.get("product_title", "Série Animada do Zero"),
                "tutorial_url": config.get("tutorial_url", "")
            })

        if self.path.startswith("/api/pix/status"):
            import urllib.parse
            parsed = urllib.parse.urlparse(self.path)
            qs = urllib.parse.parse_qs(parsed.query)
            payment_id = qs.get("id", [""])[0]

            if not payment_id:
                return self.send_json(400, {"error": "Parâmetro 'id' é obrigatório"})

            config = load_config()
            tutorial_url = config.get("tutorial_url", "")
            payments_store = load_payments_store()

            # Check demo payments first
            if payment_id in demo_payments:
                p_data = demo_payments[payment_id]
                status = p_data["status"]
                email_sent = p_data.get("email_sent", False)
                if status == "approved" and not email_sent:
                    send_tutorial_email(p_data.get("email"), p_data.get("name"), tutorial_url)
                    p_data["email_sent"] = True
                return self.send_json(200, {
                    "id": payment_id,
                    "status": status,
                    "tutorial_url": tutorial_url,
                    "email_sent": p_data.get("email_sent", False),
                    "demo": True
                })

            token = config.get("mercado_pago_access_token", "").strip()
            if not token:
                return self.send_json(200, {"id": payment_id, "status": "pending", "demo": True})

            # Check with Mercado Pago API
            try:
                url = f"https://api.mercadopago.com/v1/payments/{payment_id}"
                req = urllib.request.Request(url, headers={
                    "Authorization": f"Bearer {token}",
                    "User-Agent": "Checkout-Pix-Site/1.0"
                })
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    status = data.get("status") # approved, pending, rejected, etc.
                    
                    email_sent = False
                    p_info = payments_store.get(str(payment_id), {})
                    buyer_email = p_info.get("email") or data.get("payer", {}).get("email")
                    buyer_name = p_info.get("name") or (data.get("payer", {}).get("first_name", "") + " " + data.get("payer", {}).get("last_name", "")).strip()

                    # IF APPROVED: Trigger automatic email sending once
                    if status == "approved":
                        if not p_info.get("email_sent", False):
                            print(f"[STATUS] Pagamento {payment_id} aprovado! Disparando envio de e-mail...")
                            email_ok = send_tutorial_email(buyer_email, buyer_name, tutorial_url)
                            p_info["email_sent"] = True
                            p_info["status"] = "approved"
                            payments_store[str(payment_id)] = p_info
                            save_payments_store(payments_store)
                            email_sent = True
                        else:
                            email_sent = True

                    return self.send_json(200, {
                        "id": data.get("id"),
                        "status": status,
                        "status_detail": data.get("status_detail"),
                        "tutorial_url": tutorial_url,
                        "email_sent": email_sent,
                        "demo": False
                    })
            except urllib.error.HTTPError as e:
                # Keep status as pending during temporary processing
                return self.send_json(200, {"id": payment_id, "status": "pending", "demo": False})
            except Exception as e:
                return self.send_json(200, {"id": payment_id, "status": "pending", "demo": False, "err": str(e)})

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            body = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            body = {}

        if self.path == "/api/config":
            config = load_config()
            if "mercado_pago_access_token" in body:
                config["mercado_pago_access_token"] = body["mercado_pago_access_token"].strip()
            if "tutorial_url" in body:
                config["tutorial_url"] = body["tutorial_url"].strip()
            save_config(config)
            return self.send_json(200, {
                "success": True,
                "has_token": bool(config.get("mercado_pago_access_token", "").strip()),
                "tutorial_url": config.get("tutorial_url", "")
            })

        if self.path == "/api/pix/simulate-approve":
            payment_id = body.get("id", "")
            config = load_config()
            tutorial_url = config.get("tutorial_url", "")
            if payment_id in demo_payments:
                p_data = demo_payments[payment_id]
                p_data["status"] = "approved"
                if not p_data.get("email_sent", False):
                    send_tutorial_email(p_data.get("email"), p_data.get("name"), tutorial_url)
                    p_data["email_sent"] = True
                return self.send_json(200, {"success": True, "status": "approved", "email_sent": True})
            return self.send_json(404, {"error": "Pagamento não encontrado"})

        if self.path == "/api/pix/create":
            name = body.get("name", "").strip()
            email = body.get("email", "").strip()
            cpf = "".join(filter(str.isdigit, body.get("cpf", "11067115803"))) or "11067115803"

            if not name or not email:
                return self.send_json(400, {"error": "Nome e e-mail são obrigatórios."})

            config = load_config()
            token = config.get("mercado_pago_access_token", "").strip()
            price = float(config.get("product_price", 9.90))
            title = config.get("product_title", "Série Animada do Zero")

            parts = name.split()
            first_name = parts[0] if parts else "Cliente"
            last_name = " ".join(parts[1:]) if len(parts) > 1 else "Comprador"

            # Demo Pix if no token
            if not token:
                fake_id = f"demo_{uuid.uuid4().hex[:10]}"
                demo_pix_code = f"00020126580014br.gov.bcb.pix0136{uuid.uuid4()}52040000530398654049.905802BR5916SERIE ANIMADA6009SAO PAULO62070503***6304E6A1"
                demo_payments[fake_id] = {
                    "id": fake_id,
                    "status": "pending",
                    "email": email,
                    "name": name,
                    "amount": price,
                    "email_sent": False
                }
                return self.send_json(200, {
                    "success": True,
                    "demo": True,
                    "payment_id": fake_id,
                    "qr_code": demo_pix_code,
                    "qr_code_base64": DEMO_QR_BASE64,
                    "is_svg": True,
                    "amount": price,
                    "message": "Modo Demonstração"
                })

            # Real Mercado Pago API Call
            mp_payload = {
                "transaction_amount": price,
                "description": title,
                "payment_method_id": "pix",
                "payer": {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "identification": {
                        "type": "CPF",
                        "number": cpf if len(cpf) == 11 else "00000000000"
                    }
                }
            }

            try:
                req = urllib.request.Request(
                    "https://api.mercadopago.com/v1/payments",
                    data=json.dumps(mp_payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                        "X-Idempotency-Key": str(uuid.uuid4()),
                        "User-Agent": "Site-Checkout-Pix/1.0"
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    poi = resp_data.get("point_of_interaction", {}).get("transaction_data", {})
                    qr_code = poi.get("qr_code", "")
                    qr_code_base64 = poi.get("qr_code_base64", "")
                    payment_id = str(resp_data.get("id"))

                    # Save buyer info to store so status check knows where to send email
                    payments_store = load_payments_store()
                    payments_store[payment_id] = {
                        "email": email,
                        "name": name,
                        "amount": price,
                        "status": resp_data.get("status"),
                        "email_sent": False
                    }
                    save_payments_store(payments_store)

                    return self.send_json(200, {
                        "success": True,
                        "demo": False,
                        "payment_id": payment_id,
                        "qr_code": qr_code,
                        "qr_code_base64": qr_code_base64,
                        "is_svg": False,
                        "amount": price,
                        "status": resp_data.get("status")
                    })
            except urllib.error.HTTPError as e:
                err_text = e.read().decode("utf-8")
                print("Mercado Pago API error:", err_text)
                user_msg = "Erro ao comunicar com Mercado Pago."
                try:
                    err_json = json.loads(err_text)
                    if "message" in err_json:
                        user_msg = err_json["message"]
                    if "cause" in err_json and isinstance(err_json["cause"], list) and len(err_json["cause"]) > 0:
                        user_msg += " (" + err_json["cause"][0].get("description", "") + ")"
                except Exception:
                    pass
                return self.send_json(e.code, {
                    "error": user_msg,
                    "details": err_text
                })
            except Exception as e:
                print("Exception:", e)
                return self.send_json(500, {"error": str(e)})

        self.send_error(404, "Not Found")

def run(port=PORT):
    os.chdir(BASE_DIR)
    server = ThreadingHTTPServer(("0.0.0.0", port), CheckoutHandler)
    print(f"Servidor rodando em http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(p)
