import React from 'react';

const SidebarNavigation = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'basic', label: 'Basic Information', icon: '👤' },
    { id: 'address', label: 'Address', icon: '📍' },
    { id: 'passport', label: 'Passport Details', icon: '🛂' },
    { id: 'list', label: 'List', icon: '📋' },
    { id: 'documents', label: 'Document Details', icon: '📄' },
  ];

  return (
    <div className="w-full lg:w-64 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-6 h-fit lg:sticky lg:top-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 mb-4 hidden lg:block">
          Navigation
        </h2>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeSection === section.id
                ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                : 'text-slate-700 hover:bg-slate-50 border-2 border-transparent'
            }`}
          >
            <span className="text-xl">{section.icon}</span>
            <span className="font-medium text-sm">{section.label}</span>
            {activeSection === section.id && (
              <span className="ml-auto">
                <svg
                  className="h-4 w-4 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SidebarNavigation;

