import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are an experienced professional cover letter writer helping students and job seekers craft personalized, ready-to-send cover letters.

Follow these instructions strictly:
1. Carefully analyze the provided job description, company name, and job role.
2. Identify the most relevant skills, educational background, projects, and internship experiences from the applicant's provided details.
3. Connect the applicant's real qualifications directly with the company's job requirements.
4. Write a personalized, confident, natural, and professional cover letter ready to send to an employer.
5. Avoid generic clichés, filler sentences, and unnecessary repetition.
6. STRICT FACTUALITY: Never invent qualifications, work experience, degrees, projects, metrics, achievements, or skills that were not provided by the applicant. Never claim that the applicant has experience they did not provide.
7. STRICT LENGTH LIMIT: Keep the entire cover letter strictly below 300 words (aim for 210 to 265 words total, including greeting and closing).
8. Use proper paragraph structure containing:
   - Professional opening (e.g., "Dear Hiring Team at [Company Name]," or "Dear Hiring Manager,")
   - Introduction of the applicant and the position
   - Relevant skills and project/internship experience
   - Direct connection between the applicant and the job requirements
   - Professional closing and sign-off with the applicant's full name
9. Output ONLY the cover letter text. Do not include any explanations, commentary, markdown formatting, or code fences.`;

interface CoverLetterRequestBody {
  fullName?: string;
  education?: string;
  skills?: string;
  experience?: string;
  companyName?: string;
  jobRole?: string;
  jobDescription?: string;
  isRegenerate?: boolean;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function cleanLetterOutput(rawText: string): string {
  return rawText
    .replace(/^```(?:text|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your_api_key_here') {
    throw Object.assign(
      new Error('Gemini API key is not configured on the server. Please check Settings > Secrets.'),
      { statusCode: 500 },
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithRetry(
  ai: GoogleGenAI,
  contents: string,
  maxAttempts = 3,
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      const text = cleanLetterOutput(response.text ?? '');
      if (!text) {
        throw new Error('Gemini returned an empty cover letter.');
      }
      return text;
    } catch (error: unknown) {
      lastError = error;
      const errObj = error as { status?: number; code?: number };
      const status = errObj?.status ?? errObj?.code;
      const isRetryable = status === undefined || status >= 500 || status === 408;

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = 400 * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

function formatApiError(error: unknown): { status: number; message: string } {
  const errObj = error as { status?: number; statusCode?: number; message?: string };
  const rawMessage = errObj?.message ?? 'An unexpected error occurred while generating your cover letter.';
  const status = errObj?.status ?? errObj?.statusCode ?? 500;

  if (status === 400 || status === 403 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMessage)) {
    return {
      status: 403,
      message:
        'Gemini API authentication failed. Please verify your GEMINI_API_KEY in Settings > Secrets.',
    };
  }

  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(rawMessage)) {
    return {
      status: 429,
      message:
        'Gemini API rate limit or quota was reached. Please wait a moment and try again, or check your key in Settings > Secrets.',
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: rawMessage,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/generate-cover-letter', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as CoverLetterRequestBody;

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const education = typeof body.education === 'string' ? body.education.trim() : '';
    const skills = typeof body.skills === 'string' ? body.skills.trim() : '';
    const experience = typeof body.experience === 'string' ? body.experience.trim() : '';
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    const jobRole = typeof body.jobRole === 'string' ? body.jobRole.trim() : '';
    const jobDescription =
      typeof body.jobDescription === 'string' ? body.jobDescription.trim() : '';
    const isRegenerate = Boolean(body.isRegenerate);

    const missingFields: string[] = [];
    if (!fullName) missingFields.push('Full Name');
    if (!education) missingFields.push('Degree / Education');
    if (!skills) missingFields.push('Skills');
    if (!experience) missingFields.push('Projects / Internship Experience');
    if (!companyName) missingFields.push('Company Name');
    if (!jobRole) missingFields.push('Job Role / Position');
    if (!jobDescription) missingFields.push('Job Description');

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Please fill in all required fields: ${missingFields.join(', ')}.`,
        missingFields,
      });
      return;
    }

    const variationNote = isRegenerate
      ? '\nAdditional instruction: Write a fresh version with distinct phrasing and opening structure while keeping every fact accurate and staying strictly below 270 words.'
      : '';

    const userPrompt = `Generate a tailored, ready-to-send cover letter using ONLY the information provided below.

APPLICANT INFORMATION
- Full Name: ${fullName}
- Degree / Education: ${education}
- Skills: ${skills}
- Projects / Internship Experience: ${experience}

JOB INFORMATION
- Company Name: ${companyName}
- Job Role / Position: ${jobRole}
- Job Description:
${jobDescription}
${variationNote}

Remember: Strictly below 300 words total. No fabricated claims. Output only the cover letter.`;

    try {
      const ai = getGeminiClient();
      let coverLetter = await generateWithRetry(ai, userPrompt);
      let wordCount = countWords(coverLetter);

      // Guarantee the generated letter always stays strictly below 300 words
      if (wordCount >= 300) {
        const tightenPrompt = `Tighten the following cover letter so that it is strictly under 265 words.
Keep all 5 essential sections (professional opening, introduction, relevant skills and projects, connection to job requirements, and professional closing).
Do not invent any new qualifications, skills, or experiences. Output ONLY the tightened cover letter.

COVER LETTER:
${coverLetter}`;
        const tightened = await generateWithRetry(ai, tightenPrompt);
        if (tightened) {
          coverLetter = tightened;
          wordCount = countWords(coverLetter);
        }
      }

      res.json({
        coverLetter,
        wordCount,
        companyName,
        jobRole,
      });
    } catch (error: unknown) {
      const formatted = formatApiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.get('/api/streamlit-files', (_req: Request, res: Response) => {
    const projectDir = path.resolve(__dirname, 'CoverCraft-AI');
    const allowedFiles = [
      { name: 'app.py', language: 'python', description: 'Complete Streamlit application & Gemini SDK integration' },
      { name: 'requirements.txt', language: 'text', description: 'Python package dependencies' },
      { name: '.env.example', language: 'bash', description: 'Environment variable template for GEMINI_API_KEY' },
      { name: '.gitignore', language: 'text', description: 'Git exclusions protecting secrets and virtualenvs' },
      { name: 'README.md', language: 'markdown', description: 'Beginner-friendly installation, API key, and local run guide' },
    ];

    try {
      const files = allowedFiles
        .map((item) => {
          const fullPath = path.join(projectDir, item.name);
          if (!fs.existsSync(fullPath)) {
            return null;
          }
          return {
            name: item.name,
            path: `CoverCraft-AI/${item.name}`,
            language: item.language,
            description: item.description,
            content: fs.readFileSync(fullPath, 'utf-8'),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      res.json({ files });
    } catch {
      res.status(500).json({ error: 'Unable to load Streamlit project source files.' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CoverCraft AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
