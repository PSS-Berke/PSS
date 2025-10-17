import { useState } from 'react';

export default function AddModuleComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const modules = [
    {
      id: 'automations',
      name: 'Automations',
      icon: '⚡',
      description: 'Set up automated workflows',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'View insights and metrics',
    },
  ];

  const handleModuleClick = (moduleId) => {
    console.log(`Selected module: ${moduleId}`);
    setIsOpen(false);
    // Add your module selection logic here
  };

  return (
    <div className="p-8">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
      >
        + Add Module
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Module</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Module Options */}
            <div className="space-y-3">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{module.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                        {module.name}
                      </h3>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
