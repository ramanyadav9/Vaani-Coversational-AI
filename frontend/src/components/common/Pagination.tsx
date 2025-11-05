import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '../../lib/utils';

/**
 * Pagination component props interface
 * Provides comprehensive pagination controls with items per page selection
 */
interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items to display per page */
  itemsPerPage: number;
  /** Callback fired when page changes */
  onPageChange: (page: number) => void;
  /** Callback fired when items per page changes */
  onItemsPerPageChange: (itemsPerPage: number) => void;
  /** Optional custom page size options (defaults to [10, 25, 50, 100]) */
  pageSizeOptions?: number[];
  /** Optional label for the items being paginated (e.g., "agents", "conversations") */
  itemLabel?: string;
}

/**
 * Generates an array of page numbers to display in the pagination controls
 * Implements smart pagination with ellipsis for large page counts
 *
 * Logic:
 * - Always show first and last page
 * - Show current page and 2 neighbors on each side
 * - Use ellipsis (...) for gaps
 * - Example: [1, ..., 4, 5, 6, 7, 8, ..., 20]
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    // If 7 or fewer pages, show all
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const showLeftEllipsis = currentPage > 4;
  const showRightEllipsis = currentPage < totalPages - 3;

  if (showLeftEllipsis) {
    pages.push('ellipsis');
  }

  // Determine the range of pages to show around current page
  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push('ellipsis');
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Pagination - Beautiful, accessible pagination component with galaxy theme
 *
 * Features:
 * - Smart page number generation with ellipsis
 * - First/Last and Previous/Next navigation
 * - Items per page selector
 * - Item count display ("Showing X-Y of Z")
 * - Fully keyboard accessible
 * - Smooth animations with Framer Motion
 * - Responsive design (mobile-friendly with proper touch targets)
 * - Glassmorphism design matching app theme
 *
 * UX Improvements:
 * - Larger touch targets (44px minimum on mobile)
 * - Better visual grouping and spacing
 * - Enhanced contrast for better readability
 * - Optimized animations for performance
 * - Consistent button sizing across all controls
 */
export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = 'items',
}: PaginationProps) {
  // Calculate derived pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array
  const pageNumbers = useMemo(
    () => generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  // Navigation handlers
  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => onPageChange(totalPages);
  const goToPage = (page: number) => onPageChange(page);

  // Disabled states
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const hasNoItems = totalItems === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      {/* Main Pagination Container with improved glassmorphism */}
      <div className="glass rounded-2xl p-4 sm:p-6 space-y-5">
        {/* Top Section: Item Count + Page Size Selector (side by side on desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Item Count Display with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-center sm:text-left"
          >
            {hasNoItems ? (
              <span className="text-sm text-white/60 font-medium">No {itemLabel} found</span>
            ) : (
              <div className="flex items-baseline justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-sm text-white/60">Showing</span>
                <span className="text-base font-semibold text-galaxy-400 font-mono">
                  {startItem}–{endItem}
                </span>
                <span className="text-sm text-white/60">of</span>
                <span className="text-base font-semibold text-white font-mono">{totalItems}</span>
                <span className="text-sm text-white/60">{itemLabel}</span>
              </div>
            )}
          </motion.div>

          {/* Items Per Page Selector - now alongside count */}
          {!hasNoItems && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center justify-center sm:justify-end gap-3"
            >
              <span className="text-sm text-white/60 font-medium whitespace-nowrap">
                Per page:
              </span>
              <div className="flex items-center gap-2">
                {pageSizeOptions.map((size) => {
                  const isActive = size === itemsPerPage;

                  return (
                    <motion.button
                      key={size}
                      onClick={() => onItemsPerPageChange(size)}
                      className={cn(
                        'min-w-[3rem] h-10 px-3 rounded-lg font-semibold text-sm transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-galaxy-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                        isActive
                          ? 'bg-galaxy-600/40 text-galaxy-300 border-2 border-galaxy-500/60 shadow-lg shadow-galaxy-600/30'
                          : 'bg-white/5 text-white/60 border border-white/20 hover:bg-white/10 hover:text-white/90 hover:border-white/30'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      aria-label={`Show ${size} items per page`}
                      aria-pressed={isActive}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Page Navigation Controls - centered and prominent */}
        {!hasNoItems && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {/* First Page Button */}
            <PaginationButton
              onClick={goToFirstPage}
              disabled={isFirstPage}
              aria-label="Go to first page"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </PaginationButton>

            {/* Previous Page Button */}
            <PaginationButton
              onClick={goToPreviousPage}
              disabled={isFirstPage}
              aria-label="Go to previous page"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </PaginationButton>

            {/* Visual separator */}
            <div className="w-px h-8 bg-white/10 mx-1" aria-hidden="true" />

            {/* Page Number Buttons */}
            <div className="flex items-center gap-2">
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === 'ellipsis') {
                  return (
                    <div
                      key={`ellipsis-${index}`}
                      className="min-w-[2.75rem] h-11 flex items-center justify-center text-white/40"
                      aria-hidden="true"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </div>
                  );
                }

                const isActive = pageNum === currentPage;

                return (
                  <PaginationButton
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    isActive={isActive}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={isActive ? 'page' : undefined}
                    title={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}
            </div>

            {/* Visual separator */}
            <div className="w-px h-8 bg-white/10 mx-1" aria-hidden="true" />

            {/* Next Page Button */}
            <PaginationButton
              onClick={goToNextPage}
              disabled={isLastPage}
              aria-label="Go to next page"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </PaginationButton>

            {/* Last Page Button */}
            <PaginationButton
              onClick={goToLastPage}
              disabled={isLastPage}
              aria-label="Go to last page"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </PaginationButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * PaginationButton - Reusable button component for pagination controls
 * Handles both icon buttons and page number buttons with consistent styling
 *
 * Improvements:
 * - Minimum 44px touch target on all screens
 * - Enhanced contrast ratios
 * - Refined active state without distracting animations
 * - Better disabled state visibility
 */
interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  'aria-label': string;
  'aria-current'?: 'page';
  title?: string;
}

function PaginationButton({
  onClick,
  disabled = false,
  isActive = false,
  children,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  title,
}: PaginationButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      title={title}
      className={cn(
        // Base sizing - 44px touch target minimum
        'min-w-[2.75rem] h-11 px-3 rounded-lg font-semibold text-sm',
        'flex items-center justify-center transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-galaxy-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        // Active state - prominent and clear
        isActive && [
          'bg-galaxy-600/40 text-galaxy-300 border-2 border-galaxy-500/60',
          'shadow-lg shadow-galaxy-600/30',
          'relative',
        ],
        // Disabled state - visible but clearly disabled
        disabled && [
          'opacity-50 cursor-not-allowed',
          'bg-white/5 text-white/40 border border-white/10',
        ],
        // Default/Enabled state - enhanced contrast
        !isActive && !disabled && [
          'bg-white/5 text-white/70 border border-white/20',
          'hover:bg-white/10 hover:text-white hover:border-white/30',
          'hover:shadow-md hover:shadow-galaxy-600/20',
        ]
      )}
      whileHover={!disabled ? { scale: 1.05, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      // Reduced animation for active state - subtle pulse only on hover
      animate={
        isActive
          ? {
              boxShadow: [
                '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                '0 10px 15px -3px rgba(99, 102, 241, 0.5)',
                '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
              ],
            }
          : {}
      }
      transition={
        isActive
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : { duration: 0.2 }
      }
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
