export interface TreeDecorations {
  [key: string]: {
    ornamentId: string;
    position: { x: number; y: number; z?: number };
    rotation?: number;
    scale?: number;
  };
}
