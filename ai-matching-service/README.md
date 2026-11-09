# AI-Powered Resource Matching Service

This Flask app provides a real AI-powered matching API for the Refugee Aid App. It uses sentence-transformers to embed user profiles and resources, and computes semantic similarity for personalized matching.

## Features
- Embeds user profile and resource descriptions using a pre-trained transformer (e.g., all-MiniLM-L6-v2)
- Computes cosine similarity to rank resources for each user
- REST API endpoint: `/match` (POST)

## Requirements
- Python 3.8+
- pip install -r requirements.txt

## .env Example
```
# No API key needed for local embedding
MODEL_NAME=all-MiniLM-L6-v2
```

## Usage
1. Start the Flask app: `python app.py`
2. POST to `/match` with user profile and resources JSON.

---

**app.py**
```python
import os
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import numpy as np

app = Flask(__name__)
MODEL_NAME = os.getenv('MODEL_NAME', 'all-MiniLM-L6-v2')
model = SentenceTransformer(MODEL_NAME)

@app.route('/match', methods=['POST'])
def match():
    data = request.json
    user_profile = data.get('user')
    resources = data.get('resources', [])
    if not user_profile or not resources:
        return jsonify({'success': False, 'message': 'Missing user or resources'}), 400

    # Combine user fields for embedding
    user_text = ' '.join([
        user_profile.get('name', ''),
        ' '.join(user_profile.get('skills', [])),
        ' '.join(user_profile.get('interests', [])),
        ' '.join(user_profile.get('needs', [])),
        user_profile.get('location', ''),
        user_profile.get('language', ''),
    ])
    user_emb = model.encode(user_text, convert_to_tensor=True)

    # Embed and score resources
    scored = []
    for r in resources:
        resource_text = ' '.join([
            r.get('title', ''),
            r.get('description', ''),
            ' '.join(r.get('tags', [])),
            r.get('type', ''),
            r.get('eligibility', ''),
        ])
        res_emb = model.encode(resource_text, convert_to_tensor=True)
        score = util.pytorch_cos_sim(user_emb, res_emb).item()
        scored.append({'resource': r, 'score': score})

    # Sort by score descending
    scored.sort(key=lambda x: x['score'], reverse=True)
    top_resources = [x['resource'] for x in scored[:20]]
    return jsonify({'success': True, 'matches': top_resources})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

---

**requirements.txt**
```
flask
sentence-transformers
numpy
```

---

You can deploy this Flask app, call it from your Node backend, and get real AI-powered resource matches. Let me know if you want integration code for your backend or frontend.