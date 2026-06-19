from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from docx import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from io import BytesIO
from datetime import datetime
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
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

JOB_ROLES = {
    "Frontend Developer": "react javascript typescript html css tailwind frontend ui component",
    "Data Analyst": "python sql power bi excel pandas numpy data analysis statistics",
    "Backend Developer": "node express api database mongodb sql server authentication",
}

SKILLS = [
    "python", "java", "javascript", "typescript", "react", "html", "css",
    "tailwind", "node", "express", "mongodb", "sql", "mysql",
    "pandas", "numpy", "power bi", "excel", "machine learning",
    "deep learning", "nlp", "scikit-learn", "tensorflow", "django",
    "flask", "fastapi", "git", "docker", "aws"
]
ai_model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_skills(text):
    text = text.lower()
    return [skill for skill in SKILLS if skill in text]


def extract_pdf_text(file_bytes):
    reader = PdfReader(BytesIO(file_bytes))
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text


def extract_docx_text(file_bytes):
    doc = Document(BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs])


def get_best_role(resume_text):
    best_role = "General Candidate"
    best_score = 0

    for role, job_text in JOB_ROLES.items():
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([resume_text, job_text])
        score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        percent = round(score * 100)

        if percent > best_score:
            best_score = percent
            best_role = role

    return best_role, best_score

class ResumeItem(BaseModel):
    id: str
    file_name: str | None = None
    file_url: str


class ScreenAIRequest(BaseModel):
    job_id: str
    job_title: str | None = ""
    job_description: str
    resumes: list[ResumeItem]


def clean_text(text):
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_text_from_url(file_url, file_name=""):
    response = requests.get(file_url)
    response.raise_for_status()

    file_bytes = response.content
    name = (file_name or file_url).lower()

    if name.endswith(".pdf"):
        return extract_pdf_text(file_bytes)

    if name.endswith(".docx"):
        return extract_docx_text(file_bytes)

    return file_bytes.decode("utf-8", errors="ignore")


def get_dynamic_keywords(job_text, resume_text):
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=25
    )

    try:
        vectorizer.fit_transform([job_text, resume_text])
        keywords = vectorizer.get_feature_names_out()
    except:
        return [], []

    job_lower = job_text.lower()
    resume_lower = resume_text.lower()

    matched = []
    missing = []

    for word in keywords:
        if word in job_lower:
            if word in resume_lower:
                matched.append(word)
            else:
                missing.append(word)

    return matched[:10], missing[:10]


@app.post("/screen-resumes-ai")
def screen_resumes_ai(payload: ScreenAIRequest):
    job_text = clean_text(
        f"{payload.job_title or ''} {payload.job_description or ''}"
    )

    results = []

    for resume in payload.resumes:
        resume_text = clean_text(
            extract_text_from_url(resume.file_url, resume.file_name or "")
        )

        embeddings = ai_model.encode([job_text, resume_text])

        similarity = cosine_similarity(
            [embeddings[0]],
            [embeddings[1]]
        )[0][0]

        score = round(float(similarity) * 100, 2)

        matched, missing = get_dynamic_keywords(job_text, resume_text)

        if score >= 70:
            status = "Shortlisted"
            recommendation = "Strong candidate. Recommended for interview."
        elif score >= 45:
            status = "Needs Review"
            recommendation = "Average match. Recruiter should review manually."
        else:
            status = "Rejected"
            recommendation = "Low match for this role."

        analysis = f"""
AI Semantic Match Score: {score}%

This result is generated using sentence embeddings and cosine similarity between the job description and the resume.

Matched keywords:
{", ".join(matched) if matched else "No strong matched keywords found"}

Missing or weak keywords:
{", ".join(missing) if missing else "No major missing keywords detected"}

Recommendation:
{recommendation}
"""

        results.append({
            "id": resume.id,
            "score": score,
            "status": status,
            "matched_skills": ", ".join(matched),
            "missing_skills": ", ".join(missing),
            "analysis": analysis.strip()
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

    if file.filename.endswith(".pdf"):
        resume_text = extract_pdf_text(file_bytes)
    elif file.filename.endswith(".docx"):
        resume_text = extract_docx_text(file_bytes)
    else:
        resume_text = file_bytes.decode("utf-8", errors="ignore")

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_description])

    score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    match_percent = round(score * 100)

    jd_skills = extract_skills(job_description)
    resume_skills = extract_skills(resume_text)

    matched_skills = list(set(jd_skills) & set(resume_skills))
    missing_skills = list(set(jd_skills) - set(resume_skills))

    skill_score = round((len(matched_skills) / len(jd_skills)) * 100) if jd_skills else 0
    final_score = round((match_percent * 0.6) + (skill_score * 0.4))

    if final_score >= 70:
        status = "Shortlisted"
    elif final_score >= 60:
        status = "Review"
    else:
        status = "Rejected"

    role, _ = get_best_role(resume_text)

    return {
        "name": file.filename.replace(".pdf", "").replace(".docx", ""),
        "role": role,
        "score": final_score,
        "status": status,
        "time": datetime.now().strftime("%d/%m/%Y, %I:%M %p"),
        "fileName": file.filename,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "similarityScore": match_percent,
        "skillScore": skill_score,
    }