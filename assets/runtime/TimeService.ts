export class TimeService {
    public gameDelta = 0;
    public uiDelta = 0;
    public unscaledDelta = 0;
    public gameElapsed = 0;
    public uiElapsed = 0;
    private scale = 1;
    public setScale(value: number): void {
        if (!Number.isFinite(value) || value < 0 || value > 4) throw new Error('Invalid time scale');
        this.scale = value;
    }
    public tick(dt: number, paused: boolean): void {
        this.unscaledDelta = Number.isFinite(dt) ? Math.max(0, dt) : 0;
        this.uiDelta = Math.min(this.unscaledDelta, 0.1);
        this.gameDelta = paused ? 0 : Math.min(this.unscaledDelta, 0.05) * this.scale;
        this.uiElapsed += this.uiDelta;
        this.gameElapsed += this.gameDelta;
    }
    public restore(seconds: number): void {
        if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Invalid elapsed time');
        this.gameElapsed = seconds;
    }
}
