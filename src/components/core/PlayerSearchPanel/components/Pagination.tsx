"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginationInfo } from "../types";

interface PaginationProps {
  pagination: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function Pagination({
  pagination,
  currentPage,
  onPageChange,
  onPrevPage,
  onNextPage,
}: PaginationProps) {
  const { totalPages, totalCount, limit, hasNextPage, hasPreviousPage } = pagination;

  if (totalPages <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    // Adjust if near edges
    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    }
    if (currentPage > totalPages - half) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-4 sm:flex-row">
      {/* Info */}
      <div className="text-sm text-gray-400">
        Showing{" "}
        <span className="font-medium text-white">{startItem}</span>
        {" - "}
        <span className="font-medium text-white">{endItem}</span>
        {" of "}
        <span className="font-medium text-white">{totalCount}</span>
        {" players"}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPreviousPage}
          className="h-9 cursor-pointer gap-1 rounded-lg px-3 text-gray-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {/* First page + ellipsis */}
          {visiblePages[0] && visiblePages[0] > 1 && (
            <>
              <PageButton
                page={1}
                isActive={currentPage === 1}
                onClick={() => onPageChange(1)}
              />
              {visiblePages[0] > 2 && (
                <span className="px-2 text-gray-600">...</span>
              )}
            </>
          )}

          {/* Visible pages */}
          {visiblePages.map((page) => (
            <PageButton
              key={page}
              page={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            />
          ))}

          {/* Last page + ellipsis */}
          {visiblePages[visiblePages.length - 1] && 
           visiblePages[visiblePages.length - 1]! < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1]! < totalPages - 1 && (
                <span className="px-2 text-gray-600">...</span>
              )}
              <PageButton
                page={totalPages}
                isActive={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
              />
            </>
          )}
        </div>

        {/* Next */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="h-9 cursor-pointer gap-1 rounded-lg px-3 text-gray-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Page button component
function PageButton({
  page,
  isActive,
  onClick,
}: {
  page: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-9 min-w-9 cursor-pointer rounded-lg px-3 font-medium transition-all",
        isActive
          ? "bg-cyan-500 text-black hover:bg-cyan-400"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      )}
    >
      {page}
    </Button>
  );
}
