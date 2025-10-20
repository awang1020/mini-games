'use client';

import type { FC } from 'react';

type CellPosition = { row: number; col: number };

interface BoardProps {
  board: number[][];
  initialBoard: number[][];
  selectedCell: CellPosition | null;
  conflicts: boolean[][];
  mismatches: boolean[][];
  notes: number[][][];
  recentAction: { row: number; col: number; type: 'correct' | 'incorrect' | 'hint' | 'clear' } | null;
  onCellClick: (row: number, col: number) => void;
}

const BOARD_SIZE = 9;
const SUBGRID_SIZE = 3;

const Board: FC<BoardProps> = ({
  board,
  initialBoard,
  selectedCell,
  conflicts,
  mismatches,
  notes,
  recentAction,
  onCellClick,
}) => {
  const renderCell = (rowIndex: number, colIndex: number) => {
    const cellValue = board[rowIndex]?.[colIndex] ?? 0;
    const isInitial = initialBoard[rowIndex]?.[colIndex] !== 0;
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
    const isRowHighlighted = selectedCell?.row === rowIndex;
    const isColumnHighlighted = selectedCell?.col === colIndex;
    const selectedValue = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : 0;
    const isSameValue = selectedValue !== 0 && selectedValue === cellValue;
    const isConflict = conflicts[rowIndex]?.[colIndex];
    const isMismatch = mismatches[rowIndex]?.[colIndex];
    const cellNotes = notes[rowIndex]?.[colIndex] ?? [];
    const isRecent = recentAction?.row === rowIndex && recentAction?.col === colIndex ? recentAction.type : null;

    const classes: string[] = [
      'relative flex aspect-square w-[58px] max-w-[72px] min-w-[44px] select-none items-center justify-center rounded-xl border text-2xl font-semibold transition-all duration-150 sm:w-16 md:w-20',
      'cursor-pointer',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    ];

    const getBorderClasses = () => {
      const borders: string[] = ['border border-slate-700/60'];
      if (rowIndex % SUBGRID_SIZE === 0) {
        borders.push('border-t-2 border-t-slate-500/60');
      }
      if (colIndex % SUBGRID_SIZE === 0) {
        borders.push('border-l-2 border-l-slate-500/60');
      }
      if (rowIndex === BOARD_SIZE - 1) {
        borders.push('border-b-2 border-b-slate-500/60');
      }
      if (colIndex === BOARD_SIZE - 1) {
        borders.push('border-r-2 border-r-slate-500/60');
      }
      return borders.join(' ');
    };

    classes.push(getBorderClasses());

    if (isInitial) {
      classes.push('bg-slate-950/80 text-slate-300');
    } else {
      classes.push('bg-slate-900/70 text-slate-50 hover:bg-slate-800/80');
    }

    if (isRowHighlighted || isColumnHighlighted) {
      classes.push('bg-slate-900/60');
    }

    if (isSameValue && !isSelected) {
      classes.push('bg-sky-900/50 text-sky-200');
    }

    if (isConflict) {
      classes.push('border-amber-400/80 bg-amber-500/20 text-amber-100 shadow-inner shadow-amber-500/20');
    }

    if (isMismatch) {
      classes.push('ring-2 ring-rose-500/80 text-rose-200 animate-flash-wrong');
    }

    if (isSelected) {
      classes.push('ring-2 ring-sky-400 shadow-lg shadow-sky-500/30');
    }

    if (isRecent) {
      const actionClass = {
        correct: 'animate-flash-correct',
        incorrect: 'animate-flash-wrong',
        hint: 'animate-flash-hint',
        clear: 'animate-fade-clear',
      }[isRecent];
      classes.push(actionClass);
    }

    const accessibleLabel = `Row ${rowIndex + 1}, Column ${colIndex + 1}, ${
      cellValue !== 0 ? `value ${cellValue}` : cellNotes.length > 0 ? `notes ${cellNotes.join(', ')}` : 'empty cell'
    }${isInitial ? ', fixed value' : ''}`;

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={classes.join(' ')}
        onClick={() => onCellClick(rowIndex, colIndex)}
        role="gridcell"
        aria-selected={isSelected}
        aria-label={accessibleLabel}
        tabIndex={isSelected ? 0 : -1}
      >
        {cellValue !== 0 ? (
          <span className="text-3xl font-bold leading-none">
            {cellValue}
          </span>
        ) : cellNotes.length > 0 ? (
          <div className="grid h-full w-full grid-cols-3 gap-[1px] p-1 text-[0.6rem] font-semibold leading-4 text-slate-400">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((note) => (
              <span key={note} className={cellNotes.includes(note) ? '' : 'opacity-20'}>
                {note}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center">
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-2xl">
        <div className="grid grid-cols-9 gap-1" role="grid" aria-label="Sudoku board">
          {board.map((row, rowIndex) =>
            row.map((_, colIndex) => renderCell(rowIndex, colIndex))
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
