import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

TO_EMAIL = "info@sll-expert.ru"

INTEREST_MAP = {
    "Получить займ": ("💳 Займ", "Клиент хочет получить займ"),
    "Открыть сберегательный счет": ("💰 Сбережения", "Клиент хочет открыть сберегательный счёт"),
    "Открыть счет сейчас": ("💰 Сбережения (калькулятор)", "Клиент воспользовался калькулятором и хочет открыть счёт"),
    "Стать пайщиком": ("👤 Вступление в КПК", "Клиент хочет стать пайщиком кооператива"),
    "Получить консультацию": ("📞 Консультация", "Клиент хочет получить консультацию по кредитным программам"),
    "Стать членом кооператива": ("👥 Вступление в кооператив", "Клиент хочет стать членом кооператива"),
    "Подать заявку": ("📋 Заявка на займ", "Клиент подаёт заявку на займ"),
}


def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта КПК на email менеджеру с подробным указанием источника."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    fio = body.get('fio', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    source_url = body.get('source_url', 'не указан')
    button_label = body.get('button_label', 'Не указано')
    button_source = body.get('button_source', '')

    if not fio or not phone or not email:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({"error": "Заполните все поля"})}

    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    interest_icon, interest_desc = INTEREST_MAP.get(button_label, ("📩 Заявка", f"Кнопка: {button_label}"))
    section_label = button_source if button_source else "не указан"
    now = datetime.now().strftime("%d.%m.%Y в %H:%M")

    subject = f"{interest_icon} Новая заявка — {button_label} | КПК «Эксперт Финанс»"

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = TO_EMAIL

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 620px; margin: 0 auto;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #e63329, #c2251b); padding: 28px 32px; border-radius: 16px 16px 0 0;">
        <div style="font-size: 28px; margin-bottom: 4px;">{interest_icon}</div>
        <h2 style="color: white; margin: 0 0 4px 0; font-size: 20px;">Новая заявка с сайта</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">КПК «Эксперт Финанс» · {now}</p>
      </div>

      <!-- Interest block -->
      <div style="background: #fff8f8; padding: 16px 32px; border-left: 4px solid #c2251b; margin: 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">Интерес клиента:</p>
        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: bold; color: #c2251b;">{interest_desc}</p>
      </div>

      <!-- Client data -->
      <div style="background: #f8fafc; padding: 24px 32px; border: 1px solid #e2e8f0; border-top: none;">
        <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Данные клиента</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 0; color: #64748b; width: 160px; font-size: 14px;">ФИО</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 15px;">{fio}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Телефон</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 15px;">
              <a href="tel:{phone}" style="color: #c2251b; text-decoration: none;">{phone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Email</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 15px;">
              <a href="mailto:{email}" style="color: #c2251b; text-decoration: none;">{email}</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Source block -->
      <div style="background: #f1f5f9; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
        <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Откуда пришла заявка</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 160px; font-size: 13px;">Кнопка</td>
            <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #374151;">«{button_label}»</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Раздел сайта</td>
            <td style="padding: 6px 0; font-size: 13px; color: #374151;">{section_label}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">URL страницы</td>
            <td style="padding: 6px 0; font-size: 13px;">
              <a href="{source_url}" style="color: #64748b;">{source_url}</a>
            </td>
          </tr>
        </table>
      </div>

    </body>
    </html>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL(smtp_host, 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, TO_EMAIL, msg.as_string())

    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({"ok": True})}
