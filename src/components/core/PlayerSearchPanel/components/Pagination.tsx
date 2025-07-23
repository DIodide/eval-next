import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  onPrefetchPage?: (page: number) => void; // Optional prefetch callback
}

/**
 * Pagination component with page numbers and navigation controls
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
  hasNextPage,
  hasPreviousPage,
  totalCount,
  pageSize,
  onPrefetchPage,
}: PaginationProps) {
  // Calculate the range of pages to show
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const halfRange = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    // Adjust if we're near the beginning or end
    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - halfRange) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-700 bg-gray-900 px-6 py-4">
      {/* Page Info */}
      <div className="text-sm text-gray-400">
        Showing <span className="font-medium text-white">{startItem}</span> to{" "}
        <span className="font-medium text-white">{endItem}</span> of{" "}
        <span className="font-medium text-white">{totalCount}</span> players
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          onMouseEnter={() =>
            hasPreviousPage && onPrefetchPage?.(currentPage - 1)
          }
          className="border-gray-600 bg-gray-900 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex space-x-1">
          {/* First page if not visible */}
          {pageNumbers.length > 0 && pageNumbers[0]! > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                className="border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
              >
                1
              </Button>
              {pageNumbers[0]! > 2 && (
                <span className="px-2 py-1 text-gray-500">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              onMouseEnter={() =>
                page !== currentPage && onPrefetchPage?.(page)
              }
              className={
                currentPage === page
                  ? "bg-cyan-600 text-white hover:bg-cyan-700"
                  : "border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
              }
            >
              {page}
            </Button>
          ))}

          {/* Last page if not visible */}
          {pageNumbers.length > 0 &&
            pageNumbers[pageNumbers.length - 1]! < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1]! < totalPages - 1 && (
                  <span className="px-2 py-1 text-gray-500">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
                >
                  {totalPages}
                </Button>
              </>
            )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
          onMouseEnter={() => hasNextPage && onPrefetchPage?.(currentPage + 1)}
          className="border-gray-600 bg-gray-900 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
