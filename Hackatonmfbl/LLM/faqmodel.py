import json
import pickle
import re
from difflib import SequenceMatcher

# ---------- KLJUČNE RIJEČI PO KATEGORIJAMA ----------
CATEGORY_KEYWORDS = {
    "Investicioni kredit za stanovništvo": {"investicioni", "stanovništvo"},
    "Potrošački (nenamjenski) kredit": {"potrosacki", "nenamjenski", "potrosački"},
    "Overdraft – prekoračenje po računu": {"prekoracenje", "tekuci", "racun", "overdraft", "prekoračenje"},
    "Stambeni kredit MF Banke": {"stan", "stambeni", "kuca", "kuća"},
    "Kredit za poljoprivrednike": {"poljoprivreda", "poljoprivrednik", "poljoprivrednike", "poljoprivredna", "poljoprivredni"},
}

# ---------------------------------------------------------
# LOAD JSON
# ---------------------------------------------------------
with open("PitanjaOdgovoriJSON.json", "r", encoding="utf-8") as f:
    DATA = json.load(f)

# ---------------------------------------------------------
# HELPER: clean text
# ---------------------------------------------------------
def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


# ---------------------------------------------------------
# FAQ MATCHER CLASS
# ---------------------------------------------------------
class FAQMatcher:
    def __init__(self, data, category_keywords):
        self.data = data
        self.category_keywords = category_keywords
        
    def find_exact_match(self, question: str, category: str = None):
        q_norm = normalize(question)

        # CASE 1: Category NOT provided → search all categories
        if not category:
            for category_obj in self.data["categories"]:
                category_name = category_obj["category"]

                for item in category_obj["items"]:
                    for q in item["questions"]:
                        if normalize(q) == q_norm:
                            return {
                                "category": category_name,
                                "answer": item["answer"],
                                "match_type": "exact",
                                "confidence": 1.0
                            }

            return None

        # CASE 2: Category provided → find that category object
        category_obj = next(
            (c for c in self.data["categories"] if normalize(c["category"]) == normalize(category)),
            None
        )

        if not category_obj:
            return {
                "category": "Unknown",
                "answer": "Category not found in dataset.",
                "match_type": "manual",
                "confidence": 0.0
            }

        category_name = category_obj["category"]

        # search only this category
        for item in category_obj["items"]:
            for q in item["questions"]:
                if normalize(q) == q_norm:
                    return {
                        "category": category_name,
                        "answer": item["answer"],
                        "match_type": "exact",
                        "confidence": 1.0
                    }

        # no match inside this category
        return {
            "category": category_name,
            "answer": "No quick answer found in this category.",
            "match_type": "manual",
            "confidence": 0.0
        }

    def categorize_by_similarity(self, question: str):
        q_norm = normalize(question)

        best_score = 0
        best_category = None
        best_answer = None
        keywordFound = False

        # First, try keyword-based pre-filter
        for cat_name, keywords in self.category_keywords.items():
            if any(tok in q_norm for tok in keywords):
                cat_obj = next((c for c in self.data["categories"] if c["category"] == cat_name), None)
                if not cat_obj:
                    continue
                best_category = cat_name
                keywordFound = True
                break

        if not keywordFound:
            # Full search across all questions
            for category_obj in self.data["categories"]:
                category_name = category_obj["category"]
                for item in category_obj["items"]:
                    for q in item["questions"]:
                        if q != "Basic":
                            score = SequenceMatcher(None, q_norm, normalize(q)).ratio()
                            if score > best_score:
                                best_score = score
                                best_category = category_name
                                best_answer = item["answer"]
        else:
            category_obj = next(
                (c for c in self.data["categories"] if normalize(c["category"]) == normalize(best_category)),
                None
            )
            if not category_obj:
                return None

            # Search within the matched category
            category_name = category_obj["category"]
            for item in category_obj["items"]:
                for q in item["questions"]:
                    if q != "Basic":
                        score = SequenceMatcher(None, q_norm, normalize(q)).ratio()
                        if score > best_score:
                            best_score = score
                            best_answer = item["answer"]

        # threshold (0.55 is good for banking language)
        if best_score > 0.55:
            return {
                "category": best_category,
                "answer": best_answer,
                "match_type": "similar",
                "confidence": round(best_score, 2)
            }

        # Get the answer for the 'Basic' question in the matched category
        if best_category:
            basic_answer = None
            category_obj = next((c for c in self.data["categories"] if c["category"] == best_category), None)
            if category_obj:
                basic_item = next((i for i in category_obj["items"] if i["questions"] == ["Basic"]), None)
                if basic_item:
                    basic_answer = basic_item["answer"]

            return {
                "category": best_category,
                "answer": basic_answer or "No answer available.",
                "match_type": "keyword",
                "confidence": 0.5
            }

        return None

    def process_question(self, question: str, category: str = None):
        question = question.strip()
        
        # CASE 1: category is manually provided
        if category and category.strip():
            exact_in_category = self.find_exact_match(question, category)
            if exact_in_category:
                return exact_in_category
        else:
            # CASE 2: try exact match first
            exact = self.find_exact_match(question)
            if exact:
                return exact
            
            # CASE 3: approximate categorization
            sim = self.categorize_by_similarity(question)
            if sim:
                return sim

        # CASE 4: no match found
        return {
            "category": "Unknown",
            "answer": "No quick answer found.",
            "match_type": "none",
            "confidence": 0.0
        }


# ---------------------------------------------------------
# CREATE AND SAVE THE MATCHER
# ---------------------------------------------------------
def create_pkl_file():
    """Create the FAQ matcher and save it as a pickle file"""
    matcher = FAQMatcher(DATA, CATEGORY_KEYWORDS)
    
    # Save the matcher object
    with open("faq_matcher_model.pkl", "wb") as f:
        pickle.dump(matcher, f)
    
    print("✓ FAQ matcher model saved to faq_matcher_model.pkl")
    
    # Test the matcher
    test_questions = [
        "Šta mi treba za investicioni kredit?",
        "Kako funkcioniše kredit za poljoprivrednik?",
        "Koliki je maksimalan rok otplate?",
        "Kako da renoviram stan uz kredit?",
        "Kolika je rata kredita?"
    ]
    
    print("\n--- Testing matcher ---")
    for q in test_questions:
        result = matcher.process_question(q)
        print(f"\nQ: {q}")
        print(f"Category: {result['category']}")
        print(f"Match type: {result['match_type']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Answer: {result['answer'][:100]}...")
    
    return matcher


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
if __name__ == "__main__":
    print("Building FAQ Matcher Model...")
    print("=" * 50)
    
    # Create pickle file
    matcher = create_pkl_file()
    
    print("\n" + "=" * 50)
    print("Model created successfully!")
    print("File: faq_matcher_model.pkl")
    print("\nYou can now use this model in your .NET application")
    print("by calling it via a Python subprocess or HTTP API.")