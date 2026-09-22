import re
from sklearn.feature_extraction.text import TfidfVectorizer
from skills import SKILLS

def extract_keywords(job_description: str, top_n: int = 20) -> list:
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=top_n)
        vectorizer.fit_transform([job_description])
        terms = vectorizer.get_feature_names_out()
        result = []
        for term in terms:
            freq = len(re.findall(r'\b' + re.escape(term) + r'\b', job_description.lower()))
            result.append({"term": term, "frequency": freq})
        result.sort(key=lambda x: x["frequency"], reverse=True)
        return result
    except Exception:
        return []

def match_skills(resume_text: str, job_desc: str) -> tuple:
    resume_lower = resume_text.lower()
    job_lower = job_desc.lower()

    resume_skills = set(skill for skill in SKILLS if skill in resume_lower)
    job_skills = set(skill for skill in SKILLS if skill in job_lower)

    matching = sorted(list(resume_skills & job_skills))
    missing = sorted(list(job_skills - resume_skills))

    return matching, missing

def compute_scores(resume_text: str, job_desc: str, keywords: list) -> dict:
    resume_lower = resume_text.lower()

    # Job Match Score: % of keywords found in resume
    if keywords:
        found = sum(1 for kw in keywords if kw["term"] in resume_lower)
        job_match_score = round((found / len(keywords)) * 100)
    else:
        job_match_score = 0

    # ATS Score: based on section presence + keyword density
    sections = ["experience", "education", "skills", "summary", "objective", "projects"]
    section_count = sum(1 for s in sections if s in resume_lower)
    section_score = min(100, section_count * 15)

    word_count = len(resume_text.split())
    density_score = min(100, int((word_count / 400) * 100))

    ats_score = round((section_score * 0.6) + (density_score * 0.4))
    ats_score = max(0, min(100, ats_score))

    # Formatting/completeness sub-score
    formatting_score = min(100, 40 + section_count * 10)

    # Overall Score: weighted combination
    overall_score = round(
        job_match_score * 0.5 + ats_score * 0.3 + formatting_score * 0.2
    )
    overall_score = max(0, min(100, overall_score))
    job_match_score = max(0, min(100, job_match_score))

    return {
        "overallScore": overall_score,
        "atsScore": ats_score,
        "jobMatchScore": job_match_score,
    }
