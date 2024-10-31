export function generateNumberArray(e: number): number[] {
    return Array.from({ length: e }, (_, index) => index + 1);
  }