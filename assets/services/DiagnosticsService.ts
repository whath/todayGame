export class DiagnosticsService {
    public visible = false;
    public fps = 0;
    public frameMs = 0;
    private elapsed = 0;
    private frames = 0;
    public constructor(public readonly enabled: boolean) {}
    public toggle(): void { if (this.enabled) this.visible = !this.visible; }
    public sample(dt: number): void {
        if (!this.enabled || dt <= 0) return;
        this.elapsed += dt;
        this.frames++;
        if (this.elapsed >= 0.5) {
            this.fps = Math.round(this.frames / this.elapsed);
            this.frameMs = this.elapsed * 1000 / this.frames;
            this.frames = 0;
            this.elapsed = 0;
        }
    }
}
