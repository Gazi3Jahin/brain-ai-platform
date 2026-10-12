from pathlib import Path
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/rag", tags=["RAG Assistant"])

BASE_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge_base"


class QuestionRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


def load_documents():
    """Load text-based research notes from the knowledge base."""
    KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)
    documents = []

    for path in KNOWLEDGE_DIR.rglob("*"):
        if path.suffix.lower() not in {".txt", ".md"}:
            continue

        try:
            content = path.read_text(encoding="utf-8").strip()
        except (OSError, UnicodeError):
            continue

        if content:
            documents.append({
                "source": path.name,
                "content": content,
            })

    return documents


def tokenize(text):
    return set(re.findall(r"[a-zA-Z0-9]+", text.lower()))


def retrieve(question, documents, limit=3):
    """Rank document passages by word overlap with the question."""
    question_words = tokenize(question)

    if not question_words:
        return []

    matches = []

    for document in documents:
        paragraphs = [
            paragraph.strip()
            for paragraph in re.split(
                r"\n\s*\n", document["content"]
            )
            if paragraph.strip()
        ]

        for paragraph in paragraphs:
            passage_words = tokenize(paragraph)

            if not passage_words:
                continue

            overlap = question_words & passage_words
            if not overlap:
                continue

            score = len(overlap) / len(question_words)

            matches.append({
                "source": document["source"],
                "passage": paragraph[:1800],
                "score": round(score, 3),
            })

    matches.sort(key=lambda item: item["score"], reverse=True)
    return matches[:limit]


@router.get("/health")
def rag_health():
    documents = load_documents()

    return {
        "status": "ready",
        "documents_loaded": len(documents),
    }


@router.post("/ask")
def ask_question(request: QuestionRequest):
    documents = load_documents()
    results = retrieve(request.question, documents)

    if not results:
        return {
            "answer": (
                "I couldn't find a relevant passage in the current "
                "research collection. Add relevant documents to the "
                "knowledge base and try again."
            ),
            "sources": [],
        }

    evidence = "\n\n".join(
        f"[{index + 1}] {item['passage']}"
        for index, item in enumerate(results)
    )

    return {
        "answer": (
            "Here are the most relevant passages retrieved from "
            "the research collection. This initial version retrieves "
            "evidence but does not generate a new scientific answer. "
            "Review the passages and their sources before drawing "
            "conclusions.\n\n" + evidence
        ),
        "sources": [
            {
                "name": item["source"],
                "relevance": item["score"],
            }
            for item in results
        ],
    }