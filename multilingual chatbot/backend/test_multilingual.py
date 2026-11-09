import requests
import json

# Test data for different languages
test_cases = [
    {"user_id": "test123", "message": "मैं चिंतित हूं", "language": "hi", "lang_name": "Hindi"},
    {"user_id": "test123", "message": "ನಾನು ಚಿಂತೆಯಲ್ಲಿದ್ದೇನೆ", "language": "kn", "lang_name": "Kannada"},
    {"user_id": "test123", "message": "நான் கவலையில் இருக்கிறேன்", "language": "ta", "lang_name": "Tamil"},
    {"user_id": "test123", "message": "నేను ఆందోళనలో ఉన్నాను", "language": "te", "lang_name": "Telugu"},
    {"user_id": "test123", "message": "ഞാൻ ആശങ്കയിലാണ്", "language": "ml", "lang_name": "Malayalam"},
    {"user_id": "test123", "message": "আমি চিন্তিত", "language": "bn", "lang_name": "Bengali"},
    {"user_id": "test123", "message": "أنا قلق", "language": "ar", "lang_name": "Arabic"},
    {"user_id": "test123", "message": "Estoy preocupado", "language": "es", "lang_name": "Spanish"},
    {"user_id": "test123", "message": "Je suis inquiet", "language": "fr", "lang_name": "French"}
]

print("Testing Multilingual Sentiment Analysis with Native Scripts")
print("=" * 60)

for test_case in test_cases:
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat",
            json=test_case,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            sentiment = data.get("metadata", {}).get("sentiment", {})
            emotional_state = sentiment.get("emotional_state", "unknown")
            sentiment_score = sentiment.get("sentiment_score", 0)
            
            print(f"[SUCCESS] {test_case['lang_name']}: '{test_case['message']}'")
            print(f"   Emotional State: {emotional_state}")
            print(f"   Sentiment Score: {sentiment_score}")
            print(f"   Response: {data.get('reply', '')[:100]}...")
            print()
        else:
            print(f"[ERROR] {test_case['lang_name']}: Error {response.status_code}")
            print(f"   Response: {response.text}")
            print()
            
    except Exception as e:
        print(f"[ERROR] {test_case['lang_name']}: Exception - {str(e)}")
        print()

print("Multilingual sentiment analysis test completed!")
