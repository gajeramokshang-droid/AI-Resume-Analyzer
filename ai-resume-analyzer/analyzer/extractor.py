import io
import re
import fitz  # PyMuPDF
from docx import Document

def clean_text(text: str) -> str:
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)    
    # Collapse multiple spaces/tabs
    text = re.sub(r'[ \t]+', ' ', text)
    # Collapse more than 2 consecutive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_text(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()

    if filename_lower.endswith('.pdf'):
        text = _extract_from_pdf(file_bytes)
    elif filename_lower.endswith('.docx'):
        text = _extract_from_docx(file_bytes)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX are accepted.")

    cleaned = clean_text(text)

    if not cleaned:
        raise ValueError("No text could be extracted from the file. It may be image-based.")

    return cleaned

def _extract_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n".join(pages)

def _extract_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)

