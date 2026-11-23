import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { GeneratedCoverLetter } from '../types';

interface CoverLetterResultProps {
  result: GeneratedCoverLetter | null;
  isLoading: boolean;
  isRegenerating: boolean;
  apiError: string | null;
  onRegenerate: () => void;
}

function buildTxtFilename(companyName: string): string {
  const sanitized = companyName
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `Cover_Letter_${sanitized || 'Company'}.txt`;
}

export function CoverLetterResult({
  result,
  isLoading,
  isRegenerating,
  apiError,
  onRegenerate,
}: CoverLetterResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.coverLetter);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result.coverLetter;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const filename = buildTxtFilename(result.companyName);
    const blob = new Blob([`${result.coverLetter.trim()}\n`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading state (initial generation or regeneration)
  if (isLoading) {
    return (
      <section
        aria-live="polite"
        aria-busy="true"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs"
      >
        <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isRegenerating
                ? 'Regenerating Your Cover Letter'
                : 'Crafting Your Cover Letter'}
            </h2>
            <p className="text-sm text-slate-500">
              Matching your skills and project experience to the role requirements...
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 animate-pulse" aria-hidden="true">
          <div className="h-3.5 w-44 rounded bg-slate-200" />
          <div className="space-y-2.5 pt-2">
            <div className="h-3.5 w-full rounded bg-slate-100" />
            <div className="h-3.5 w-11/12 rounded bg-slate-100" />
            <div className="h-3.5 w-4/5 rounded bg-slate-100" />
          </div>
          <div className="space-y-2.5 pt-3">
            <div className="h-3.5 w-full rounded bg-slate-100" />
            <div className="h-3.5 w-full rounded bg-slate-100" />
            <div className="h-3.5 w-10/12 rounded bg-slate-100" />
            <div className="h-3.5 w-3/4 rounded bg-slate-100" />
          </div>
          <div className="space-y-2.5 pt-3">
            <div className="h-3.5 w-11/12 rounded bg-slate-100" />
            <div className="h-3.5 w-5/6 rounded bg-slate-100" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-3.5 w-28 rounded bg-slate-200" />
            <div className="h-3.5 w-36 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  // API Error state when no result is yet available
  if (apiError && !result) {
    return (
      <section
        role="alert"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">
              Unable to Generate Cover Letter
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{apiError}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state before first generation
  if (!result) {
    return (
      <section
        aria-labelledby="preview-empty-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs"
      >
        <div className="flex items-center gap-2.5 text-slate-900">
          <FileText className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />
          <h2 id="preview-empty-heading" className="text-base font-semibold tracking-tight">
            Your Generated Cover Letter
          </h2>
        </div>

        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
          Complete the personal and job information fields on the left, then select{' '}
          <span className="font-medium text-slate-900">Generate Cover Letter</span>. Your tailored,
          submission-ready draft will appear here.
        </p>

        <hr className="my-6 border-slate-200" />

        <div className="space-y-3.5">
          <p className="text-xs font-medium text-slate-500">Included in every generated draft</p>
          <ol className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-slate-400 tabular-nums">01</span>
              <span>Professional opening addressed to the hiring team</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-slate-400 tabular-nums">02</span>
              <span>Clear introduction tying your degree to the target role</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-slate-400 tabular-nums">03</span>
              <span>Relevant skills, academic projects, and internship highlights</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-slate-400 tabular-nums">04</span>
              <span>Direct alignment with the company&apos;s job description</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-slate-400 tabular-nums">05</span>
              <span>Concise closing under 300 words with zero invented claims</span>
            </li>
          </ol>
        </div>
      </section>
    );
  }

  const downloadFileName = buildTxtFilename(result.companyName);

  // Populated Generated Result Section
  return (
    <section
      aria-labelledby="generated-letter-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs"
    >
      {/* Header & Unboxed Metadata */}
      <div className="pb-5 border-b border-slate-200">
        <h2
          id="generated-letter-heading"
          className="text-lg font-semibold text-slate-900 tracking-tight"
        >
          Your Generated Cover Letter
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
          <span className="font-medium text-slate-900">{result.companyName}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>{result.jobRole}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="font-mono text-xs text-slate-600 tabular-nums">
            {result.wordCount} words
          </span>
        </div>
      </div>

      {apiError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
          <p>{apiError}</p>
        </div>
      )}

      {/* Letter Content Canvas */}
      <div className="mt-6 text-[15px] leading-[1.75] text-slate-800 whitespace-pre-wrap font-normal">
        {result.coverLetter}
      </div>

      {/* Action Bar */}
      <div className="mt-7 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            title={`Download ${downloadFileName}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download as TXT</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Regenerate Cover Letter</span>
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500 font-mono">
        Export filename: {downloadFileName}
      </p>
    </section>
  );
}
