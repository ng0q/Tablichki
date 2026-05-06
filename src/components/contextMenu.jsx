import React from 'react';
import './contextMenu.css';

function contextMenu({ x, y, onAddRow, onDeleteRow, onAddColumn, onDeleteColumn, onClose }) {
  const menuItems = [
    { label: 'Добавить строку', action: onAddRow },
    { label: 'Удалить строку', action: onDeleteRow },
    { label: 'Добавить столбец', action: onAddColumn },
    { label: 'Удалить столбец', action: onDeleteColumn },
  ];

  return (
    <>
      <div className="context-menu-overlay" onClick={onClose} />
      <div className="context-menu" style={{ top: y, left: x }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="context-menu-item"
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </>
  );
}

export default contextMenu;