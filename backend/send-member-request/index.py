import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

TO_EMAIL = "info@sll-expert.ru"


def handler(event: dict, context) -> dict:
    """Отправка заявки на вступление в КПК на email."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    fio = body.get('fio', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    source_url = body.get('source_url', 'не указан')

    if not fio or not phone or not email:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({"error": "Заполните все поля"})}

    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Новая заявка на вступление в КПК «Эксперт Финанс»'
    msg['From'] = smtp_user
    msg['To'] = TO_EMAIL

    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px;">
      <div style="background: linear-gradient(135deg, #e63329, #c2251b); padding: 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0;">Новая заявка на вступление в КПК</h2>
      </div>
      <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #64748b; width: 140px;">ФИО:</td>
            <td style="padding: 10px 0; font-weight: bold;">{fio}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Телефон:</td>
            <td style="padding: 10px 0; font-weight: bold;">{phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Email:</td>
            <td style="padding: 10px 0; font-weight: bold;">{email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Источник:</td>
            <td style="padding: 10px 0;">{source_url}</td>
          </tr>
        </table>
      </div>
    </body></html>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL(smtp_host, 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, TO_EMAIL, msg.as_string())

    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({"ok": True})}
