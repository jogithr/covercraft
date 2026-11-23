import type { FormEvent } from 'react';
import { AlertCircle, Loader2, RotateCcw, Send } from 'lucide-react';
import type { CoverLetterFormData, FieldErrors } from '../types';

interface CoverLetterFormProps {
  formData: CoverLetterFormData;
  fieldErrors: FieldErrors;
  formError: string | null;
  isLoading: boolean;
  onChange: (field: keyof CoverLetterFormData, value: string) => void;
  onSubmit: () => void;
  onClearAll: () => void;
}

export function CoverLetterForm({
  formData,
  fieldErrors,
  formError,
  isLoading,
  onChange,
  onSubmit,
  onClearAll,
}: CoverLetterFormProps) {
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const inputBaseClass =
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500';

  const getFieldClass = (field: keyof CoverLetterFormData) =>
    `${inputBaseClass} ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
        : 'border-slate-300 hover:border-slate-400'
    }`;

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs"
    >
      {formError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{formError}</p>
        </div>
      )}

      {/* Section 1: Personal Information */}
      <section aria-labelledby="personal-info-heading">
        <div className="mb-5">
          <h2
            id="personal-info-heading"
            className="text-base font-semibold text-slate-900 tracking-tight"
          >
            01. Personal Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Provide your real background. Only facts you enter here will appear in the letter.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Full Name <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Ananya Verma"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.fullName)}
                className={getFieldClass('fullName')}
              />
              {fieldErrors.fullName && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="education"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Degree / Education <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="education"
                type="text"
                value={formData.education}
                onChange={(e) => onChange('education', e.target.value)}
                disabled={isLoading}
                placeholder="e.g., B.Tech Computer Science, 2026"
                aria-invalid={Boolean(fieldErrors.education)}
                className={getFieldClass('education')}
              />
              {fieldErrors.education && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.education}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-800 mb-1.5">
              Skills <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id="skills"
              rows={3}
              value={formData.skills}
              onChange={(e) => onChange('skills', e.target.value)}
              disabled={isLoading}
              placeholder="List technical and professional skills (e.g., Python, SQL, React, FastAPI, Git, Data Visualization)"
              aria-invalid={Boolean(fieldErrors.skills)}
              className={`${getFieldClass('skills')} resize-y`}
            />
            {fieldErrors.skills && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.skills}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="experience"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Projects / Internship Experience{' '}
              <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id="experience"
              rows={4}
              value={formData.experience}
              onChange={(e) => onChange('experience', e.target.value)}
              disabled={isLoading}
              placeholder="Summarize relevant academic projects, internships, technologies used, and concrete outcomes..."
              aria-invalid={Boolean(fieldErrors.experience)}
              className={`${getFieldClass('experience')} resize-y`}
            />
            {fieldErrors.experience && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.experience}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <hr className="my-7 border-slate-200" />

      {/* Section 2: Job Information */}
      <section aria-labelledby="job-info-heading">
        <div className="mb-5">
          <h2
            id="job-info-heading"
            className="text-base font-semibold text-slate-900 tracking-tight"
          >
            02. Job Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Specify the company and paste the full job description to align your strengths.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Company Name <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => onChange('companyName', e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Atlassian"
                aria-invalid={Boolean(fieldErrors.companyName)}
                className={getFieldClass('companyName')}
              />
              {fieldErrors.companyName && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.companyName}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="jobRole"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Job Role / Position <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="jobRole"
                type="text"
                value={formData.jobRole}
                onChange={(e) => onChange('jobRole', e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Software Engineering Intern"
                aria-invalid={Boolean(fieldErrors.jobRole)}
                className={getFieldClass('jobRole')}
              />
              {fieldErrors.jobRole && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.jobRole}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="jobDescription"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Job Description <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id="jobDescription"
              rows={6}
              value={formData.jobDescription}
              onChange={(e) => onChange('jobDescription', e.target.value)}
              disabled={isLoading}
              placeholder="Paste the job posting, responsibilities, and required qualifications here..."
              aria-invalid={Boolean(fieldErrors.jobDescription)}
              className={`${getFieldClass('jobDescription')} resize-y`}
            />
            {fieldErrors.jobDescription && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.jobDescription}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Primary & Secondary Actions */}
      <div className="mt-7 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-65 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Generating Cover Letter...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Generate Cover Letter</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClearAll}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Clear All</span>
        </button>
      </div>
    </form>
  );
}
