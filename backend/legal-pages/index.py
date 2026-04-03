import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Content-Type': 'application/json',
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p68343413_expert_finance_landi')
ADMIN_TOKEN = "Aa346500"


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """GET — получить страницу по slug, POST — сохранить контент страницы (требует X-Admin-Token)."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        slug = params.get('slug')
        conn = get_conn()
        cur = conn.cursor()
        if slug:
            cur.execute(f"SELECT slug, title, content, updated_at FROM {SCHEMA}.legal_pages WHERE slug = %s", (slug,))
            row = cur.fetchone()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({
                'slug': row[0], 'title': row[1], 'content': row[2],
                'updated_at': str(row[3])
            })}
        else:
            cur.execute(f"SELECT slug, title, updated_at FROM {SCHEMA}.legal_pages ORDER BY slug")
            rows = cur.fetchall()
            conn.close()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps([
                {'slug': r[0], 'title': r[1], 'updated_at': str(r[2])} for r in rows
            ])}

    if method == 'POST':
        token = (event.get('headers') or {}).get('x-admin-token', '')
        if ADMIN_TOKEN and token != ADMIN_TOKEN:
            return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}

        body = json.loads(event.get('body') or '{}')
        slug = body.get('slug', '').strip()
        title = body.get('title', '').strip()
        content = body.get('content', '')

        if not slug or not title:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'slug and title required'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.legal_pages (slug, title, content, updated_at)
                VALUES (%s, %s, %s, NOW())
                ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW()""",
            (slug, title, content)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}