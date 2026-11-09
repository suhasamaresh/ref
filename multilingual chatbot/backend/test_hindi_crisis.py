import requests
import json

# Test with crisis message in Hindi
test_data = {
    "user_id": "test123", 
    "message": "मैं हार मान रहा हूं",  # "I am giving up" in Hindi
    "language": "hi"
}

print("Testing Hindi Crisis Detection:")
print("Message: I am giving up (in Hindi)")
print("=" * 40)

try:
    response = requests.post(
        "http://127.0.0.1:8000/chat",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        data = response.json()
        sentiment = data.get("metadata", {}).get("sentiment", {})
        
        print("SUCCESS!")
        print(f"Emotional State: {sentiment.get('emotional_state', 'unknown')}")
        print(f"Sentiment Score: {sentiment.get('sentiment_score', 0)}")
        print(f"Crisis Detected: {sentiment.get('crisis_detected', False)}")
        print(f"Response Preview: {data.get('reply', '')[:150]}...")
        
        # Check if crisis response was triggered
        reply = data.get('reply', '')
        if '[Crisis support]' in reply:
            print("\n✅ CRISIS SUPPORT TRIGGERED - Hindi crisis detection working!")
        else:
            print("\n❌ Crisis support not triggered")
            
    else:
        print(f"ERROR: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Exception: {str(e)}")

print("\n" + "=" * 40)
print("Test completed!")
