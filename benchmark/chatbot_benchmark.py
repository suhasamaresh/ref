"""
Multilingual Chatbot Benchmark
-------------------------------
Produces REAL numbers for Table II: Multilingual Chatbot Performance Metrics
  - Language detection / response-language accuracy
  - Average response latency
  - Semantic similarity (if reference responses are provided)
  - Context retention (2-turn conversation test)

HOW TO RUN
  1. Start the chatbot service:
       cd "RefugeeAidApp/multilingual chatbot/backend"
       pip install -r requirements.txt
       OPENAI_API_KEY=sk-... python run_server.py

  2. Optional: fill in reference_response entries in chatbot_test_cases.json.

  3. Install benchmark dependencies:
       pip install requests langdetect sentence-transformers

  4. Run:
       python chatbot_benchmark.py
"""
import json
import os
import sys
import time
from pathlib import Path

import requests

BASE_URL = os.environ.get("CHATBOT_URL", "http://127.0.0.1:8000")
HERE = Path(__file__).resolve().parent
TEST_CASES_PATH = HERE / "chatbot_test_cases.json"
OUTPUT_PATH = HERE / "chatbot_results.json"

try:
    from langdetect import detect as detect_lang
    HAVE_LANGDETECT = True
except ImportError:
    HAVE_LANGDETECT = False
    print("WARNING: langdetect not installed, language-detection accuracy will be skipped.")

try:
    from sentence_transformers import SentenceTransformer, util
    HAVE_ST = True
except ImportError:
    HAVE_ST = False
    print("WARNING: sentence-transformers not installed, semantic similarity will be skipped.")


def main():
    with TEST_CASES_PATH.open(encoding="utf-8") as file_handle:
      data = json.load(file_handle)
    test_cases = data["test_cases"]

    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        response.raise_for_status()
    except Exception as error:
        print(f"Chatbot service not reachable at {BASE_URL}: {error}")
        sys.exit(1)

    embedder = None
    if HAVE_ST:
        print("Loading multilingual embedding model (first run downloads the model)...")
        embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

    results = []
    for test_case in test_cases:
        lang = test_case["language"]
        user_id = f"bench_{lang}"
        record = {"language": lang, "lang_name": test_case["lang_name"]}

        start = time.perf_counter()
        try:
            resp1 = requests.post(
                f"{BASE_URL}/chat",
                json={"user_id": user_id, "message": test_case["message"], "language": lang},
                timeout=60,
            )
            resp1.raise_for_status()
            data1 = resp1.json()
        except Exception as error:
            print(f"[{test_case['lang_name']}] FAILED: {error}")
            record["error"] = str(error)
            results.append(record)
            continue
        end = time.perf_counter()

        record["latency_ms"] = round((end - start) * 1000, 1)
        reply1 = data1.get("reply", "")
        record["reply_excerpt"] = reply1[:120]
        record["response_language_field"] = data1.get("language")

        if HAVE_LANGDETECT and reply1.strip():
            try:
                detected = detect_lang(reply1)
                record["detected_reply_lang"] = detected
                record["lang_match"] = detected[:2] == lang[:2]
            except Exception:
                record["detected_reply_lang"] = None
                record["lang_match"] = None

        reference = test_case.get("reference_response", "").strip()
        if embedder and reference:
            embeddings = embedder.encode([reply1, reference], convert_to_tensor=True)
            similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
            record["semantic_similarity"] = round(similarity, 3)
        else:
            record["semantic_similarity"] = None

        try:
            resp2 = requests.post(
                f"{BASE_URL}/chat",
                json={"user_id": user_id, "message": test_case["followup"], "language": lang},
                timeout=60,
            )
            resp2.raise_for_status()
            data2 = resp2.json()
            reply2 = data2.get("reply", "")
            record["followup_reply_excerpt"] = reply2[:120]
            record["context_retained_heuristic"] = bool(reply2.strip() and reply2.strip() != reply1.strip())
        except Exception as error:
            record["followup_error"] = str(error)

        results.append(record)
        print(
            f"[{test_case['lang_name']}] latency={record.get('latency_ms')}ms "
            f"lang_match={record.get('lang_match')} "
            f"sim={record.get('semantic_similarity')}"
        )

    valid = [row for row in results if "error" not in row]
    total = len(valid)
    avg_latency = sum(row["latency_ms"] for row in valid) / total if total else 0

    lang_matches = [row["lang_match"] for row in valid if row.get("lang_match") is not None]
    lang_accuracy = sum(1 for matched in lang_matches if matched) / len(lang_matches) if lang_matches else None

    similarities = [row["semantic_similarity"] for row in valid if row.get("semantic_similarity") is not None]
    avg_similarity = sum(similarities) / len(similarities) if similarities else None

    retained = [row["context_retained_heuristic"] for row in valid if "context_retained_heuristic" in row]
    retention_rate = sum(1 for retained_value in retained if retained_value) / len(retained) if retained else None

    print("\n--- Summary (Table II) ---")
    print(f"Languages tested: {total}/{len(test_cases)}")
    print(f"Average response latency: {avg_latency:.1f} ms")
    print(
        f"Response-language match accuracy: {lang_accuracy*100:.1f}%"
        if lang_accuracy is not None
        else "Response-language match accuracy: N/A (langdetect missing)"
    )
    print(
        f"Average semantic similarity vs reference: {avg_similarity:.3f}"
        if avg_similarity is not None
        else "Average semantic similarity vs reference: N/A (no reference responses provided)"
    )
    print(
        f"Context retention rate (heuristic): {retention_rate*100:.1f}%"
        if retention_rate is not None
        else "Context retention rate (heuristic): N/A"
    )

    with OUTPUT_PATH.open("w", encoding="utf-8") as file_handle:
        json.dump(results, file_handle, indent=2, ensure_ascii=False)
    print(f"\nRaw results written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
