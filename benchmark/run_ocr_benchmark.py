"""
Benchmarks the OCR + document verification pipeline from
ai-matching-service/identity_verification.py against synthetic
ID-document images of varying image quality.

Measures:
  - OCR processing time per document
  - Field-level extraction accuracy (vs ground truth)
  - Overall document-read success rate
  - Output of the project's own verify_document() trust-scoring logic
"""
import json
import os
import re
import sys
import time
from pathlib import Path

import numpy as np
import pytesseract
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
AI_SERVICE_DIR = PROJECT_ROOT / 'ai-matching-service'
sys.path.insert(0, str(AI_SERVICE_DIR))
from identity_verification import IdentityVerificationML  # noqa: E402

DOCS_DIR = Path(__file__).resolve().parent / 'docs'


def normalize(value):
    return re.sub(r'[^A-Za-z0-9]', '', str(value)).upper()


def field_match(extracted_text, value):
    norm_extracted = normalize(extracted_text)
    norm_value = normalize(value)
    if not norm_value:
        return False
    return norm_value in norm_extracted


def main():
    with (DOCS_DIR / 'ground_truth.json').open(encoding='utf-8') as file_handle:
        records = json.load(file_handle)

    verifier = IdentityVerificationML()

    results = []
    for record in records:
        path = DOCS_DIR / record['filename']
        image = Image.open(path)

        start = time.perf_counter()
        extracted_text = pytesseract.image_to_string(image)
        end = time.perf_counter()
        ocr_time_ms = (end - start) * 1000

        fields = ['first_name', 'last_name', 'nationality', 'dob', 'doc_no', 'expiry']
        matched = [field for field in fields if field_match(extracted_text, record[field])]
        field_accuracy = len(matched) / len(fields)

        start_verify = time.perf_counter()
        verify_result = verifier.verify_document(
            doc_type=record['doc_type'].lower().replace(' ', '_'),
            doc_data={'extracted_text': extracted_text}
        )
        end_verify = time.perf_counter()
        verify_time_ms = (end_verify - start_verify) * 1000

        results.append({
            'filename': record['filename'],
            'quality_level': record['quality_level'],
            'ocr_time_ms': ocr_time_ms,
            'field_accuracy': field_accuracy,
            'fields_matched': len(matched),
            'fields_total': len(fields),
            'verify_time_ms': verify_time_ms,
            'verify_result': verify_result,
        })

    levels = ['clean', 'mild', 'moderate', 'severe']
    print(f"{'Quality':<10} {'N':>3} {'AvgOCR(ms)':>11} {'AvgFieldAcc':>12} {'AvgVerify(ms)':>14}")
    overall_accuracy = []
    for level in levels:
        subset = [row for row in results if row['quality_level'] == level]
        avg_ocr = np.mean([row['ocr_time_ms'] for row in subset])
        avg_acc = np.mean([row['field_accuracy'] for row in subset])
        avg_verify = np.mean([row['verify_time_ms'] for row in subset])
        overall_accuracy.extend([row['field_accuracy'] for row in subset])
        print(f"{level:<10} {len(subset):>3} {avg_ocr:>11.1f} {avg_acc*100:>11.1f}% {avg_verify:>13.2f}")

    print()
    print(f"Overall mean field-level OCR accuracy: {np.mean(overall_accuracy)*100:.1f}%")
    print(f"Overall mean OCR time: {np.mean([row['ocr_time_ms'] for row in results]):.1f} ms")
    print(f"Documents with 100% field recovery: {sum(1 for row in results if row['field_accuracy'] == 1.0)}/{len(results)}")

    with (Path(__file__).resolve().parent / 'ocr_results.json').open('w', encoding='utf-8') as file_handle:
        json.dump(results, file_handle, indent=2, default=str)


if __name__ == '__main__':
    main()
