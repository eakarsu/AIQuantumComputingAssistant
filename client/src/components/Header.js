import React from 'react';
import { FiZap } from 'react-icons/fi';

function Header({ title, breadcrumb, showBreadcrumb = true }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand">
          <FiZap className="header-logo" />
          <div>
            <h1 className="header-title">{title || 'Quantum AI'}</h1>
            {showBreadcrumb && breadcrumb && (
              <p className="header-breadcrumb">{breadcrumb}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
