# AI Matching Service Setup Guide

## Overview
This service provides real-time, AI-powered resource matching for refugees and people in need. It searches the web for actual resources and ranks them by relevance using advanced language models.

## Features
- 🔍 Real-time web search for resources
- 🤖 AI-powered semantic ranking
- 🌍 Global resource discovery
- 📍 Location-based filtering
- 🏷️ 11 resource categories (Housing, Legal Aid, Healthcare, etc.)

## API Key Required

### Tavily API (Recommended - Free Tier Available)
1. Go to https://tavily.com/
2. Sign up for a free account
3. Get your API key (1000 free searches/month)
4. Add to `.env` file:
   ```
   TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxx
   ```

### Alternative: SerpAPI (Optional)
If you prefer Google search results:
1. Go to https://serpapi.com/
2. Sign up (100 free searches/month)
3. Get API key
4. Modify code to use SerpAPI instead of Tavily

## Installation

1. **Install Python dependencies:**
   ```bash
   cd ai-matching-service
   pip install -r requirements.txt
   ```

2. **Configure .env file:**
   ```bash
   MODEL_NAME=all-MiniLM-L6-v2
   TAVILY_API_KEY=your_actual_key_here
   ```

3. **Run the Flask service:**
   ```bash
   python app.py
   ```

## How It Works

### 1. User Flow
- User selects a category (Housing, Legal Aid, Healthcare, etc.)
- User enters their location
- Optional: Add specific search keywords

### 2. AI Processing
- Flask service receives the search request
- Calls Tavily API to search the web for relevant resources
- Uses sentence-transformers to embed and rank results
- Returns top 10 most relevant resources

### 3. Results Display
- Frontend shows real organizations and services
- Each result includes title, description, and clickable URL
- Results are ranked by AI-powered relevance score

## Models Used

### Current Model
- `all-MiniLM-L6-v2` - Fast, efficient, 384-dimensional embeddings

### Alternative Models (Better Quality)
You can swap in these Hugging Face models for better results:
- `sentence-transformers/multi-qa-mpnet-base-dot-v1` - Best for Q&A matching
- `sentence-transformers/all-mpnet-base-v2` - Higher quality, slower
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` - Multilingual support

To change model, update `.env`:
```
MODEL_NAME=sentence-transformers/multi-qa-mpnet-base-dot-v1
```

## API Endpoints

### GET /categories
Returns list of available resource categories
```json
{
  "success": true,
  "categories": [
    {"id": "housing", "name": "Housing & Shelter", "icon": "home"},
    ...
  ]
}
```

### POST /search
Search for real-world resources
```json
{
  "category": "housing",
  "location": "New York, USA",
  "query": "emergency shelter",
  "needs": ["temporary housing"]
}
```

Response:
```json
{
  "success": true,
  "results": [
    {
      "title": "Coalition for the Homeless",
      "description": "Provides emergency shelter and housing assistance...",
      "url": "https://www.coalitionforthehomeless.org",
      "score": 0.87
    }
  ]
}
```

## Troubleshooting

### No results found
- Check if Tavily API key is valid
- Verify location format (e.g., "City, Country")
- Try broader search terms

### Slow responses
- First search downloads the AI model (~100MB)
- Subsequent searches are faster
- Consider upgrading to smaller model for speed

### API key errors
- Ensure `.env` file is in `ai-matching-service/` directory
- Restart Flask app after changing `.env`
- Check API key quota on Tavily dashboard

## Cost & Limits

### Free Tier (Tavily)
- 1000 searches/month
- Advanced search depth
- No credit card required

### Paid Tier
- $49/month for 10,000 searches
- Priority support
- Higher rate limits

## Next Steps
- Add caching to reduce API calls
- Implement user feedback to improve rankings
- Add multilingual support
- Cache popular searches
