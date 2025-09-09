declare module "react-signature-canvas" {
  import * as React from "react";

  export interface SignatureCanvasProps {
    penColor?: string;
    backgroundColor?: string;
    velocityFilterWeight?: number;
    clearOnResize?: boolean;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    fromDataURL(dataURL: string, options?: any): void;
    toDataURL(mimeType?: string, quality?: number): string;
    getTrimmedCanvas(): HTMLCanvasElement;
    isEmpty(): boolean;
  }
}

// 📌 trim-canvas
declare module "trim-canvas" {
  function trim(canvas: HTMLCanvasElement): HTMLCanvasElement;
  export default trim;
}

// 📌 d3-cloud
declare module "d3-cloud" {
  interface Word {
    text: string;
    value: number;
    size?: number;
    x?: number;
    y?: number;
    rotate?: number;
  }

  interface Cloud<T extends Word> {
    size([w, h]: [number, number]): Cloud<T>;
    words(words: T[]): Cloud<T>;
    padding(p: number): Cloud<T>;
    rotate(fn: () => number): Cloud<T>;
    font(f: string): Cloud<T>;
    fontSize(fn: (d: T) => number): Cloud<T>;
    on(event: "end", cb: (words: T[]) => void): Cloud<T>;
    start(): void;
  }

  export default function cloud<T extends Word>(): Cloud<T>;
}
