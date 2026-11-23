import { useState } from 'react';
import { CoverLetterForm } from './components/CoverLetterForm';
import { CoverLetterResult } from './components/CoverLetterResult';
import { GuidelinesView } from './components/GuidelinesView';
import { Header } from './components/Header';
import { StreamlitProjectView } from './components/StreamlitProjectView';
import type {
  ActiveView,
  CoverLetterFormData,
  FieldErrors,
  GeneratedCoverLetter,
} from './types';

const INITIAL_FORM_DATA: CoverLetterFormData = {
  fullName: '',
  education: '',
  skills: '',
  experience: '',
  companyName: '',
  jobRole: '',
  jobDescription: '',
};

const REQUIRED_FIELD_LABELS: Record<keyof CoverLetterFormData, string> = {
  fullName: 'Full Name is required.',
  education: 'Degree / Education is required.',
  skills: 'Skills are required.',
  experience: 'Projects / Internship Experience is required.',
  companyName: 'Company Name is required.',
  jobRole: 'Job Role / Position is required.',
  jobDescription: 'Job Description is required.',
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('generator');
  const [formData, setFormData] = useState<CoverLetterFormData>(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratedCoverLetter | null>(null);

  const handleFieldChange = (field: keyof CoverLetterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    (Object.keys(REQUIRED_FIELD_LABELS) as Array<keyof CoverLetterFormData>).forEach((key) => {
      if (!formData[key].trim()) {
        errors[key] = REQUIRED_FIELD_LABELS[key];
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError('Please fill in all required fields highlighted below before generating.');
      return false;
    }

    setFormError(null);
    return true;
  };

  const requestCoverLetter = async (regenerate: boolean) => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setIsRegenerating(regenerate);
    setApiError(null);

    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isRegenerate: regenerate,
        }),
      });

      const rawText = await response.text();
      let payload: Partial<GeneratedCoverLetter> & { error?: string } = {};
      if (rawText) {
        try {
          payload = JSON.parse(rawText) as Partial<GeneratedCoverLetter> & { error?: string };
        } catch {
          throw new Error(
            response.ok
              ? "The server returned an invalid response. Please try again."
              : `Server error (${response.status}): ${rawText.slice(0, 120)}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          payload.error || 'Failed to generate cover letter. Please verify your inputs and retry.',
        );
      }

      if (!payload.coverLetter) {
        throw new Error('The AI service returned an empty letter. Please try again.');
      }

      setResult({
        coverLetter: payload.coverLetter,
        wordCount: payload.wordCount ?? payload.coverLetter.trim().split(/\s+/).filter(Boolean).length,
        companyName: payload.companyName ?? formData.companyName.trim(),
        jobRole: payload.jobRole ?? formData.jobRole.trim(),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Network error while connecting to the cover letter service.';
      setApiError(message);
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleClearAll = () => {
    setFormData(INITIAL_FORM_DATA);
    setFieldErrors({});
    setFormError(null);
    setApiError(null);
    setResult(null);
  };

  const handleStartNewDraft = () => {
    handleClearAll();
    setActiveView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        onStartNewDraft={handleStartNewDraft}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeView === 'generator' && (
          <div>
            {/* Workspace Header */}
            <div className="pb-8 border-b border-slate-200">
              <p className="text-sm font-medium text-blue-600">
                Your experience. Your story. Your next opportunity.
              </p>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Intelligent Cover Letter Generator
              </h1>
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Generate personalized, professional cover letters tailored to your dream job in
                seconds.
              </p>
            </div>

            {/* Two-Column Productivity Layout */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <CoverLetterForm
                  formData={formData}
                  fieldErrors={fieldErrors}
                  formError={formError}
                  isLoading={isLoading}
                  onChange={handleFieldChange}
                  onSubmit={() => requestCoverLetter(false)}
                  onClearAll={handleClearAll}
                />
              </div>

              <div className="lg:col-span-6 lg:sticky lg:top-24">
                <CoverLetterResult
                  result={result}
                  isLoading={isLoading}
                  isRegenerating={isRegenerating}
                  apiError={apiError}
                  onRegenerate={() => requestCoverLetter(true)}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'guidelines' && (
          <GuidelinesView onBackToGenerator={() => setActiveView('generator')} />
        )}

        {activeView === 'streamlit' && <StreamlitProjectView />}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>CoverCraft AI — Intelligent Cover Letter Generator</span>
          <div className="flex items-center gap-2">
            <span>Under 300 words</span>
            <span aria-hidden="true">·</span>
            <span>Fact-grounded drafts</span>
            <span aria-hidden="true">·</span>
            <span>TXT export ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
