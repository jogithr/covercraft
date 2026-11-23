import { useEffect, useState } from 'react';
import { AlertCircle, Check, Copy, Download, Loader2 } from 'lucide-react';
import type { StreamlitSourceFile } from '../types';

export function StreamlitProjectView() {
  const [files, setFiles] = useState<StreamlitSourceFile[]>([]);
  const [selectedName, setSelectedName] = useState<string>('app.py');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFiles() {
      try {
        setLoading(true);
        const res = await fetch('/api/streamlit-files');
        if (!res.ok) {
          throw new Error('Could not load Python project files.');
        }
        const data = (await res.json()) as { files: StreamlitSourceFile[] };
        if (!cancelled) {
          setFiles(data.files);
          if (data.files.length > 0) {
            setSelectedName(data.files[0].name);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load source files.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFiles();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFile = files.find((f) => f.name === selectedName) ?? files[0] ?? null;

  const handleCopyFile = async (file: StreamlitSourceFile) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedFile(file.name);
      window.setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      setCopiedFile(null);
    }
  };

  const handleDownloadFile = (file: StreamlitSourceFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          CoverCraft-AI Python & Streamlit Project
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          Complete, beginner-friendly local Python implementation using Streamlit,{' '}
          <code className="font-mono text-sm text-slate-800">google-genai</code>, and{' '}
          <code className="font-mono text-sm text-slate-800">python-dotenv</code>. Inspect, copy,
          or download any file below to run locally.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 flex items-center justify-center gap-3 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
          <span>Loading project source files...</span>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="bg-white border border-red-200 rounded-xl p-6 flex items-start gap-3 text-sm text-red-800"
        >
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {/* File Tab Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-1 overflow-x-auto" role="tablist">
              {files.map((file) => {
                const isSelected = activeFile?.name === file.name;
                return (
                  <button
                    key={file.name}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedName(file.name)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-blue-700 border border-slate-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {file.name}
                  </button>
                );
              })}
            </div>

            {activeFile && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyFile(activeFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedFile === activeFile.name ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy File</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(activeFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {activeFile && (
            <div>
              <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-mono text-slate-700">{activeFile.path}</span>
                <span>{activeFile.description}</span>
              </div>
              <pre className="p-4 sm:p-6 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-800 bg-white max-h-[600px]">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
