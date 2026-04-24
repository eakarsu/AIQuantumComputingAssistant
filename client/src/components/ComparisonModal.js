import React from 'react';
import Modal from './Modal';

function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function ComparisonModal({ isOpen, onClose, items, title }) {
  if (!isOpen || !items || items.length < 2) return null;
  const [itemA, itemB] = items;

  const allKeys = [...new Set([...Object.keys(itemA), ...Object.keys(itemB)])]
    .filter(k => !['updatedAt', 'aiAnalysis'].includes(k));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Compare Records'} size="large">
      <div className="comparison-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="comparison-field-col">Field</th>
              <th className="comparison-item-col">Record A</th>
              <th className="comparison-item-col">Record B</th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map(key => {
              const valA = itemA[key];
              const valB = itemB[key];
              const isDifferent = JSON.stringify(valA) !== JSON.stringify(valB);
              return (
                <tr key={key} className={isDifferent ? 'comparison-diff' : ''}>
                  <td className="comparison-field">{formatLabel(key)}</td>
                  <td className="comparison-value">{valA === null || valA === undefined ? '—' : typeof valA === 'object' ? JSON.stringify(valA) : String(valA)}</td>
                  <td className="comparison-value">{valB === null || valB === undefined ? '—' : typeof valB === 'object' ? JSON.stringify(valB) : String(valB)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

export default ComparisonModal;
