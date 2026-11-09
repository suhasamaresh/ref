"""
Test script to verify .env file is being loaded correctly
"""
import os
from pathlib import Path

print("Testing .env file loading...")
print("=" * 50)

# Check if file exists
env_path = Path(__file__).parent / '.env'
print(f"\n1. .env file exists: {env_path.exists()}")
if env_path.exists():
    print(f"   Location: {env_path}")

# Try loading with dotenv
try:
    from dotenv import load_dotenv
    print(f"\n2. python-dotenv installed: Yes")
    
    # Load the file
    result = load_dotenv(env_path)
    print(f"3. load_dotenv() result: {result}")
    
    # Check if key is loaded
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print(f"\n4. OPENAI_API_KEY loaded: Yes")
        print(f"   Preview: {api_key[:20]}...")
        print(f"   Length: {len(api_key)} characters")
        if api_key.startswith("sk-"):
            print(f"   Format: Correct (starts with sk-)")
        else:
            print(f"   Format: Warning (doesn't start with sk-)")
    else:
        print(f"\n4. OPENAI_API_KEY loaded: No")
        print(f"   File content:")
        if env_path.exists():
            with open(env_path, 'r') as f:
                content = f.read().strip()
                print(f"   '{content}'")
                if "OPENAI_API_KEY" in content:
                    print(f"   Error: Key name found but value not loaded!")
                    print(f"   Check for spaces or formatting issues")
        
except ImportError:
    print(f"\n2. python-dotenv installed: No")
    print(f"   Install with: pip install python-dotenv")

print("\n" + "=" * 50)

