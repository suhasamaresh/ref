import os
import json
import requests
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse

class SimpleChatbotHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                message = data.get('message', '')
                language = data.get('language', 'auto')
                
                # Call Gemini API
                api_key = os.environ.get("GEMINI_API_KEY", "")
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
                
                payload = {
                    "contents": [{"parts": [{"text": f"Reply to this in {language}. You are a helpful assistant for refugees. Message: {message}"}]}]
                }
                
                resp = requests.post(gemini_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
                resp_json = resp.json()
                
                try:
                    reply = resp_json['candidates'][0]['content']['parts'][0]['text']
                except Exception as e:
                    reply = f"Error from Gemini: {resp.text}"
                
                response_data = {
                    "reply": reply,
                    "language": language
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run(server_class=HTTPServer, handler_class=SimpleChatbotHandler, port=8000):
    server_address = ('127.0.0.1', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting lightweight mock server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
