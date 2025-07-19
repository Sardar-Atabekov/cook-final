import json
from googletrans import Translator
from pathlib import Path
import time
import os
import random
import re

translator = Translator()

LOCALES_DIR = Path(__file__).parent


def get_language_codes():
    """Получает коды языков из файлов локалей, кроме en.json, ru.json и translator.py"""
    codes = []
    for file in LOCALES_DIR.glob('*.json'):
        if file.name not in ('en.json', 'ru.json', "be.json", "ar.json", "es.json", 'translator.py'):
            codes.append(file.stem)
    return codes

def protect_variables(text):
    """Защищает переменные в фигурных скобках от перевода"""
    # Находим все переменные вида {variable}
    variables = re.findall(r'\{[^}]+\}', text)
    
    # Заменяем переменные на плейсхолдеры
    protected_text = text
    for i, var in enumerate(variables):
        placeholder = f"__VAR_{i}__"
        protected_text = protected_text.replace(var, placeholder)
    
    return protected_text, variables

def restore_variables(text, variables):
    """Восстанавливает переменные после перевода"""
    restored_text = text
    for i, var in enumerate(variables):
        placeholder = f"__VAR_{i}__"
        restored_text = restored_text.replace(placeholder, var)
    
    return restored_text

def translate_text(text, target_lang, max_retries=3):
    """Переводит текст с retry логикой и защитой переменных"""
    # Пропускаем пустые строки
    if not text or text.strip() == "":
        return text
    
    # Защищаем переменные
    protected_text, variables = protect_variables(text)
    
    for attempt in range(max_retries):
        try:
            result = translator.translate(protected_text, src='en', dest=target_lang)
            translated = result.text
            
            # Восстанавливаем переменные
            final_text = restore_variables(translated, variables)
            
            return final_text
            
        except Exception as e:
            print(f"Попытка {attempt + 1}/{max_retries} - Ошибка перевода '{text[:50]}...': {e}")
            if attempt < max_retries - 1:
                # Увеличиваем задержку с каждой попыткой
                sleep_time = (attempt + 1) * 3 + random.uniform(0, 2)
                print(f"Ждём {sleep_time:.1f} секунд перед повторной попыткой...")
                time.sleep(sleep_time)
            else:
                print(f"Не удалось перевести после {max_retries} попыток, возвращаем оригинал")
                return text

def translate_json_recursive(data, target_lang):
    """Рекурсивно переводит JSON с защитой переменных"""
    if isinstance(data, dict):
        translated = {}
        for key, value in data.items():
            try:
                translated[key] = translate_json_recursive(value, target_lang)
                # Увеличиваем задержку между переводами
                time.sleep(0.5 + random.uniform(0, 0.3))
            except Exception as e:
                print(f"Ошибка при переводе ключа '{key}': {e}")
                translated[key] = value  # Возвращаем оригинал при ошибке
        return translated
    elif isinstance(data, list):
        translated_list = []
        for item in data:
            try:
                translated_list.append(translate_json_recursive(item, target_lang))
            except Exception as e:
                print(f"Ошибка при переводе элемента списка: {e}")
                translated_list.append(item)  # Возвращаем оригинал при ошибке
        return translated_list
    elif isinstance(data, str):
        return translate_text(data, target_lang)
    else:
        return data

def main():
    en_file = LOCALES_DIR / 'en.json'
    
    # Проверяем существование файла
    if not en_file.exists():
        print(f"❌ Файл {en_file} не найден!")
        return
    
    try:
        with open(en_file, 'r', encoding='utf-8') as f:
            source_data = json.load(f)
    except Exception as e:
        print(f"❌ Ошибка при чтении файла {en_file}: {e}")
        return

    lang_codes = get_language_codes()
    print(f"Найдено языков для перевода: {lang_codes}")

    for lang_code in lang_codes:
        output_file = LOCALES_DIR / f"{lang_code}.json"
        print(f"Переводим на {lang_code}...")
        
        try:
            translated_data = translate_json_recursive(source_data, lang_code)
            
            # Сохраняем результат
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ {lang_code} перевод сохранен")
            
        except Exception as e:
            print(f"❌ Ошибка при переводе на {lang_code}: {e}")
        
        # Увеличиваем паузу между языками
        sleep_time = 8 + random.uniform(0, 3)
        print(f"Ждём {sleep_time:.1f} секунд перед следующим языком...")
        time.sleep(sleep_time)
    
    print("🎉 Все переводы завершены!")

if __name__ == "__main__":
    main()