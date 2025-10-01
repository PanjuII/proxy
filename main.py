# Run this on your computer (requires Python)
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/forward', methods=['GET'])
def forward_webhook():
    message = request.args.get('msg', 'No message')
    webhook_url = "https://discord.com/api/webhooks/1420743329427095655/QHVBlqQ75duNs2pkq5OBU0EXK9uFmBAdMLDXiLUmv6XnB6GqJZG0V_bD99W5-Nii4Y_b"
    
    data = {"content": f"From Delta: {message}"}
    requests.post(webhook_url, json=data)
    return "Message forwarded!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
