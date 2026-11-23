interface GuidelinesViewProps {
  onBackToGenerator: () => void;
}

export function GuidelinesView({ onBackToGenerator }: GuidelinesViewProps) {
  const structureSteps = [
    {
      index: '01',
      title: 'Professional Opening',
      detail:
        'Begins cleanly with a direct salutation addressed to the hiring team at your target organization.',
    },
    {
      index: '02',
      title: 'Focused Applicant Introduction',
      detail:
        'Connects your current degree or educational background immediately to the specific position.',
    },
    {
      index: '03',
      title: 'Relevant Skills & Project Proof',
      detail:
        'Selects only the skills, coursework projects, and internship accomplishments that match the role.',
    },
    {
      index: '04',
      title: 'Direct Role Alignment',
      detail:
        'Explains how your concrete experience helps the team solve the responsibilities outlined in the job description.',
    },
    {
      index: '05',
      title: 'Confident Professional Closing',
      detail:
        'Closes concisely with clear next-step readiness and your full name, staying strictly under 300 words.',
    },
  ];

  const guardrails = [
    {
      title: 'Zero Fabricated Credentials',
      detail:
        'CoverCraft AI strictly uses only the education, skills, projects, and internship details you submit. It never invents prior employers, metrics, or certifications.',
    },
    {
      title: 'Strict Under-300-Word Limit',
      detail:
        'Hiring managers scan cover letters quickly. Every draft is verified server-side and automatically tightened if it ever approaches 300 words.',
    },
    {
      title: 'Ready-to-Send Formatting',
      detail:
        'Output contains clean business paragraphs with no commentary, markdown clutter, or filler clichés—ready to copy or download as a formatted .txt file.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Cover Letter Writing Standards
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">
            How CoverCraft AI structures every letter to stay concise, factual, and tailored to
            recruiter expectations.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToGenerator}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          Open Generator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
          <h2 className="text-base font-semibold text-slate-900">Five-Part Letter Architecture</h2>
          <p className="mt-1 text-sm text-slate-500">
            Every generated letter follows this exact paragraph progression.
          </p>

          <ol className="mt-6 divide-y divide-slate-200">
            {structureSteps.map((step) => (
              <li key={step.index} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <span className="font-mono text-xs font-medium text-blue-600 pt-1 tabular-nums shrink-0">
                  {step.index}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
          <h2 className="text-base font-semibold text-slate-900">Quality & Factual Guardrails</h2>
          <p className="mt-1 text-sm text-slate-500">
            Built-in rules enforced on every Gemini generation request.
          </p>

          <div className="mt-6 divide-y divide-slate-200">
            {guardrails.map((item) => (
              <div key={item.title} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
