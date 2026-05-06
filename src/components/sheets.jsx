import React, { useState, useCallback, useRef, useMemo } from 'react';
import './sheets.css';
import сontextMenu from './contextMenu.jsx';

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 30;

function Sheets({ 
  rows, 
  cols, 
  data, 
  selectedCell, 
  selectedRange,
  editingCell,
  onCellSelect, 
  onCellDoubleClick, 
  onCellEdit,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  getCellValue 
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [colWidths, setColWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [editingValue, setEditingValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const VISIBLE_ROWS = 30;
  const VISIBLE_COLS = 15;

  const startRow = Math.max(0, Math.floor(scrollTop / DEFAULT_ROW_HEIGHT) - 1);
  const endRow = Math.min(rows, startRow + VISIBLE_ROWS + 2);
  const startCol = Math.max(0, Math.floor(scrollLeft / DEFAULT_COL_WIDTH) - 1);
  const endCol = Math.min(cols, startCol + VISIBLE_COLS + 2);

  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isCellSelected = (row, col) => {
    if (selectedRange) {
      const { start, end } = selectedRange;
      return row >= start.row && row <= end.row && 
             col >= start.col && col <= end.col;
    }
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    setScrollLeft(e.target.scrollLeft);
  }, []);

  const handleCellClick = useCallback((row, col, e) => {
    onCellSelect(row, col, e.shiftKey);
  }, [onCellSelect]);

  const handleDoubleClick = useCallback((row, col) => {
    const value = getCellValue(row, col);
    setEditingValue(value);
    onCellDoubleClick(row, col);
  }, [onCellDoubleClick, getCellValue]);

  const handleEditKeyDown = useCallback((e, row, col) => {
    if (e.key === 'Enter') {
      onCellEdit(row, col, editingValue);
    } else if (e.key === 'Escape') {
      onCellEdit(row, col, getCellValue(row, col));
    }
  }, [onCellEdit, editingValue, getCellValue]);

  const handleContextMenu = useCallback((e, row, col) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      row,
      col
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleResizeStart = useCallback((e, index, type) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = colWidths[index] || DEFAULT_COL_WIDTH;
    const startHeight = rowHeights[index] || DEFAULT_ROW_HEIGHT;

    const handleMouseMove = (moveEvent) => {
      if (type === 'col') {
        const diff = moveEvent.clientX - startX;
        setColWidths(prev => ({
          ...prev,
          [index]: Math.max(50, startWidth + diff)
        }));
      } else {
        const diff = moveEvent.clientY - startY;
        setRowHeights(prev => ({
          ...prev,
          [index]: Math.max(20, startHeight + diff)
        }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [colWidths, rowHeights]);

  const getColWidth = (col) => colWidths[col] || DEFAULT_COL_WIDTH;
  const getRowHeight = (row) => rowHeights[row] || DEFAULT_ROW_HEIGHT;

  const visibleRowsArray = useMemo(() => {
    const rowsArray = [];
    for (let i = startRow; i < endRow; i++) {
      rowsArray.push(i);
    }
    return rowsArray;
  }, [startRow, endRow]);

  const visibleColsArray = useMemo(() => {
    const colsArray = [];
    for (let i = startCol; i < endCol; i++) {
      colsArray.push(i);
    }
    return colsArray;
  }, [startCol, endCol]);

  const totalWidth = useMemo(() => {
    let width = 50;
    for (let i = 0; i < cols; i++) {
      width += getColWidth(i);
    }
    return width;
  }, [cols, colWidths]);

  const totalHeight = useMemo(() => {
    let height = 25;
    for (let i = 0; i < rows; i++) {
      height += getRowHeight(i);
    }
    return height;
  }, [rows, rowHeights]);

  const offsetY = useMemo(() => {
    let offset = 25;
    for (let i = 0; i < startRow; i++) {
      offset += getRowHeight(i);
    }
    return offset;
  }, [startRow, rowHeights]);

  const offsetX = useMemo(() => {
    let offset = 50;
    for (let i = 0; i < startCol; i++) {
      offset += getColWidth(i);
    }
    return offset;
  }, [startCol, colWidths]);

  return (
    <div className="spreadsheet-container" ref={containerRef}>
      <div className="spreadsheet-scroll" onScroll={handleScroll}>
        <div 
          className="spreadsheet-content" 
          style={{ width: totalWidth, height: totalHeight }}
        >
          {/* Заголовки столбцов */}
          <div className="spreadsheet-header-row" style={{ height: 25, position: 'sticky', top: 0, zIndex: 3 }}>
            <div className="corner-header" style={{ width: 50, position: 'sticky', left: 0, zIndex: 4 }}></div>
            {visibleColsArray.map(col => (
              <div
                key={`header-${col}`}
                className="column-header"
                onContextMenu={(e) => handleContextMenu(e, 0, col)}
                style={{
                  width: getColWidth(col),
                  left: offsetX + (col - startCol) * DEFAULT_COL_WIDTH,
                  position: 'absolute'
                }}
              >
                {getColumnLabel(col)}
                <div
                  className="resize-handle col-resize"
                  onMouseDown={(e) => handleResizeStart(e, col, 'col')}
                />
              </div>
            ))}
          </div>

          {/* Строки */}
          {visibleRowsArray.map(row => (
            <div
              key={`row-${row}`}
              className="spreadsheet-row"
              style={{
                height: getRowHeight(row),
                top: offsetY + (row - startRow) * DEFAULT_ROW_HEIGHT,
                position: 'absolute'
              }}
            >
              {/* Заголовок строки */}
              <div 
                className="row-header"
                onContextMenu={(e) => handleContextMenu(e, row, 0)}
                style={{ width: 50, position: 'sticky', left: 0, zIndex: 2 }}
              >
                {row + 1}
                <div
                  className="resize-handle row-resize"
                  onMouseDown={(e) => handleResizeStart(e, row, 'row')}
                />
              </div>

              {/* Ячейки */}
              {visibleColsArray.map(col => {
                const isSelected = isCellSelected(row, col);
                const isEditing = editingCell?.row === row && editingCell?.col === col;
                
                return (
                  <div
                    key={`cell-${row}-${col}`}
                    className={`cell ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
                    style={{
                      width: getColWidth(col),
                      height: getRowHeight(row),
                      left: offsetX + (col - startCol) * DEFAULT_COL_WIDTH,
                      position: 'absolute'
                    }}
                    onClick={(e) => handleCellClick(row, col, e)}
                    onDoubleClick={() => handleDoubleClick(row, col)}
                    onContextMenu={(e) => handleContextMenu(e, row, col)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        className="cell-input"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, row, col)}
                        onBlur={() => onCellEdit(row, col, editingValue)}
                        autoFocus
                      />
                    ) : (
                      <span className="cell-value">{getCellValue(row, col)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {contextMenu && (
        <сontextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddRow={() => onAddRow(contextMenu.row)}
          onDeleteRow={() => onDeleteRow(contextMenu.row)}
          onAddColumn={() => onAddColumn(contextMenu.col)}
          onDeleteColumn={() => onDeleteColumn(contextMenu.col)}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

export default Sheets;