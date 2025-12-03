import React from "react";
import type { PaginationInfo } from "../Types/Types";

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  isLoading = false,
}) => {
  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrev || isLoading}
        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
      >
        Previous
      </button>

      <span className="mx-2">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>

      <button
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNext || isLoading}
        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
