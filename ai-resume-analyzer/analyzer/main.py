from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from extractor import extract_text
from scorer import extract_keywords, match_skills, compute_scores
from recommender import generate_strengths, generate_weaknesses, generate_recommendations, generate_roles

app = FastAPI(title="AI Resume Analyzer Service")  # //Creates a FastAPI app called AI Resume Analyzer Service.

class  AnalyzeRequest(BaseModel):
    # Defines the input format for the /analyze endpoint.
    extracted_text: str
    job_title: str
    job_description: str

@app.get("/health")   # Simple endpoint to check if the service is running.
def health():
    return {"status": "ok"}

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    file_bytes = await file.read()
    try:
        text = extract_text(file_bytes, file.filename)
        return {"extracted_text": text}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
#         Upload a resume file (PDF, DOCX, etc.).

#       Reads the file, extracts text using extract_text.

#      Returns the extracted text.

#      If extraction fails, returns error 422.

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    keywords = extract_keywords(req.job_description)
    matching_skills, missing_skills = match_skills(req.extracted_text, req.job_description)
    scores = compute_scores(req.extracted_text, req.job_description, keywords)

    strengths = generate_strengths(matching_skills, scores["atsScore"])
    weaknesses = generate_weaknesses(missing_skills, scores["jobMatchScore"])
    recommendations = generate_recommendations(missing_skills, keywords, scores["jobMatchScore"])
    recommended_roles = generate_roles(matching_skills, req.job_title)

    return {
        "overallScore": scores["overallScore"],
        "atsScore": scores["atsScore"],
        "jobMatchScore": scores["jobMatchScore"],
        "matchingSkills": matching_skills,
        "missingSkills": missing_skills,
        "keywords": keywords,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "recommendedRoles": recommended_roles,
    }
