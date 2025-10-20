'use client';

import React from 'react';

interface BoardProps {
  board: number[][];
  initialBoard: number[][];
  selectedCell: { row: number; col: number } | null;
  conflicts: boolean[][];
  onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, initialBoard, selectedCell, conflicts, onCellClick }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-9 gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isInitial = initialBoard[rowIndex]?.[colIndex] !== 0;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isConflict = conflicts[rowIndex]?.[colIndex];
            const isSameValue = selectedCell && board[selectedCell.row]?.[selectedCell.col] !== 0 && board[selectedCell.row]?.[selectedCell.col] === cell;

            const getBorderClasses = () => {
              let classes = 'border border-gray-600';
              if ((rowIndex + 1) % 3 === 0 && rowIndex < 8) classes += ' border-b-2 border-b-gray-400';
              if ((colIndex + 1) % 3 === 0 && colIndex < 8) classes += ' border-r-2 border-r-gray-400';
              if (rowIndex === 0) classes += ' border-t-2 border-t-gray-400';
              if (colIndex === 0) classes += ' border-l-2 border-l-gray-400';
              return classes;
            };

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl font-bold transition-colors duration-200
                  ${getBorderClasses()}
                  ${isInitial ? 'text-gray-400 bg-gray-900' : 'text-cyan-300 cursor-pointer hover:bg-gray-700'}
                  ${isSelected ? 'bg-blue-600' : ''}
                  ${isConflict ? 'bg-red-500 text-white' : ''}
                  ${isSameValue && !isSelected && !isConflict ? 'bg-blue-900' : ''}
                `}
              >
                {cell !== 0 ? cell : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;
