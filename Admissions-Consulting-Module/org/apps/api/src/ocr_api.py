from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
import requests
from PIL import Image, ImageEnhance, ImageFilter
import time
import re
import os
from dotenv import load_dotenv

load_dotenv()  # load từ file .env

app = Flask(__name__)
CORS(app)

# =============== CONFIG AZURE COMPUTER VISION ===============

AZURE_OCR_KEY = os.getenv("NEXT_PUBLIC_AZURE_OCR_KEY")
AZURE_OCR_ENDPOINT = os.getenv("NEXT_PUBLIC_AZURE_OCR_ENDPOINT")

# =============== HÀM TRÍCH XUẤT DỮ LIỆU ===============
def extract_fields(raw_text):
    import re

    fields = {
        'name': '',
        'phone': '',
        'zalo': '',
        'email': '',
        'school': '',
        'favorite_major': ''
    }

    lines = raw_text.split('\n')
    print("==== DEBUG TEXT LINES ====")
    for line in lines:
        print(f"[LINE] {line}")

    for line in lines:
        lower_line = line.lower().strip()

        # Họ tên (thêm hỗ trợ dòng bắt đầu bằng số như '1. HO TÊN')
        if re.search(r'(họ[\s_]*tên|ho[\s_]*ten)', lower_line) or re.match(r'^\s*1\.\s*ho', lower_line):
            match = re.split(r':|-', line, 1)
            if len(match) > 1:
                fields['name'] = match[1].strip()
                print(f"[DETECTED] name = {fields['name']}")

        elif 'điện thoại' in lower_line or 'dien thoai' in lower_line:
            phone_match = re.search(r'0\d{8,10}', line)
            if phone_match:
                fields['phone'] = phone_match.group(0)
                print(f"[DETECTED] phone = {fields['phone']}")

        elif 'zalo' in lower_line:
            zalo_match = re.search(r'0\d{8,10}', line)
            if zalo_match:
                fields['zalo'] = zalo_match.group(0)
                print(f"[DETECTED] zalo = {fields['zalo']}")

        elif 'mail' in lower_line:
            email_match = re.search(r'[\w\.-]+@[\w\.-]+', line)
            if email_match:
                fields['email'] = email_match.group(0)
                print(f"[DETECTED] email = {fields['email']}")

        elif 'trường' in lower_line or 'truong' in lower_line:
            match = re.split(r':|-', line, 1)
            if len(match) > 1:
                fields['school'] = match[1].strip()
                print(f"[DETECTED] school = {fields['school']}")

        elif 'ngành' in lower_line and 'thích' in lower_line:
            match = re.split(r':|-', line, 1)
            if len(match) > 1:
                fields['favorite_major'] = match[1].strip()
                print(f"[DETECTED] favorite_major = {fields['favorite_major']}")

    return fields



# =============== OCR ROUTE ===============
@app.route('/ocr', methods=['POST'])
def ocr_route():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'Thiếu dữ liệu hình ảnh'}), 400

        # Decode ảnh từ base64
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)

        # Làm rõ ảnh
        image = Image.open(BytesIO(image_bytes)).convert("L")
        image = image.filter(ImageFilter.SHARPEN)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)

        buffered = BytesIO()
        image.save(buffered, format="PNG")
        image_bytes = buffered.getvalue()

        headers = {
            'Ocp-Apim-Subscription-Key': AZURE_OCR_KEY,
            'Content-Type': 'application/octet-stream'
        }

        # Gửi ảnh tới Azure OCR
        response = requests.post(
            AZURE_OCR_ENDPOINT + "/vision/v3.2/read/analyze",
            headers=headers,
            data=image_bytes
        )

        if response.status_code != 202:
            return jsonify({'error': 'Không thể gửi ảnh tới Azure OCR', 'status_code': response.status_code}), 500

        result_url = response.headers.get("Operation-Location")

        # Đợi Azure xử lý
        time.sleep(2)
        max_tries = 10
        tries = 0
        result_json = {}

        while tries < max_tries:
            result_response = requests.get(result_url, headers={'Ocp-Apim-Subscription-Key': AZURE_OCR_KEY})
            result_json = result_response.json()
            status = result_json.get("status")

            if status == "succeeded":
                break
            elif status == "failed":
                return jsonify({'error': 'OCR thất bại'}), 500

            time.sleep(1)
            tries += 1

        # Trích xuất văn bản
        lines = result_json["analyzeResult"]["readResults"]
        extracted_text = []
        for page in lines:
            for line in page["lines"]:
                extracted_text.append(line["text"])

        raw_text = "\n".join(extracted_text)
        structured_fields = extract_fields(raw_text)

        return jsonify({
            'text': raw_text,
            'fields': structured_fields
        })

    except Exception as e:
        print('OCR lỗi:', str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5001, debug=True)