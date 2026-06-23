
# Resume AI 🚀
## AI-Powered Resume Screening & Candidate Intelligence Platform

HireFlow AI is a full-stack AI recruitment platform that automates resume screening using Natural Language Processing and transformer-based semantic matching.

Unlike traditional ATS systems that depend only on keyword matching, HireFlow AI understands the contextual similarity between resumes and job descriptions to rank candidates intelligently.

The system helps recruiters reduce manual screening time by automatically analyzing resumes, identifying skill gaps, and generating AI-driven candidate recommendations.


---

## 📸 Product Preview


### Dashboard

Recruitment overview with candidate statistics and screening insights.

![Dashboard](Screenshots/DashboardPage.png)


### AI Screening Engine

Semantic resume analysis with AI-generated match scores, matched skills, missing skills, and recommendations.

![Screening](Screenshots/AiScreeningPage.png)


### Candidate Intelligence

Ranked candidates based on AI compatibility scores.

![Candidates](Screenshots/CandidatePage.png)

### Analytics Dashboard
![Analytics](Screenshots/AnalyticsDashboardpage.png)

---
# 🧠 AI Screening Workflow


```text
Recruiter Creates Job
          |
          v

Job Description Processing

          |
          v

Resume Upload (PDF/DOCX)

          |
          v

Text Extraction Engine

          |
          v

Data Cleaning & Preprocessing

          |
          v

Sentence Transformer Model
(all-MiniLM-L6-v2)

          |
          v

Vector Embedding Generation

          |
          v

Resume Vector  <---->  Job Vector

          |
          v

Cosine Similarity Calculation

          |
          v

Semantic Match Score (80%)

          +

Dynamic Skill Matching (20%)

          |
          v

Final AI Score

          |
          v

Candidate Classification

Shortlisted | Needs Review | Rejected
```

---

# 🤖 AI Matching Architecture


### 1. Semantic Matching Engine

Powered by Sentence Transformers.

Model used:

```
all-MiniLM-L6-v2
```

Process:

```
Resume Text
     |
     v
Transformer Encoder
     |
     v
384-dimensional Vector Embedding
```

```
Job Description
     |
     v
Transformer Encoder
     |
     v
384-dimensional Vector Embedding
```

The generated vectors are compared using cosine similarity to measure how closely a candidate matches the job requirements.


---

### 2. Dynamic Skill Intelligence

Instead of depending on predefined skills, the system dynamically extracts important job-related terms.

It identifies:

✔ Matched skills  
✔ Missing skills  
✔ Candidate skill gaps  


Final ranking formula:

```
AI Score =
(0.8 × Semantic Similarity)
+
(0.2 × Skill Match Score)
```


---

# ✨ Core Features


| Feature | Description |
|---|---|
| AI Resume Analysis | Parses and understands resume content |
| Semantic Candidate Matching | Uses transformer embeddings instead of simple keyword search |
| Candidate Ranking | Automatically ranks applicants by AI score |
| Skill Gap Detection | Finds matching and missing skills |
| Job Management | Create jobs and manage uploaded resumes |
| Resume Storage | Cloud based resume management |
| Analytics Dashboard | Hiring insights and candidate statistics |
| Authentication | Secure recruiter access |


---

# 🛠 Technology Stack


### Frontend
- React
- TypeScript
- Tailwind CSS


### Backend
- FastAPI
- Python


### Artificial Intelligence
- Sentence Transformers
- Natural Language Processing
- Vector Embeddings
- TF-IDF
- Cosine Similarity
- Scikit-Learn


### Database & Cloud
- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage


---

# ⚙️ System Architecture


```text

React + TypeScript Client

            |
            |
            v

        FastAPI Server

            |
            |
     ----------------
     |              |

Resume Parser     AI Engine

     |              |

PDF/DOCX        Sentence
Extraction      Transformer

                    |
                    v

            Similarity Engine

                    |
                    v

             Supabase Database

                    |
                    v

        Analytics & Candidate Dashboard

```


---

# 📊 Dataset / Data Processing


HireFlow AI does not rely on a fixed dataset.

The system performs real-time analysis using:

- Recruiter provided job descriptions
- Uploaded candidate resumes

The AI model generates embeddings dynamically during screening.


---

# 🚀 Future Improvements

- Fine-tuned resume-specific transformer model
- Bias detection in recruitment decisions
- Recruiter AI assistant
- Feedback-based learning system
- Automated interview scheduling agent


---

# Developer

**Khushi Agarwal**

AI/ML Engineering Project
