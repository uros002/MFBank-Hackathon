import json
import re
from difflib import SequenceMatcher


# ---------- KLJUČNE RIJEČI PO KATEGORIJAMA ----------
CATEGORY_KEYWORDS = {
    "Investicioni kredit za stanovništvo": {"investicioni", "stanovništvo"},
    "Potrosacki nenamjenski kredit": {"potrosacki", "nenamjenski"},
    "Prekoracenje po tekucem racunu - overdraft": {"prekoracenje", "tekuci", "racun", "overdraft"},
    "Stambeni kredit MF Banke": {"stan", "stambeni", "kuca"},
    "Kredit za poljoprivrednike": {"poljoprivreda", "poljoprivrednik","poljoprivrednike","poljoprivredna","poljoprivredni"},
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
# 1) FIND EXACT QUESTION MATCH
# ---------------------------------------------------------
def find_exact_match(question: str, category: str = None):
    q_norm = normalize(question)

    # -----------------------------------------------------
    # CASE 1: Category NOT provided → search all categories
    # -----------------------------------------------------
    if not category:
        for category_obj in DATA["categories"]:
            category_name = category_obj["category"]

            for item in category_obj["items"]:
                for q in item["questions"]:
                    if normalize(q) == q_norm:
                        return {
                            "category": category_name,
                            "answer": item["answer"]
                        }

        return None

    # -----------------------------------------------------
    # CASE 2: Category provided → find that category object
    # -----------------------------------------------------
    category_obj = next(
        (c for c in DATA["categories"] if normalize(c["category"]) == normalize(category)),
        None
    )

    if not category_obj:
        # category does not exist in JSON
        return {
            "category": "Unknown",
            "answer": "Category not found in dataset."
        }

    category_name = category_obj["category"]

    # search only this category
    for item in category_obj["items"]:
        for q in item["questions"]:
            if normalize(q) == q_norm:
                return {
                    "category": category_name,
                    "answer": item["answer"]
                }

    # no match inside this category
    return {
        "category": category_name,
        "answer": "No quick answer found in this category."
    }


# ---------------------------------------------------------
# 2) FIND BEST CATEGORY BASED ON KEYWORD SIMILARITY
# ---------------------------------------------------------

from difflib import SequenceMatcher

def categorize_by_similarity(question: str):
    q_norm = normalize(question)

    best_score = 0
    best_category = None
    best_answer = None

    keywordFound = False

    # First, try keyword-based pre-filter
    for cat_name, keywords in CATEGORY_KEYWORDS.items():
        if any(tok in q_norm for tok in keywords):
            cat_obj = next((c for c in DATA["categories"] if c["category"] == cat_name), None)
            if not cat_obj:
                continue
            best_category = cat_name
            keywordFound = True
            break
        

    if not keywordFound:

        # Then, full search across all questions
        for category_obj in DATA["categories"]:
                category_name = category_obj["category"]
                for item in category_obj["items"]:
                        for q in item["questions"]:
                                score = SequenceMatcher(None, q_norm, normalize(q)).ratio()
                                if score > best_score:
                                        best_score = score
                                        best_category = category_name

        
    else:

        category_obj = next(
        (c for c in DATA["categories"] if normalize(c["category"]) == normalize(best_category)),
        None
    )
        if not category_obj:
          return None
        
          # Then, full search across all questions
        category_name = category_obj["category"]
        for item in category_obj["items"]:
                for q in item["questions"]:
                        if not q == "Basic":
                                score = SequenceMatcher(None, q_norm, normalize(q)).ratio()
                                if score > best_score:
                                        best_score = score
                                        best_answer = item["answer"]

        # threshold (0.55 is good for banking language)
        if best_score > 0.55:
                return {
                        "category": best_category,
                        "answer": best_answer
                }                
    # Get the answer for the 'Basic' question in the matched category
    basic_answer = None
    category_obj = next((c for c in DATA["categories"] if c["category"] == best_category), None)
    if category_obj:
        basic_item = next((i for i in category_obj["items"] if i["questions"] == ["Basic"]), None)
        if basic_item:
            basic_answer = basic_item["answer"]

    return {
        "category": best_category,
        "answer": basic_answer
    }


def categorize_by_similarity2(question: str):
    q_norm = normalize(question)

    best_score = 0
    best_category = None
    best_answer = None

    for cat_name, keywords in CATEGORY_KEYWORDS.items():
        if any(tok in q_norm for tok in keywords):
                cat_obj = next((c for c in DATA["categories"] if c["category"] == cat_name), None)
                if not cat_obj:
                        continue
                for item in cat_obj["items"]:
                        for q in item["questions"]:
                                score = SequenceMatcher(None, q_norm, normalize(q)).ratio()
                                if score > best_score:
                                        best_score = score
                                        best_category = cat_name
                                        best_answer = item["answer"]
    
    for category_obj in DATA["categories"]:
        category_name = category_obj["category"]

        for item in category_obj["items"]:
            for q in item["questions"]:
                score = SequenceMatcher(None, q_norm, normalize(q)).ratio()

                if score > best_score:
                    best_score = score
                    best_category = category_name
                    best_answer = item["answer"]

    # threshold (0.55 is good for banking language)
    if best_score < 0.55:
        return None

    return {
        "category": best_category,
        "answer": best_answer
    }


# ---------------------------------------------------------
# MAIN LOGIC
# ---------------------------------------------------------
def process_question(question: str, category: str = None):
    question = question.strip()
    isCategoryGiven = False
    # CASE 1: category is manually provided → skip classification
    if category and category.strip():
        isCategoryGiven = True


    # CASE 3: approximate categorization
    if isCategoryGiven:
        exact_in_category = find_exact_match(question, category)
        if exact_in_category:
            return exact_in_category
    else:
        # CASE 2: try exact match first
        exact = find_exact_match(question)
        if exact:
                return exact
        
        sim = categorize_by_similarity(question)
        if sim:
                return sim

    # CASE 4: no match found
    return {
        "category": "Unknown",
        "answer": "No quick answer found."
    }


# ---------------------------------------------------------
# EXAMPLE USAGE
# ---------------------------------------------------------
if __name__ == "__main__":
    test_questions = [
        "Sta mi treba za investicioni kredit?",
        "Kako funkcioniše kredit za poljoprivrednik?",
        "Koliki je maksimalan rok otplate?",
        "Kako da renoviram stan uz kredit?",
        "Kolika je rata kredita?"
    ]

    for q in test_questions:
        res = process_question(q)
        print(json.dumps(res, indent=2, ensure_ascii=False))