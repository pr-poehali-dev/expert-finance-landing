"""Получение актуальной ключевой ставки ЦБ РФ через SOAP API."""

import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        soap_url = "https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx"
        soap_body = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <KeyRate xmlns="http://web.cbr.ru/">
      <fromDate>2020-01-01</fromDate>
      <ToDate>{today}</ToDate>
    </KeyRate>
  </soap:Body>
</soap:Envelope>"""

        soap_req = urllib.request.Request(
            soap_url,
            data=soap_body.encode("utf-8"),
            headers={
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://web.cbr.ru/KeyRate",
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urllib.request.urlopen(soap_req, timeout=10) as resp:
            soap_data = resp.read().decode("utf-8")

        root = ET.fromstring(soap_data)

        # Собираем все записи (дата + ставка) из элементов KR
        records = []
        for elem in root.iter():
            tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
            if tag == "KR":
                dt_val = None
                rate_val = None
                for child in elem:
                    child_tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
                    if child_tag == "DT":
                        dt_val = child.text
                    elif child_tag == "Rate":
                        rate_val = child.text
                if dt_val and rate_val:
                    try:
                        records.append((dt_val, float(rate_val.replace(",", "."))))
                    except Exception:
                        pass

        if not records:
            raise ValueError("Не найдено записей о ключевой ставке")

        records.sort(key=lambda x: x[0])
        last_date, key_rate = records[-1]

        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({"key_rate": key_rate, "date": last_date, "source": "cbr.ru"}),
        }

    except Exception as e:
        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({"key_rate": 21.0, "source": "fallback", "error": str(e)}),
        }