from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import re
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)

# ============================================
# FAQ MATCHER CLASS (needed for unpickling)
# ============================================
class FAQMatcher:
    def __init__(self, data, category_keywords):
        self.data = data
        self.category_keywords = category_keywords
    
    def normalize(self, text: str) -> str:
        return re.sub(r"\s+", " ", text.strip().lower())
    
    def find_exact_match(self, question: str, category: str = None):
        q_norm = self.normalize(question)

        if not category:
            for category_obj in self.data["categories"]:
                category_name = category_obj["category"]
                for item in category_obj["items"]:
                    for q in item["questions"]:
                        if self.normalize(q) == q_norm:
                            return {
                                "category": category_name,
                                "answer": item["answer"],
                                "match_type": "exact",
                                "confidence": 1.0
                            }
            return None

        category_obj = next(
            (c for c in self.data["categories"] if self.normalize(c["category"]) == self.normalize(category)),
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
        for item in category_obj["items"]:
            for q in item["questions"]:
                if self.normalize(q) == q_norm:
                    return {
                        "category": category_name,
                        "answer": item["answer"],
                        "match_type": "exact",
                        "confidence": 1.0
                    }

        return {
            "category": category_name,
            "answer": "No quick answer found in this category.",
            "match_type": "manual",
            "confidence": 0.0
        }

    def categorize_by_similarity(self, question: str):
        q_norm = self.normalize(question)
        best_score = 0
        best_category = None
        best_answer = None
        keywordFound = False

        for cat_name, keywords in self.category_keywords.items():
            if any(tok in q_norm for tok in keywords):
                cat_obj = next((c for c in self.data["categories"] if c["category"] == cat_name), None)
                if not cat_obj:
                    continue
                best_category = cat_name
                keywordFound = True
                break

        if not keywordFound:
            for category_obj in self.data["categories"]:
                category_name = category_obj["category"]
                for item in category_obj["items"]:
                    for q in item["questions"]:
                        if q != "Basic":
                            score = SequenceMatcher(None, q_norm, self.normalize(q)).ratio()
                            if score > best_score:
                                best_score = score
                                best_category = category_name
                                best_answer = item["answer"]
        else:
            category_obj = next(
                (c for c in self.data["categories"] if self.normalize(c["category"]) == self.normalize(best_category)),
                None
            )
            if not category_obj:
                return None

            for item in category_obj["items"]:
                for q in item["questions"]:
                    if q != "Basic":
                        score = SequenceMatcher(None, q_norm, self.normalize(q)).ratio()
                        if score > best_score:
                            best_score = score
                            best_answer = item["answer"]

        if best_score > 0.55:
            return {
                "category": best_category,
                "answer": best_answer,
                "match_type": "similar",
                "confidence": round(best_score, 2)
            }

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
        
        if category and category.strip():
            exact_in_category = self.find_exact_match(question, category)
            if exact_in_category:
                return exact_in_category
        else:
            exact = self.find_exact_match(question)
            if exact:
                return exact
            
            sim = self.categorize_by_similarity(question)
            if sim:
                return sim

        return {
            "category": "Unknown",
            "answer": "No quick answer found.",
            "match_type": "none",
            "confidence": 0.0
        }

# ============================================
# LOAD MODEL
# ============================================
with open("faq_matcher_model.pkl", "rb") as f:
    matcher = pickle.load(f)

# ============================================
# API ENDPOINTS
# ============================================
@app.route('/api/process-question', methods=['POST'])
def process_question():
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                "success": False,
                "error": "Question is required"
            }), 400
        
        question = data['question']
        category = data.get('category', None)
        
        result = matcher.process_question(question, category)
        
        return jsonify({
            "success": True,
            "category": result['category'],
            "answer": result['answer'],
            "match_type": result['match_type'],
            "confidence": result['confidence']
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "FAQ Matcher API"
    })

if __name__ == '__main__':
    print("=" * 50)
    print("FAQ Matcher API Server")
    print("=" * 50)
    print("Starting server on http://localhost:5001")
    print("Endpoints:")
    print("  POST /api/process-question - Process FAQ question")
    print("  GET  /health - Health check")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)