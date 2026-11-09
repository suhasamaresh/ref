"""
Generates synthetic ID-document-style images with known ground-truth text,
at varying quality levels (clean, noisy, blurred, rotated, low-contrast),
to benchmark the OCR pipeline used in identity_verification.py.
"""
import json
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

random.seed(42)
np.random.seed(42)

OUT_DIR = os.path.join(os.path.dirname(__file__), 'docs')
os.makedirs(OUT_DIR, exist_ok=True)

FIRST_NAMES = ["JOHN", "MARIA", "AHMED", "FATIMA", "CARLOS", "ELENA", "OMAR", "PRIYA", "DAVID", "SARAH",
               "MOHAMMED", "ANNA", "YUSUF", "LINA", "RAVI", "NADIA", "SAMUEL", "ZARA", "DANIEL", "LEILA"]
LAST_NAMES = ["SMITH", "KHAN", "GARCIA", "HASSAN", "MULLER", "SINGH", "ALI", "BROWN", "NASSER", "KUMAR",
              "PEREZ", "IBRAHIM", "WANG", "DIALLO", "TORRES", "ABDI", "NGUYEN", "SANTOS", "KAUR", "OKAFOR"]
DOC_TYPES = ["NATIONAL ID CARD", "REFUGEE ID CARD", "PASSPORT", "BIRTH CERTIFICATE"]
NATIONALITIES = ["SYRIAN", "AFGHAN", "SOMALI", "UKRAINIAN", "SUDANESE", "MYANMAR", "VENEZUELAN", "ERITREAN"]


def random_id_number():
    return ''.join(str(random.randint(0, 9)) for _ in range(9))


def random_date(start_year, end_year):
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return f'{day:02d}/{month:02d}/{year}'


def make_clean_image(record):
    width, height = 640, 400
    img = Image.new('RGB', (width, height), (250, 250, 248))
    draw = ImageDraw.Draw(img)
    try:
        font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
        font_field = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    except Exception:
        font_title = ImageFont.load_default()
        font_field = ImageFont.load_default()

    draw.rectangle([0, 0, width - 1, height - 1], outline=(40, 40, 40), width=3)
    draw.text((20, 15), record['doc_type'], font=font_title, fill=(20, 20, 80))
    y = 70
    for label, key in [
        ('Surname', 'last_name'),
        ('Given Name', 'first_name'),
        ('Nationality', 'nationality'),
        ('Date of Birth', 'dob'),
        ('Document No.', 'doc_no'),
        ('Expiry Date', 'expiry'),
    ]:
        draw.text((30, y), f'{label}:', font=font_field, fill=(0, 0, 0))
        draw.text((220, y), str(record[key]), font=font_field, fill=(0, 0, 0))
        y += 40
    return img


def degrade(img, level):
    """level: 'clean', 'mild', 'moderate', 'severe'"""
    if level == 'clean':
        return img
    arr = np.array(img).astype(np.float32)
    if level == 'mild':
        arr += np.random.normal(0, 6, arr.shape)
        img2 = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        img2 = img2.filter(ImageFilter.GaussianBlur(0.6))
        img2 = img2.rotate(random.uniform(-2, 2), expand=False, fillcolor=(250, 250, 248))
    elif level == 'moderate':
        arr += np.random.normal(0, 14, arr.shape)
        img2 = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        img2 = img2.filter(ImageFilter.GaussianBlur(1.2))
        img2 = img2.rotate(random.uniform(-5, 5), expand=False, fillcolor=(250, 250, 248))
        arr2 = np.array(img2).astype(np.float32)
        arr2 = (arr2 - 128) * 0.75 + 128
        img2 = Image.fromarray(np.clip(arr2, 0, 255).astype(np.uint8))
    else:
        arr += np.random.normal(0, 25, arr.shape)
        img2 = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        img2 = img2.filter(ImageFilter.GaussianBlur(2.0))
        img2 = img2.rotate(random.uniform(-10, 10), expand=False, fillcolor=(250, 250, 248))
        arr2 = np.array(img2).astype(np.float32)
        arr2 = (arr2 - 128) * 0.55 + 128
        img2 = Image.fromarray(np.clip(arr2, 0, 255).astype(np.uint8))
    return img2


def main():
    records = []
    levels = ['clean', 'mild', 'moderate', 'severe']
    n_per_level = 15
    index = 0
    for level in levels:
        for _ in range(n_per_level):
            record = {
                'first_name': random.choice(FIRST_NAMES),
                'last_name': random.choice(LAST_NAMES),
                'nationality': random.choice(NATIONALITIES),
                'dob': random_date(1960, 2005),
                'doc_no': random_id_number(),
                'expiry': random_date(2026, 2032),
                'doc_type': random.choice(DOC_TYPES),
            }
            image = make_clean_image(record)
            image = degrade(image, level)
            filename = f'doc_{index:03d}_{level}.png'
            image.save(os.path.join(OUT_DIR, filename))
            record['filename'] = filename
            record['quality_level'] = level
            records.append(record)
            index += 1

    with open(os.path.join(OUT_DIR, 'ground_truth.json'), 'w', encoding='utf-8') as file_handle:
        json.dump(records, file_handle, indent=2)
    print(f'Generated {index} synthetic documents across {len(levels)} quality levels in {OUT_DIR}')


if __name__ == '__main__':
    main()
