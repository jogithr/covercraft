export interface CoverLetterFormData {
  fullName: string;
  education: string;
  skills: string;
  experience: string;
  companyName: string;
  jobRole: string;
  jobDescription: string;
}

export interface GeneratedCoverLetter {
  coverLetter: string;
  wordCount: number;
  companyName: string;
  jobRole: string;
}

export interface StreamlitSourceFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export type ActiveView = 'generator' | 'guidelines' | 'streamlit';

export type FieldErrors = Partial<Record<keyof CoverLetterFormData, string>>;
