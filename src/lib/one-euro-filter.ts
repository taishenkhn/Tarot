/**
 * One Euro Filter - low-latency smoothing for hand cursor
 * Reference: https://cristal.univ-lille.fr/~casiez/1euro/
 *
 * Parameters:
 * - minCutoff: minimum cutoff frequency (lower = more smoothing when still)
 * - beta: speed coefficient (higher = less lag when moving fast)
 * - dCutoff: cutoff for derivative filtering
 */

function smoothingFactor(te: number, cutoff: number): number {
  const r = 2 * Math.PI * cutoff * te;
  return r / (r + 1);
}

function exponentialSmoothing(a: number, x: number, xPrev: number): number {
  return a * x + (1 - a) * xPrev;
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number;
  private dxPrev: number;
  private tPrev: number;
  private initialized: boolean;

  constructor(
    minCutoff: number = 1.0,
    beta: number = 0.007,
    dCutoff: number = 1.0
  ) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xPrev = 0;
    this.dxPrev = 0;
    this.tPrev = 0;
    this.initialized = false;
  }

  filter(x: number, t: number): number {
    if (!this.initialized) {
      this.xPrev = x;
      this.dxPrev = 0;
      this.tPrev = t;
      this.initialized = true;
      return x;
    }

    const te = t - this.tPrev;
    if (te <= 0) return this.xPrev;

    // Derivative
    const aD = smoothingFactor(te, this.dCutoff);
    const dx = (x - this.xPrev) / te;
    const dxHat = exponentialSmoothing(aD, dx, this.dxPrev);

    // Adaptive cutoff
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = smoothingFactor(te, cutoff);
    const xHat = exponentialSmoothing(a, x, this.xPrev);

    this.xPrev = xHat;
    this.dxPrev = dxHat;
    this.tPrev = t;

    return xHat;
  }

  reset(): void {
    this.initialized = false;
    this.xPrev = 0;
    this.dxPrev = 0;
    this.tPrev = 0;
  }

  updateParams(minCutoff?: number, beta?: number, dCutoff?: number): void {
    if (minCutoff !== undefined) this.minCutoff = minCutoff;
    if (beta !== undefined) this.beta = beta;
    if (dCutoff !== undefined) this.dCutoff = dCutoff;
  }
}

/**
 * Paired filter for 2D coordinates
 */
export class OneEuroFilter2D {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor(
    minCutoff: number = 1.0,
    beta: number = 0.007,
    dCutoff: number = 1.0
  ) {
    this.filterX = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.filterY = new OneEuroFilter(minCutoff, beta, dCutoff);
  }

  filter(x: number, y: number, t: number): { x: number; y: number } {
    return {
      x: this.filterX.filter(x, t),
      y: this.filterY.filter(y, t),
    };
  }

  reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }

  updateParams(minCutoff?: number, beta?: number, dCutoff?: number): void {
    this.filterX.updateParams(minCutoff, beta, dCutoff);
    this.filterY.updateParams(minCutoff, beta, dCutoff);
  }
}
