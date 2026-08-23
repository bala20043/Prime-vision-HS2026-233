from typing import List, Dict, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.utils.normalizer import normalize_text, extract_keywords

CONFIDENCE_THRESHOLD = 0.60

class QuestionMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self.knowledge_items: List[Dict] = []
        self.variations: List[Dict] = []
        self.corpus: List[str] = []
        self.corpus_item_map: List[Dict] = []
        self.tfidf_matrix = None
        self.is_indexed = False

    def build_index(self, knowledge_items: List[Dict], variations: List[Dict] = None):
        """Builds TF-IDF index from knowledge items and variations."""
        self.knowledge_items = knowledge_items
        self.variations = variations or []
        self.corpus = []
        self.corpus_item_map = []

        # Add primary questions
        for item in knowledge_items:
            norm_q = normalize_text(item["question"])
            if norm_q:
                self.corpus.append(norm_q)
                self.corpus_item_map.append({
                    "item": item,
                    "original_text": item["question"],
                    "type": "primary"
                })

        # Add variations
        for var in self.variations:
            norm_var = normalize_text(var["variation"])
            parent_item = next((k for k in knowledge_items if str(k["id"]) == str(var["knowledge_item_id"])), None)
            if norm_var and parent_item:
                self.corpus.append(norm_var)
                self.corpus_item_map.append({
                    "item": parent_item,
                    "original_text": var["variation"],
                    "type": "variation"
                })

        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
            self.is_indexed = True
        else:
            self.tfidf_matrix = None
            self.is_indexed = False

    def match(self, user_question: str) -> Tuple[Optional[Dict], float, str]:
        """
        Matches user question against knowledge base.
        Returns: (knowledge_item, confidence_score, match_type)
        """
        if not user_question or not self.is_indexed or not self.corpus:
            return None, 0.0, "unsupported"

        norm_user = normalize_text(user_question)
        if not norm_user:
            return None, 0.0, "unsupported"

        # Stage 1 & 2: Exact & Variation Match
        for idx, mapped in enumerate(self.corpus_item_map):
            if mapped["original_text"].lower().strip() == user_question.lower().strip() or self.corpus[idx] == norm_user:
                return mapped["item"], 1.00, "exact"

        # Stage 3 & 4: TF-IDF Cosine Similarity
        user_vector = self.vectorizer.transform([norm_user])
        similarities = cosine_similarity(user_vector, self.tfidf_matrix).flatten()

        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        # Keyword Verification: Require keyword overlap for non-exact matches
        user_kw = extract_keywords(norm_user)
        matched_kw = extract_keywords(self.corpus[best_idx])
        if user_kw and matched_kw:
            overlap = len(user_kw.intersection(matched_kw))
            if overlap == 0:
                best_score = 0.0
            else:
                overlap_ratio = overlap / float(len(user_kw))
                if overlap_ratio >= 0.7 and best_score < 0.7:
                    best_score = max(best_score, 0.75)

        if best_score >= CONFIDENCE_THRESHOLD:
            match_type = "strong" if best_score >= 0.75 else "uncertain"
            return self.corpus_item_map[best_idx]["item"], round(best_score, 4), match_type

        return None, round(best_score, 4), "unsupported"

# Global Question Matcher Instance
global_matcher = QuestionMatcher()
