from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from pypdf.errors import PdfStreamError
from docx import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from io import BytesIO
from datetime import datetime
import requests
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_model = SentenceTransformer("all-MiniLM-L6-v2")


@app.get("/")
def home():
    return {"message": "ResumeAI backend is running"}


class ResumeItem(BaseModel):
    id: str
    file_name: str | None = None
    file_url: str


class ScreenAIRequest(BaseModel):
    job_id: str
    job_title: str | None = ""
    job_description: str
    resumes: list[ResumeItem]


def clean_text(text: str):
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_email(text: str):
    match = re.search(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        text
    )
    return match.group(0) if match else ""


def extract_pdf_text(file_bytes):
    try:
        reader = PdfReader(BytesIO(file_bytes))
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        return text

    except PdfStreamError:
        return ""

    except Exception as e:
        print("PDF extraction error:", str(e))
        return ""


def extract_docx_text(file_bytes):
    try:
        doc = Document(BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print("DOCX extraction error:", str(e))
        return ""


def extract_text_from_file(file_bytes, file_name: str):
    name = file_name.lower()

    if name.endswith(".pdf"):
        return extract_pdf_text(file_bytes)

    if name.endswith(".docx"):
        return extract_docx_text(file_bytes)

    return file_bytes.decode("utf-8", errors="ignore")


def extract_text_from_url(file_url: str, file_name: str = ""):
    try:
        response = requests.get(file_url, timeout=20)
        response.raise_for_status()

        file_bytes = response.content
        return extract_text_from_file(file_bytes, file_name or file_url)

    except Exception as e:
        print("URL extraction error:", str(e))
        return ""


def extract_keywords_from_job(job_text: str):
    job_text = clean_text(job_text)

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=25
    )

    try:
        vectorizer.fit_transform([job_text])
        keywords = vectorizer.get_feature_names_out()
        return list(keywords)
    except Exception:
        return []


def compare_keywords(job_keywords, resume_text: str):
    resume_text = clean_text(resume_text)

    matched = []
    missing = []

    for keyword in job_keywords:
        if keyword.lower() in resume_text:
            matched.append(keyword)
        else:
            missing.append(keyword)

    return matched, missing


def calculate_resume_score(job_text: str, resume_text: str):
    job_text = clean_text(job_text)
    resume_text = clean_text(resume_text)

    if not job_text or not resume_text:
        return {
            "final_score": 0,
            "semantic_score": 0,
            "keyword_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "status": "Rejected",
            "analysis": "Unable to calculate score because resume or job description text is empty."
        }

    embeddings = ai_model.encode([job_text, resume_text])

    semantic_similarity = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]]
    )[0][0]

    semantic_score = round(float(semantic_similarity) * 100, 2)

    job_keywords = extract_keywords_from_job(job_text)
    matched_keywords, missing_keywords = compare_keywords(job_keywords, resume_text)

    keyword_score = (
        round((len(matched_keywords) / len(job_keywords)) * 100)
        if job_keywords else 0
    )

    final_score = round((semantic_score * 0.8) + (keyword_score * 0.2), 2)

    if final_score >= 70:
        status = "Shortlisted"
        recommendation = "Strong candidate. Recommended for interview."
    elif final_score >= 45:
        status = "Needs Review"
        recommendation = "Average match. Recruiter should review manually."
    else:
        status = "Rejected"
        recommendation = "Low match for this role."

    analysis = f"""
AI Match Score: {final_score}%

Semantic Score: {semantic_score}%
Keyword Score: {keyword_score}%

This score is calculated using:
80% SentenceTransformer semantic similarity
20% dynamic keyword matching from the job description

Matched keywords:
{", ".join(matched_keywords) if matched_keywords else "No strong matched keywords found"}

Missing or weak keywords:
{", ".join(missing_keywords) if missing_keywords else "No major missing keywords detected"}

Recommendation:
{recommendation}
"""

    return {
        "final_score": final_score,
        "semantic_score": semantic_score,
        "keyword_score": keyword_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "status": status,
        "analysis": analysis.strip()
    }


@app.post("/screen-resumes-ai")
def screen_resumes_ai(payload: ScreenAIRequest):
    job_text = f"{payload.job_title or ''} {payload.job_description or ''}"

    results = []

    for resume in payload.resumes:
        resume_text = extract_text_from_url(
            resume.file_url,
            resume.file_name or ""
        )

        score_data = calculate_resume_score(job_text, resume_text)

        results.append({
            "id": resume.id,
            "score": score_data["final_score"],
            "semantic_score": score_data["semantic_score"],
            "keyword_score": score_data["keyword_score"],
            "status": score_data["status"],
            "matched_skills": ", ".join(score_data["matched_keywords"]),
            "missing_skills": ", ".join(score_data["missing_keywords"]),
            "analysis": score_data["analysis"]
        })

    results.sort(key=lambda item: item["score"], reverse=True)

    return {
        "job_id": payload.job_id,
        "results": results
    }


@app.post("/scan-resume")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    file_bytes = await file.read()
    resume_text = extract_text_from_file(file_bytes, file.filename)

    score_data = calculate_resume_score(job_description, resume_text)
    email = extract_email(resume_text)

    return {
        "name": file.filename.replace(".pdf", "").replace(".docx", ""),
        "role": "Candidate",
        "score": score_data["final_score"],
        "semanticScore": score_data["semantic_score"],
        "keywordScore": score_data["keyword_score"],
        "status": score_data["status"],
        "time": datetime.now().strftime("%d/%m/%Y, %I:%M %p"),
        "fileName": file.filename,
        "matchedSkills": score_data["matched_keywords"],
        "missingSkills": score_data["missing_keywords"],
        "analysis": score_data["analysis"],
        "email": email,
    }