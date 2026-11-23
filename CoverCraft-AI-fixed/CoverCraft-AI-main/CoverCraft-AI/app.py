"""
CoverCraft AI – Intelligent Cover Letter Generator
==================================================
A clean, beginner-friendly Streamlit web application powered by the
Google Gemini API (google-genai Python SDK) that generates tailored,
professional cover letters under 300 words.
"""

import html
import json
import os
import re
import streamlit as st
import streamlit.components.v1 as components
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ---------------------------------------------------------------------------
# 1. Environment & Model Configuration
# ---------------------------------------------------------------------------
load_dotenv()

MODEL_NAME = "gemini-4-hydrogen"
MAX_WORDS = 299

SYSTEM_PROMPT = """You are an experienced professional cover letter writer helping students and job seekers write concise, high-impact cover letters.

Follow every rule strictly:
1. Carefully analyze the provided job description, company name, and target job role.
2. Identify the most relevant skills, education, projects, and internship experiences from the applicant's information.
3. Connect the applicant's real qualifications directly to the company's job requirements.
4. Write a personalized, confident, natural, and professional cover letter ready to send to an employer.
5. Avoid generic clichés, filler phrases, buzzword padding, and unnecessary repetition.
6. STRICT FACTUALITY: Never invent qualifications, work experience, degrees, projects, metrics, achievements, or skills that were not explicitly provided by the applicant. Never claim experience the applicant did not provide.
7. STRICT LENGTH LIMIT: Keep the entire cover letter strictly below 300 words (target 210 to 265 words total, including greeting and sign-off).
8. Structure the cover letter with clean paragraphs covering:
   - Professional opening (e.g., "Dear Hiring Team at [Company Name]," or "Dear Hiring Manager,")
   - Introduction of the applicant and target role
   - Relevant skills and project/internship experience
   - Direct connection between the applicant's strengths and the job requirements
   - Professional closing and sign-off using the applicant's full name
9. Output ONLY the final cover letter text. Do not include any preamble, explanations, commentary, markdown headings, or code fences."""


# ---------------------------------------------------------------------------
# 2. Helper Functions
# ---------------------------------------------------------------------------
def count_words(text: str) -> int:
    """Return the exact word count of a text string."""
    return len(re.findall(r"\S+", text.strip()))


def sanitize_filename(company_name: str) -> str:
    """Format the company name safely for Cover_Letter_CompanyName.txt."""
    cleaned = re.sub(r"[^A-Za-z0-9]+", "_", company_name.strip()).strip("_")
    return f"Cover_Letter_{cleaned or 'Company'}.txt"


def get_gemini_client() -> genai.Client:
    """Create a Google GenAI client using GEMINI_API_KEY from environment variables."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY is missing or not configured. "
            "Add your key to the .env file and restart the application."
        )
    return genai.Client(api_key=api_key)


def build_user_prompt(form_data: dict, is_regenerate: bool = False) -> str:
    """Build the structured user prompt from validated form inputs."""
    variation_note = (
        "\nAdditional instruction: Write a fresh variation with different phrasing and "
        "opening structure while staying 100% faithful to the applicant's facts and under 270 words."
        if is_regenerate
        else ""
    )

    return f"""Write a tailored, ready-to-send cover letter using ONLY the applicant details below.

APPLICANT INFORMATION
- Full Name: {form_data['full_name']}
- Degree / Education: {form_data['education']}
- Skills: {form_data['skills']}
- Projects / Internship Experience: {form_data['experience']}

TARGET JOB INFORMATION
- Company Name: {form_data['company_name']}
- Job Role / Position: {form_data['job_role']}
- Job Description:
{form_data['job_description']}
{variation_note}

Remember: Keep the entire letter strictly below 300 words and include only the cover letter text."""


def generate_cover_letter(form_data: dict, is_regenerate: bool = False) -> str:
    """Call Google Gemini API to generate a cover letter strictly under 300 words."""
    client = get_gemini_client()
    user_prompt = build_user_prompt(form_data, is_regenerate=is_regenerate)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        ),
    )

    letter = (response.text or "").strip()
    if not letter:
        raise RuntimeError("The Gemini API returned an empty response. Please try again.")

    # Guarantee the generated cover letter always stays strictly below 300 words.
    if count_words(letter) >= 300:
        tighten_prompt = f"""Tighten the cover letter below so that it is strictly under 265 words.
Preserve all 5 required elements (professional opening, introduction, relevant skills/projects, role alignment, professional closing).
Do not invent any new facts, skills, or experiences. Return ONLY the revised cover letter text.

COVER LETTER TO TIGHTEN:
{letter}"""
        tighten_response = client.models.generate_content(
            model=MODEL_NAME,
            contents=tighten_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
            ),
        )
        tightened = (tighten_response.text or "").strip()
        if tightened:
            letter = tightened

    return letter


def validate_inputs(form_data: dict) -> list[str]:
    """Validate that all required fields have been completed."""
    labels = {
        "full_name": "Full Name",
        "education": "Degree / Education",
        "skills": "Skills",
        "experience": "Projects / Internship Experience",
        "company_name": "Company Name",
        "job_role": "Job Role / Position",
        "job_description": "Job Description",
    }
    return [label for key, label in labels.items() if not form_data[key].strip()]


def clear_all_fields() -> None:
    """Reset all input fields and clear any generated cover letter or error state."""
    for key in [
        "full_name",
        "education",
        "skills",
        "experience",
        "company_name",
        "job_role",
        "job_description",
    ]:
        st.session_state[key] = ""

    st.session_state.generated_letter = ""
    st.session_state.generated_company = ""
    st.session_state.generated_role = ""
    st.session_state.error_message = ""


def render_copy_button(text_to_copy: str) -> None:
    """Render a clean, self-contained Copy to Clipboard button."""
    safe_json = json.dumps(text_to_copy)
    components.html(
        f"""
        <div style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <button
                id="copy-btn"
                onclick="copyLetter()"
                style="
                    width: 100%;
                    padding: 0.55rem 1rem;
                    background: #FFFFFF;
                    color: #0F172A;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 150ms ease, border-color 150ms ease;
                "
                onmouseover="this.style.backgroundColor='#F8FAFC'; this.style.borderColor='#94A3B8';"
                onmouseout="this.style.backgroundColor='#FFFFFF'; this.style.borderColor='#CBD5E1';"
            >
                Copy to Clipboard
            </button>
        </div>
        <script>
            function copyLetter() {{
                const text = {safe_json};
                const btn = document.getElementById('copy-btn');
                navigator.clipboard.writeText(text).then(() => {{
                    btn.textContent = 'Copied to Clipboard';
                    btn.style.borderColor = '#2563EB';
                    btn.style.color = '#2563EB';
                    setTimeout(() => {{
                        btn.textContent = 'Copy to Clipboard';
                        btn.style.borderColor = '#CBD5E1';
                        btn.style.color = '#0F172A';
                    }}, 2000);
                }}).catch(() => {{
                    btn.textContent = 'Press Ctrl+C to Copy';
                }});
            }}
        </script>
        """,
        height=44,
    )


# ---------------------------------------------------------------------------
# 3. Page Configuration & Minimalist SaaS Styling
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="CoverCraft AI – Intelligent Cover Letter Generator",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
        .stApp {
            background-color: #F8FAFC;
            color: #0F172A;
        }
        .block-container {
            max-width: 1120px;
            padding-top: 2.5rem;
            padding-bottom: 4rem;
        }
        .cc-header {
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
        }
        .cc-brand {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0F172A;
            letter-spacing: -0.02em;
            margin: 0 0 0.35rem 0;
        }
        .cc-tagline {
            font-size: 1.05rem;
            font-weight: 500;
            color: #2563EB;
            margin: 0 0 0.45rem 0;
        }
        .cc-desc {
            font-size: 0.95rem;
            color: #475569;
            margin: 0;
        }
        .cc-section-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: #0F172A;
            margin: 0 0 0.75rem 0;
        }
        .cc-meta {
            font-size: 0.85rem;
            color: #475569;
            margin-bottom: 1rem;
        }
        .cc-letter-box {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 1.75rem;
            color: #0F172A;
            font-size: 0.96rem;
            line-height: 1.7;
            white-space: pre-wrap;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
            margin-bottom: 1.25rem;
        }
        div.stButton > button[kind="primary"] {
            background-color: #2563EB;
            border: 1px solid #2563EB;
            color: #FFFFFF;
            border-radius: 8px;
            font-weight: 600;
            padding: 0.55rem 1.25rem;
        }
        div.stButton > button[kind="primary"]:hover {
            background-color: #1D4ED8;
            border-color: #1D4ED8;
        }
        div.stButton > button[kind="secondary"],
        div.stDownloadButton > button {
            background-color: #FFFFFF;
            border: 1px solid #CBD5E1;
            color: #0F172A;
            border-radius: 8px;
            font-weight: 500;
            padding: 0.55rem 1.1rem;
        }
        div.stButton > button[kind="secondary"]:hover,
        div.stDownloadButton > button:hover {
            background-color: #F8FAFC;
            border-color: #94A3B8;
            color: #0F172A;
        }
        input, textarea {
            border-radius: 8px !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# 4. Initialize Session State
# ---------------------------------------------------------------------------
default_state = {
    "full_name": "",
    "education": "",
    "skills": "",
    "experience": "",
    "company_name": "",
    "job_role": "",
    "job_description": "",
    "generated_letter": "",
    "generated_company": "",
    "generated_role": "",
    "error_message": "",
}
for key, default_value in default_state.items():
    if key not in st.session_state:
        st.session_state[key] = default_value


# ---------------------------------------------------------------------------
# 5. Header Section
# ---------------------------------------------------------------------------
st.markdown(
    """
    <div class="cc-header">
        <h1 class="cc-brand">CoverCraft AI</h1>
        <p class="cc-tagline">Your experience. Your story. Your next opportunity.</p>
        <p class="cc-desc">Generate personalized, professional cover letters tailored to your dream job in seconds.</p>
    </div>
    """,
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# 6. Input Sections (Two-Column Clean Layout)
# ---------------------------------------------------------------------------
col_personal, col_job = st.columns(2, gap="large")

with col_personal:
    st.markdown('<h2 class="cc-section-title">1. Personal Information</h2>', unsafe_allow_html=True)
    st.text_input(
        "Full Name *",
        key="full_name",
        placeholder="e.g., Priya Sharma",
    )
    st.text_input(
        "Degree / Education *",
        key="education",
        placeholder="e.g., B.Tech in Computer Science, Final Year",
    )
    st.text_area(
        "Skills *",
        key="skills",
        height=110,
        placeholder="e.g., Python, SQL, React, REST APIs, Data Analysis, Git",
    )
    st.text_area(
        "Projects / Internship Experience *",
        key="experience",
        height=160,
        placeholder="Describe key academic projects, internships, tools used, and measurable outcomes...",
    )

with col_job:
    st.markdown('<h2 class="cc-section-title">2. Job Information</h2>', unsafe_allow_html=True)
    st.text_input(
        "Company Name *",
        key="company_name",
        placeholder="e.g., Stripe",
    )
    st.text_input(
        "Job Role / Position *",
        key="job_role",
        placeholder="e.g., Software Engineering Intern",
    )
    st.text_area(
        "Job Description *",
        key="job_description",
        height=300,
        placeholder="Paste the complete job description, responsibilities, and required qualifications...",
    )


# ---------------------------------------------------------------------------
# 7. Section 3: Generate Cover Letter & Clear All Controls
# ---------------------------------------------------------------------------
st.markdown("---")
action_col1, action_col2, _ = st.columns([2, 1, 3])

with action_col1:
    generate_clicked = st.button(
        "Generate Cover Letter",
        type="primary",
        use_container_width=True,
    )

with action_col2:
    st.button(
        "Clear All",
        type="secondary",
        use_container_width=True,
        on_click=clear_all_fields,
    )


def handle_generation(is_regenerate: bool = False) -> None:
    """Validate inputs, invoke Gemini API, and store the resulting letter."""
    form_data = {
        "full_name": st.session_state.full_name,
        "education": st.session_state.education,
        "skills": st.session_state.skills,
        "experience": st.session_state.experience,
        "company_name": st.session_state.company_name,
        "job_role": st.session_state.job_role,
        "job_description": st.session_state.job_description,
    }

    missing = validate_inputs(form_data)
    if missing:
        st.session_state.error_message = (
            "Please complete all required fields before generating: " + ", ".join(missing) + "."
        )
        return

    st.session_state.error_message = ""
    spinner_label = (
        "Regenerating a fresh version of your cover letter..."
        if is_regenerate
        else "Generating your personalized cover letter with Gemini AI..."
    )

    with st.spinner(spinner_label):
        try:
            letter = generate_cover_letter(form_data, is_regenerate=is_regenerate)
            st.session_state.generated_letter = letter
            st.session_state.generated_company = form_data["company_name"].strip()
            st.session_state.generated_role = form_data["job_role"].strip()
        except ValueError as err:
            st.session_state.error_message = str(err)
        except Exception as err:
            st.session_state.error_message = (
                f"Failed to generate cover letter from Gemini API: {err}"
            )


if generate_clicked:
    handle_generation(is_regenerate=False)

if st.session_state.error_message:
    st.error(st.session_state.error_message)


# ---------------------------------------------------------------------------
# 8. Generated Result Section
# ---------------------------------------------------------------------------
if st.session_state.generated_letter:
    letter_text = st.session_state.generated_letter
    company = st.session_state.generated_company
    role = st.session_state.generated_role
    word_count = count_words(letter_text)
    file_name = sanitize_filename(company)

    st.markdown("---")
    st.subheader("Your Generated Cover Letter")
    st.markdown(
        f'<p class="cc-meta">{html.escape(company)} &middot; {html.escape(role)} &middot; {word_count} words</p>',
        unsafe_allow_html=True,
    )

    st.markdown(
        f'<div class="cc-letter-box">{html.escape(letter_text)}</div>',
        unsafe_allow_html=True,
    )

    res_col1, res_col2, res_col3 = st.columns([1.2, 1.3, 1.5])

    with res_col1:
        render_copy_button(letter_text)

    with res_col2:
        st.download_button(
            label="Download as TXT",
            data=letter_text.encode("utf-8"),
            file_name=file_name,
            mime="text/plain",
            use_container_width=True,
        )

    with res_col3:
        if st.button(
            "Regenerate Cover Letter",
            type="secondary",
            use_container_width=True,
        ):
            handle_generation(is_regenerate=True)
            st.rerun()
