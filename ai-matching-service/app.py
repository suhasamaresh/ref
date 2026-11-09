import os
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import numpy as np
from dotenv import load_dotenv
from tavily import TavilyClient
from identity_verification import IdentityVerificationML

load_dotenv()

app = Flask(__name__)
MODEL_NAME = os.getenv('MODEL_NAME', 'all-MiniLM-L6-v2')
TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')

model = SentenceTransformer(MODEL_NAME)
tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None
identity_verifier = IdentityVerificationML()

# Resource categories for refugees and people in need
RESOURCE_CATEGORIES = {
    'housing': ['emergency shelter', 'temporary housing', 'affordable housing', 'rental assistance'],
    'legal': ['immigration lawyer', 'legal aid', 'asylum assistance', 'document help'],
    'healthcare': ['free clinic', 'mental health services', 'medical care', 'vaccination'],
    'employment': ['job training', 'employment services', 'resume help', 'job placement'],
    'education': ['language classes', 'ESL', 'adult education', 'vocational training', 'school enrollment'],
    'food': ['food bank', 'free meals', 'food assistance', 'nutrition programs'],
    'financial': ['cash assistance', 'financial aid', 'emergency funds', 'grants'],
    'transportation': ['bus passes', 'transportation assistance', 'travel vouchers'],
    'childcare': ['daycare', 'child services', 'after school programs', 'family support'],
    'community': ['community center', 'support groups', 'cultural organizations', 'religious services'],
    'emergency': ['emergency assistance', 'crisis hotline', '24/7 support', 'immediate help']
}

@app.route('/search', methods=['POST'])
def search_resources():
    """Search for real-world resources using Tavily API and rank with AI"""
    data = request.json
    category = data.get('category', 'general')
    location = data.get('location', '')
    user_query = data.get('query', '')
    user_needs = data.get('needs', [])
    
    if not tavily_client:
        return jsonify({'success': False, 'message': 'Tavily API key not configured'}), 500
    
    # Build search query
    search_terms = []
    if category in RESOURCE_CATEGORIES:
        search_terms.extend(RESOURCE_CATEGORIES[category])
    if user_query:
        search_terms.append(user_query)
    if user_needs:
        search_terms.extend(user_needs)
    
    # Add location and refugee-specific terms
    query = f"refugee aid {category} resources for {' '.join(search_terms[:3])} in {location}" if location else f"refugee aid {category} resources {' '.join(search_terms[:3])}"
    
    try:
        # Search with Tavily
        search_results = tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=15,
            include_domains=["unhcr.org", "redcross.org", "rescue.org", ".gov", ".org"]
        )
        
        results = search_results.get('results', [])
        
        # Rank results with AI
        if results:
            user_context = f"{category} {user_query} {' '.join(user_needs)} {location}"
            user_emb = model.encode(user_context, convert_to_tensor=True)
            
            scored = []
            for result in results:
                result_text = f"{result.get('title', '')} {result.get('content', '')}"
                result_emb = model.encode(result_text, convert_to_tensor=True)
                score = util.pytorch_cos_sim(user_emb, result_emb).item()
                
                scored.append({
                    'title': result.get('title', ''),
                    'description': result.get('content', '')[:300],
                    'url': result.get('url', ''),
                    'score': float(score)
                })
            
            # Sort by relevance
            scored.sort(key=lambda x: x['score'], reverse=True)
            return jsonify({'success': True, 'results': scored[:10]})
        else:
            return jsonify({'success': True, 'results': [], 'message': 'No results found'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get available resource categories"""
    categories = [
        {'id': 'housing', 'name': 'Housing & Shelter', 'icon': 'home'},
        {'id': 'legal', 'name': 'Legal Aid', 'icon': 'gavel'},
        {'id': 'healthcare', 'name': 'Healthcare', 'icon': 'medical'},
        {'id': 'employment', 'name': 'Employment', 'icon': 'briefcase'},
        {'id': 'education', 'name': 'Education', 'icon': 'school'},
        {'id': 'food', 'name': 'Food Assistance', 'icon': 'restaurant'},
        {'id': 'financial', 'name': 'Financial Aid', 'icon': 'cash'},
        {'id': 'transportation', 'name': 'Transportation', 'icon': 'bus'},
        {'id': 'childcare', 'name': 'Childcare', 'icon': 'people'},
        {'id': 'community', 'name': 'Community Support', 'icon': 'people-circle'},
        {'id': 'emergency', 'name': 'Emergency Help', 'icon': 'alert-circle'}
    ]
    return jsonify({'success': True, 'categories': categories})

@app.route('/match', methods=['POST'])
def match():
    """Legacy endpoint for database matching"""
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

@app.route('/verify-document', methods=['POST'])
def verify_document():
    """AI-powered document verification"""
    data = request.json
    doc_type = data.get('type')
    doc_data = data.get('data', {})
    
    if not doc_type:
        return jsonify({'success': False, 'message': 'Document type required'}), 400
    
    try:
        result = identity_verifier.verify_document(doc_type, doc_data)
        return jsonify({
            'success': True,
            'verification': result
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/calculate-trust-score', methods=['POST'])
def calculate_trust_score():
    """Calculate user trust score using ML"""
    data = request.json
    user_data = data.get('user', {})
    
    if not user_data:
        return jsonify({'success': False, 'message': 'User data required'}), 400
    
    try:
        score_data = identity_verifier.calculate_trust_score(user_data)
        return jsonify({
            'success': True,
            'trust_score': score_data
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/kyc-check', methods=['POST'])
def kyc_check():
    """Perform KYC verification check"""
    data = request.json
    user_data = data.get('user', {})
    
    if not user_data:
        return jsonify({'success': False, 'message': 'User data required'}), 400
    
    try:
        kyc_status = identity_verifier.perform_kyc_check(user_data)
        return jsonify({
            'success': True,
            'kyc': kyc_status
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/summarize', methods=['POST'])
def summarize():
    """Simple summarization endpoint (prototype).
    Expects JSON: { "title": "...", "text": "...", "max_sentences": 2 }
    Returns: { success: True, summary: "..." }
    """
    data = request.json or {}
    text = data.get('text', '') or ''
    title = data.get('title', '') or ''
    max_sentences = int(data.get('max_sentences', 2))

    if not text:
        return jsonify({'success': False, 'message': 'text required'}), 400

    try:
        # Very lightweight summarization: return title + first N sentences from text
        # This is a placeholder — swap for an LLM or better summarizer in production
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        summary_sentences = sentences[:max_sentences]
        summary = (title + '. ' if title else '') + ' '.join(summary_sentences)
        # trim
        summary = summary.strip()
        return jsonify({'success': True, 'summary': summary})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    # Use port 8001 to avoid conflict with the multilingual chatbot FastAPI (which defaults to 8000)
    app.run(host='0.0.0.0', port=8001)
