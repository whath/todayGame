/** xorshift32; reproducible random sequence, not deterministic physics. */
export class RandomService {
    public seed = 1;
    private state = 1;
    public constructor(seed = 1) { this.reset(seed); }
    public reset(seed: number, state = seed): void {
        for (const value of [seed, state]) if (!Number.isInteger(value) || value < 1 || value > 0xffffffff) throw new Error('Seed/state must be a nonzero uint32');
        this.seed = seed >>> 0; this.state = state >>> 0;
    }
    public get currentState(): number { return this.state; }
    public nextFloat(): number {
        let x = this.state; x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
        this.state = x >>> 0; return this.state / 0x100000000;
    }
    public nextInt(min: number, maxExclusive: number): number {
        if (!Number.isSafeInteger(min) || !Number.isSafeInteger(maxExclusive) || maxExclusive <= min || maxExclusive - min > 0xffffffff) throw new Error('Invalid random range');
        return min + Math.floor(this.nextFloat() * (maxExclusive - min));
    }
    public pick<T>(items: readonly T[]): T { return items[this.nextInt(0, items.length)]; }
    public shuffle<T>(items: readonly T[]): T[] {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) { const j = this.nextInt(0, i + 1); [result[i], result[j]] = [result[j], result[i]]; }
        return result;
    }
}
