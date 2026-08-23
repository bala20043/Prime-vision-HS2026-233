from deep_translator import GoogleTranslator

UNKNOWN_RESPONSES = {
    "en": "This information is not stated in the provided documents.",
    "ta": "இந்த தகவல் வழங்கப்பட்ட ஆவணங்களில் குறிப்பிடப்படவில்லை.",
    "hi": "यह जानकारी दिए गए दस्तावेज़ों में उपलब्ध नहीं है।"
}

def detect_language(text: str) -> str:
    """Detect language based on Unicode script ranges or fallback to English."""
    if not text:
        return "en"
    
    # Tamil Unicode Range: 0B80–0BFF
    if any("\u0B80" <= char <= "\u0BFF" for char in text):
        return "ta"
    
    # Hindi/Devanagari Unicode Range: 0900–097F
    if any("\u0900" <= char <= "\u097F" for char in text):
        return "hi"
    
    return "en"

def get_unknown_response(lang: str = "en") -> str:
    return UNKNOWN_RESPONSES.get(lang.lower(), UNKNOWN_RESPONSES["en"])

def translate_text(text: str, target_lang: str = "en", source_lang: str = "auto") -> str:
    if not text:
        return text
    
    target_code = target_lang.lower()
    if target_code not in ["en", "ta", "hi"]:
        target_code = "en"
        
    detected = detect_language(text)
    
    # If text is already in the requested target language, return as is
    if detected == target_code and source_lang in ["auto", detected]:
        return text

    try:
        translated = GoogleTranslator(source="auto", target=target_code).translate(text)
        return translated if translated else text
    except Exception as e:
        print(f"Translation Notice ({target_code}):", e)
        return text
