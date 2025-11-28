export type Op = '+' | '−' | '×';

export interface Problem {
  a: number;
  b: number;
  op: Op;
  answer: number;
  text: string;
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateProblem = (): Problem => {
  const ops: Op[] = ['+', '−', '×'];
  const op = ops[randInt(0, ops.length - 1)];

  // Keep numbers small and friendly; ensure integer division and non-negative subtraction.
  if (op === '+') {
    const a = randInt(1, 20);
    const b = randInt(1, 20);
    return { a, b, op, answer: a + b, text: `${a} + ${b}` };
  }
  if (op === '−') {
    const x = randInt(1, 20);
    const y = randInt(1, 20);
    const a = Math.max(x, y);
    const b = Math.min(x, y);
    return { a, b, op, answer: a - b, text: `${a} − ${b}` };
  }
  if (op === '×') {
    const a = randInt(1, 12);
    const b = randInt(1, 12);
    return { a, b, op, answer: a * b, text: `${a} × ${b}` };
  }
  // default (should not happen)
  const a = randInt(1, 20);
  const b = randInt(1, 20);
  return { a, b, op: '+', answer: a + b, text: `${a} + ${b}` };
};
