"""
Quick script to check if all required dependencies are installed.
"""
import sys

missing = []
optional = []

# Required dependencies
required = {
    "fastapi": "FastAPI framework",
    "uvicorn": "ASGI server",
    "sqlalchemy": "Database ORM",
    "pydantic": "Data validation",
    "jose": "JWT authentication",
    "passlib": "Password hashing",
    "aiofiles": "Async file operations",
    "httpx": "HTTP client",
}

# Optional dependencies
optional_deps = {
    "prometheus_client": "Metrics (optional)",
    "redis": "Caching (optional)",
    "pinecone": "Vector DB (optional)",
}

print("Checking dependencies...")
print("=" * 50)

for module, description in required.items():
    try:
        if module == "jose":
            __import__("jose")
        elif module == "passlib":
            __import__("passlib")
        else:
            __import__(module)
        print(f"[OK] {module:20} - {description}")
    except ImportError:
        print(f"[MISSING] {module:20} - {description}")
        missing.append(module)

for module, description in optional_deps.items():
    try:
        __import__(module)
        print(f"[OK] {module:20} - {description}")
    except ImportError:
        print(f"[OPTIONAL] {module:20} - {description} - Not installed")

print("=" * 50)

if missing:
    print(f"\n[WARNING] Missing {len(missing)} required dependency(ies):")
    for m in missing:
        print(f"  - {m}")
    print("\nTo install missing dependencies, run:")
    print("  pip install -r requirements.txt")
    sys.exit(1)
else:
    print("\n[SUCCESS] All required dependencies are installed!")
    print("\nTo test if the server can start, run:")
    print("  uvicorn app.main:app --host 0.0.0.0 --port 8000")
    sys.exit(0)

