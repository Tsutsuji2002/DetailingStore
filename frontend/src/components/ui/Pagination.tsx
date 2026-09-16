import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
}) => {
  if (totalItems === 0) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(safeTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < safeTotalPages - 2) pages.push('...');
      if (!pages.includes(safeTotalPages)) pages.push(safeTotalPages);
    }
    return pages;
  };

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 34,
    height: 34,
    padding: '0 0.5rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'var(--accent-primary)',
    color: '#ffffff',
    borderColor: 'var(--accent-primary)',
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...btnStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1rem 1.5rem',
        marginTop: '1rem',
      }}
    >
      {/* Items Range Info */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng <strong>{totalItems}</strong> bản ghi
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page Buttons Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? disabledBtnStyle : btnStyle}
            title="Trang đầu"
          >
            <FiChevronsLeft />
          </button>

          {/* Prev Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? disabledBtnStyle : btnStyle}
            title="Trang trước"
          >
            <FiChevronLeft />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(p)}
                style={p === currentPage ? activeBtnStyle : btnStyle}
              >
                {p}
              </button>
            ) : (
              <span key={idx} style={{ padding: '0 0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ...
              </span>
            )
          )}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === safeTotalPages}
            style={currentPage === safeTotalPages ? disabledBtnStyle : btnStyle}
            title="Trang sau"
          >
            <FiChevronRight />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(safeTotalPages)}
            disabled={currentPage === safeTotalPages}
            style={currentPage === safeTotalPages ? disabledBtnStyle : btnStyle}
            title="Trang cuối"
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
