import type { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onStartNewDraft: () => void;
}

export function Header({ activeView, onSelectView, onStartNewDraft }: HeaderProps) {
  const navItems: { id: ActiveView; label: string }[] = [
    { id: 'generator', label: 'Generator' },
    { id: 'guidelines', label: 'Letter Standards' },
    { id: 'streamlit', label: 'Python Project' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('generator')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded-sm cursor-pointer"
        >
          CoverCraft AI
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav aria-label="Primary navigation" className="flex items-center gap-6 sm:gap-8">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded-sm ${
                  isActive
                    ? 'text-blue-600 after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-[19px] after:h-[2px] after:bg-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="hidden sm:flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartNewDraft}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            New Draft
          </button>
        </div>
      </div>
    </header>
  );
}
