import json
import os
import base64
import uuid
import boto3
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Content-Type': 'application/json',
}

ADMIN_PASSWORD = "Aa346500"


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def handler(event: dict, context) -> dict:
    """Управление документами КПК: список, загрузка, удаление (для админки)."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')

    # GET /documents — публичный список документов
    if method == 'GET':
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, title, file_url, file_size, file_type, icon, sort_order FROM documents ORDER BY sort_order ASC, created_at ASC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        docs = [
            {"id": r[0], "title": r[1], "file_url": r[2], "file_size": r[3], "file_type": r[4], "icon": r[5], "sort_order": r[6]}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({"documents": docs})}

    body = json.loads(event.get('body') or '{}')
    token = event.get('headers', {}).get('X-Admin-Token', '')

    if token != ADMIN_PASSWORD:
        return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({"error": "Forbidden"})}

    # POST /documents — загрузка нового документа
    if method == 'POST':
        title = body.get('title', 'Документ')
        file_b64 = body.get('file_base64', '')
        file_name = body.get('file_name', 'document.pdf')
        file_type = body.get('file_type', 'PDF')
        icon = body.get('icon', 'FileText')
        sort_order = body.get('sort_order', 0)

        file_data = base64.b64decode(file_b64)
        file_size_bytes = len(file_data)
        if file_size_bytes < 1024 * 1024:
            file_size = f"{round(file_size_bytes / 1024, 1)} КБ"
        else:
            file_size = f"{round(file_size_bytes / (1024 * 1024), 1)} МБ"

        ext = file_name.rsplit('.', 1)[-1] if '.' in file_name else 'pdf'
        key = f"documents/{uuid.uuid4()}.{ext}"

        s3 = get_s3()
        s3.put_object(Bucket='files', Key=key, Body=file_data, ContentType='application/pdf')
        file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO documents (title, file_url, file_size, file_type, icon, sort_order) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (title, file_url, file_size, file_type, icon, sort_order)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({"id": new_id, "file_url": file_url})}

    # DELETE /documents — удаление документа
    if method == 'DELETE':
        doc_id = body.get('id')
        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({"ok": True})}

    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({"error": "Method not allowed"})}