export interface ActiveBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export type BoardState = (string | null)[][];
