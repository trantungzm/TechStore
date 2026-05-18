import React, { useEffect, useRef } from 'react';

const AdminFilterDropdown = ({ open, onOpenChange, label, activeCount = 0, children }) => {
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const onMouseDown = (e) => {
            if (!open) return;
            const menuEl = menuRef.current;
            const buttonEl = buttonRef.current;
            if (!menuEl || !buttonEl) return;
            if (menuEl.contains(e.target) || buttonEl.contains(e.target)) return;
            onOpenChange(false);
        };

        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open, onOpenChange]);

    return (
        <div className="admin-filter-wrap">
            <button
                ref={buttonRef}
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onOpenChange(!open)}
            >
                <i className="fas fa-filter mr-1"></i>
                {label}
                {activeCount > 0 && <span className="badge badge-primary ml-2">{activeCount}</span>}
            </button>
            {open && (
                <div ref={menuRef} className="admin-filter-menu">
                    {children}
                </div>
            )}
        </div>
    );
};

export default AdminFilterDropdown;

