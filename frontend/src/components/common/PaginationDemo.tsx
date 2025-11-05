/**
 * Pagination Component Demo
 *
 * Quick visual demo of the Pagination component
 * Can be temporarily imported into your app to test the component
 */

import { useState } from 'react';
import { Pagination } from './Pagination';

export function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Mock data scenarios
  const scenarios = [
    { name: 'Large Dataset', total: 2470, label: 'conversations' },
    { name: 'Medium Dataset', total: 156, label: 'agents' },
    { name: 'Small Dataset', total: 23, label: 'calls' },
    { name: 'Empty Dataset', total: 0, label: 'results' },
  ];

  const [selectedScenario, setSelectedScenario] = useState(0);
  const currentScenario = scenarios[selectedScenario];

  return (
    <div className="min-h-screen cosmic-bg p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Pagination Component Demo</h1>
          <p className="text-white/60">
            Beautiful, accessible pagination for conversational AI dashboards
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Test Scenarios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {scenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedScenario(index);
                  setCurrentPage(1);
                }}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedScenario === index
                    ? 'bg-galaxy-600/30 border-2 border-galaxy-500/50 text-white'
                    : 'bg-white/5 border-2 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-semibold">{scenario.name}</div>
                <div className="text-sm mt-1 opacity-75">
                  {scenario.total} {scenario.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current State Info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Current State</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-white/60 text-sm mb-1">Current Page</div>
              <div className="text-2xl font-bold text-galaxy-400 font-mono">
                {currentPage}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-white/60 text-sm mb-1">Items Per Page</div>
              <div className="text-2xl font-bold text-galaxy-400 font-mono">
                {itemsPerPage}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-white/60 text-sm mb-1">Total Pages</div>
              <div className="text-2xl font-bold text-white font-mono">
                {Math.ceil(currentScenario.total / itemsPerPage) || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Mock Content List */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {currentScenario.name} - Mock Data
          </h2>

          {currentScenario.total === 0 ? (
            <div className="text-center py-12 text-white/60">
              <p className="text-lg">No items to display</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: Math.min(itemsPerPage, currentScenario.total) }).map(
                (_, index) => {
                  const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  if (itemNumber > currentScenario.total) return null;

                  return (
                    <div
                      key={itemNumber}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-galaxy-600/20 flex items-center justify-center text-galaxy-400 font-bold">
                            {itemNumber}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {currentScenario.label.charAt(0).toUpperCase() +
                                currentScenario.label.slice(0, -1)}{' '}
                              #{itemNumber}
                            </div>
                            <div className="text-white/60 text-sm">
                              Mock data for testing pagination
                            </div>
                          </div>
                        </div>
                        <div className="text-white/40 text-xs font-mono">
                          Page {currentPage}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={currentScenario.total}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            console.log('Page changed to:', page);
          }}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
            console.log('Items per page changed to:', size);
          }}
          itemLabel={currentScenario.label}
        />

        {/* Feature Highlights */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/70">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Smart page number generation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Ellipsis for large page counts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>First/Last page navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Previous/Next navigation</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Customizable page sizes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Item count display</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Keyboard accessible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-galaxy-400" />
                <span>Smooth animations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Try It Out</h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>• Select different scenarios to see how pagination adapts</li>
            <li>• Click page numbers to navigate directly to a page</li>
            <li>• Use arrow buttons for sequential navigation</li>
            <li>• Try different items per page options</li>
            <li>• Test keyboard navigation with Tab and Enter</li>
            <li>• Notice the smooth animations and hover effects</li>
            <li>• Check how empty state is handled</li>
            <li>• Observe responsive behavior on mobile</li>
          </ul>
        </div>

        {/* Integration Code */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Quick Integration</h2>
          <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-galaxy-400 font-mono">
{`import { Pagination } from './components/common/Pagination';

function MyComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  return (
    <Pagination
      currentPage={page}
      totalItems={247}
      itemsPerPage={pageSize}
      onPageChange={setPage}
      onItemsPerPageChange={setPageSize}
      itemLabel="conversations"
    />
  );
}`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
