/**
 * Pagination Component - Usage Examples
 *
 * This file demonstrates various use cases for the Pagination component
 * in a conversational AI dashboard context.
 */

import { useState } from 'react';
import { Pagination } from './Pagination';

/**
 * Example 1: Basic Pagination with Conversations
 * Most common use case - paginating a list of conversations
 */
export function ConversationsPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Mock data - replace with actual conversation data
  const totalConversations = 247;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Conversations</h2>

      {/* Your conversation list component here */}
      <div className="space-y-4">
        {/* ConversationCard components would go here */}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalConversations}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          setCurrentPage(1); // Reset to first page when changing page size
        }}
        itemLabel="conversations"
      />
    </div>
  );
}

/**
 * Example 2: Pagination with Agents
 * Demonstrates custom page size options and different item label
 */
export function AgentsPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const totalAgents = 156;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">AI Agents</h2>

      {/* Agent grid would go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AgentCard components would go here */}
      </div>

      {/* Pagination with custom page sizes suitable for grid layout */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalAgents}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[12, 24, 48, 96]} // Grid-friendly numbers
        itemLabel="agents"
      />
    </div>
  );
}

/**
 * Example 3: Pagination with API Integration
 * Shows how to integrate with backend API calls
 */
export function ApiIntegratedPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data when page or items per page changes
  const fetchData = async (page: number, limit: number) => {
    setIsLoading(true);
    try {
      // Example API call
      const response = await fetch(
        `/api/conversations?page=${page}&limit=${limit}`
      );
      const result = await response.json();

      setData(result.items);
      setTotalItems(result.total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage, itemsPerPage);

    // Optional: Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page changes
  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
    fetchData(1, newSize);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Call History</h2>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-galaxy-500" />
        </div>
      )}

      {/* Data list */}
      {!isLoading && (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.id} className="glass rounded-xl p-4">
              {/* Item content */}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="calls"
      />
    </div>
  );
}

/**
 * Example 4: Empty State Handling
 * Shows how pagination behaves with no items
 */
export function EmptyStatePaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const totalItems = 0; // No items

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Search Results</h2>

      {/* Empty state message */}
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-white/60 text-lg">No results found</p>
      </div>

      {/* Pagination gracefully handles empty state */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="results"
      />
    </div>
  );
}

/**
 * Example 5: Small Dataset (Less than one page)
 * Pagination handles small datasets elegantly
 */
export function SmallDatasetExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const totalItems = 8; // Less than one page

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Recent Calls</h2>

      <div className="space-y-4">
        {/* Show all 8 items */}
      </div>

      {/* Pagination shows item count but hides navigation when only 1 page */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          setCurrentPage(1);
        }}
        itemLabel="calls"
      />
    </div>
  );
}

/**
 * Example 6: Large Dataset
 * Demonstrates pagination with many pages
 */
export function LargeDatasetExample() {
  const [currentPage, setCurrentPage] = useState(42); // Middle page for demo
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = 10000; // Large dataset

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">All Conversations</h2>

      <div className="space-y-4">
        {/* List items */}
      </div>

      {/* Pagination automatically uses ellipsis for large page counts */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          setCurrentPage(1);
        }}
        itemLabel="conversations"
      />
    </div>
  );
}

/**
 * Example 7: Custom Page Size Options
 * Shows how to customize available page sizes
 */
export function CustomPageSizesExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalItems = 500;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Data</h2>

      <div className="space-y-4">
        {/* Data items */}
      </div>

      {/* Custom page size options for specific use case */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newSize) => {
          setItemsPerPage(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[20, 50, 100, 200]} // Custom sizes
        itemLabel="records"
      />
    </div>
  );
}

/**
 * Example 8: Accessibility Features Demo
 * Demonstrates keyboard navigation and screen reader support
 */
export function AccessibilityExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Accessibility Features</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li>✓ Full keyboard navigation (Tab, Enter, Space)</li>
          <li>✓ ARIA labels for screen readers</li>
          <li>✓ Focus visible indicators</li>
          <li>✓ Current page announcement (aria-current)</li>
          <li>✓ Descriptive button labels</li>
          <li>✓ Disabled state indicators</li>
          <li>✓ Reduced motion support</li>
        </ul>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={247}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="items"
      />

      <div className="glass rounded-xl p-4 text-sm text-white/60">
        <p>
          <strong className="text-white">Tip:</strong> Try using keyboard navigation:
        </p>
        <ul className="mt-2 space-y-1 ml-4">
          <li>• Press Tab to navigate between buttons</li>
          <li>• Press Enter or Space to activate</li>
          <li>• Visual focus indicators show current element</li>
        </ul>
      </div>
    </div>
  );
}
