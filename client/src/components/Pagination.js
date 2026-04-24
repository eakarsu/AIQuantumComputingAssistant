import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  if (totalPages <= 1 && total <= limit) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
      </div>
      <div className="pagination-controls">
        <select className="pagination-limit" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(1)} title="First"><FiChevronsLeft /></button>
        <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)} title="Previous"><FiChevronLeft /></button>
        {pages.map(p => (
          <button key={p} className={`pagination-btn ${p === page ? 'pagination-btn-active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} title="Next"><FiChevronRight /></button>
        <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} title="Last"><FiChevronsRight /></button>
      </div>
    </div>
  );
}

export default Pagination;
