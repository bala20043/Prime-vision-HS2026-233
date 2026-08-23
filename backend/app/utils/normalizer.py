import re

FILLER_WORDS = [
    r"\bplease\b", r"\btell me\b", r"\bcan you tell me\b", r"\bwhat is the\b", 
    r"\bwhat is\b", r"\bwhat are the\b", r"\bwhat are\b", r"\bhow to\b", 
    r"\bgive me\b", r"\bshow me\b", r"\bdo i need to\b", r"\bis it mandatory to\b"
]

def normalize_text(text: str) -> str:
    if not text:
        return ""
    
    # 1. Lowercase
    cleaned = text.lower().strip()
    
    # 2. Replace non-alphanumeric punctuation with spaces (preserve unicode letters for Tamil/Hindi)
    cleaned = re.sub(r"[^\w\s\u0B80-\u0BFF\u0900-\u097F]", " ", cleaned)
    
    # 3. Remove excess whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    
    return cleaned

def extract_keywords(text: str) -> set:
    normalized = normalize_text(text)
    # Remove common short stop words
    words = [w for w in normalized.split() if len(w) > 2]
    return set(words)
