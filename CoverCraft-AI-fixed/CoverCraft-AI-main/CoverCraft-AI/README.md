# CoverCraft AI – Intelligent Cover Letter Generator

> **Your experience. Your story. Your next opportunity.**

CoverCraft AI is a clean, beginner-friendly AI web application built with **Python**, **Streamlit**, and the **Google Gemini API (`google-genai` SDK)**. It helps students and job seekers create tailored, factual, ready-to-send cover letters under 300 words based on their real education, skills, projects, internship experience, and target job description.

---

## Project Structure

```text
CoverCraft-AI/
├── app.py              # Complete Streamlit UI and Gemini AI generation logic
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── .gitignore          # Files excluded from version control
└── README.md           # Setup and usage instructions
```

---

## Key Features

- **Structured Input Form**: Separate sections for Personal Information and Target Job Information.
- **Fact-Grounded Gemini AI Generation**: Connects real applicant skills and projects directly to the job description without inventing credentials.
- **Strict Under-300-Word Enforcement**: Automatically verifies and tightens output if it ever reaches 300 words.
- **Full Utility Controls**: Input validation, loading spinner, API error handling, live word count, Copy to Clipboard, Regenerate Cover Letter, Clear All, and `.txt` export (`Cover_Letter_CompanyName.txt`).
- **Secure API Key Handling**: Reads `GEMINI_API_KEY` exclusively from `.env` via `python-dotenv`.

---

## Step 1: Get a Free Gemini API Key from Google AI Studio

1. Open [Google AI Studio](https://aistudio.google.com/) and sign in with your Google account.
2. In the left sidebar (or top toolbar), click **Get API key**.
3. Click **Create API key** and select a Google Cloud project (or create a new one).
4. Copy the generated API key and store it safely — never paste it directly into `app.py` or commit it to GitHub.

---

## Step 2: Local Installation & Setup

### Prerequisites
- Python **3.10 or higher** installed (`python --version`)

### 1. Navigate to the Project Folder
```bash
cd CoverCraft-AI
```

### 2. Create and Activate a Virtual Environment

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Your API Key
Copy `.env.example` to `.env`:

**macOS / Linux:**
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

Open `.env` and replace `your_api_key_here` with your real Gemini API key:
```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

---

## Step 3: Run the Application Locally

Start the Streamlit server:
```bash
streamlit run app.py
```

Streamlit will launch automatically in your default browser at:
```text
http://localhost:8501
```

---

## Troubleshooting

- **`GEMINI_API_KEY is missing or not configured`**: Make sure your `.env` file is saved in the same folder as `app.py` and contains a valid key without extra quotes.
- **Module not found error**: Confirm your virtual environment is activated and re-run `pip install -r requirements.txt`.
- **Rate limit / quota error**: Wait a moment and retry, or check your Google AI Studio quota dashboard.
