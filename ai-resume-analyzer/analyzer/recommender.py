def generate_strengths(matching_skills: list, ats_score: int) -> list:
    strengths = []

    if len(matching_skills) >= 5:
        strengths.append(f"Strong skill alignment with {len(matching_skills)} matching skills including {', '.join(matching_skills[:3])}.")
    elif len(matching_skills) >= 2:
        strengths.append(f"Good skill match with relevant skills: {', '.join(matching_skills[:3])}.")

    if ats_score >= 70:
        strengths.append("Resume is well-structured with clear sections, improving ATS readability.")
    elif ats_score >= 50:
        strengths.append("Resume has decent structure with identifiable sections.")

    if len(matching_skills) > 0:
        strengths.append("Resume demonstrates experience with technologies relevant to the role.")

    strengths.append("Candidate shows a focused professional background aligned with the target role.")

    return strengths[:6]

def generate_weaknesses(missing_skills: list, job_match_score: int) -> list:
    weaknesses = []

    if missing_skills:
        weaknesses.append(f"Missing {len(missing_skills)} key skills required for the role: {', '.join(missing_skills[:4])}.")

    if job_match_score < 50:
        weaknesses.append("Low keyword overlap with the job description reduces ATS match potential.")

    if job_match_score < 30:
        weaknesses.append("Resume content does not strongly align with the specific requirements of this role.")

    if len(missing_skills) > 5:
        weaknesses.append("Several in-demand technical skills are absent from the resume.")

    if not weaknesses:
        weaknesses.append("Minor gaps exist between the resume and the specific job requirements.")

    return weaknesses[:6]

def generate_recommendations(missing_skills: list, keywords: list, job_match_score: int) -> list:
    recommendations = []

    if job_match_score < 40 and keywords:
        top_keywords = [kw["term"] for kw in keywords[:3]]
        recommendations.append(
            f"Immediately add these top missing keywords to your resume: {', '.join(top_keywords)}."
        )

    if missing_skills:
        recommendations.append(
            f"Learn and add these missing skills to strengthen your application: {', '.join(missing_skills[:5])}."
        )

    recommendations.append("Tailor your resume summary to directly reference the job title and key requirements.")
    recommendations.append("Quantify your achievements with numbers (e.g., 'improved performance by 30%').")
    recommendations.append("Ensure your resume includes clear sections: Summary, Skills, Experience, Education, Projects.")
    recommendations.append("Use action verbs at the start of each bullet point (e.g., Built, Developed, Led, Designed).")

    if job_match_score < 60:
        recommendations.append("Mirror the exact language from the job description to improve keyword matching.")

    recommendations.append("Keep resume to 1-2 pages and use a clean, ATS-friendly format without tables or images.")

    return recommendations[:8]

def generate_roles(matching_skills: list, job_title: str) -> list:
    base_roles = [
        {"role": "Software Developer", "base": 70},
        {"role": "Full Stack Developer", "base": 65},
        {"role": "Backend Developer", "base": 68},
        {"role": "Frontend Developer", "base": 62},
        {"role": "Data Analyst", "base": 58},
        {"role": "DevOps Engineer", "base": 55},
        {"role": "Python Developer", "base": 72},
        {"role": "Machine Learning Engineer", "base": 60},
    ]

    skill_bonus = min(20, len(matching_skills) * 2)

    roles = []
    for i, r in enumerate(base_roles):
        match_pct = min(100, r["base"] + skill_bonus - (i * 3))
        roles.append({"role": r["role"], "matchPercentage": max(0, match_pct)})

    # Sort by match percentage descending
    roles.sort(key=lambda x: x["matchPercentage"], reverse=True)
    return roles[:6]
