"""Test script to verify .env file loading"""
import os
from pathlib import Path

# Try loading .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    print(f"Looking for .env at: {env_path}")
    print(f".env file exists: {env_path.exists()}")
    
    if env_path.exists():
        load_dotenv(env_path)
        print("[OK] .env file loaded")
    else:
        print("[ERROR] .env file not found!")
        
    # Check if API key is loaded
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print(f"[OK] OPENAI_API_KEY is set")
        print(f"  Preview: {api_key[:15]}...")
        print(f"  Length: {len(api_key)} characters")
        if api_key.startswith("sk-"):
            print("  [OK] Format looks correct (starts with sk-)")
        else:
            print("  [ERROR] Format may be incorrect (should start with sk-)")
    else:
        print("[ERROR] OPENAI_API_KEY is NOT set")
        print("  Make sure your .env file contains:")
        print("  OPENAI_API_KEY=sk-your-actual-key-here")
        
except ImportError:
    print("[ERROR] python-dotenv not installed")
    print("  Install with: pip install python-dotenv")
except Exception as e:
    print(f"[ERROR] Error: {e}")

