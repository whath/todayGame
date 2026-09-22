export type PauseReason = 'manual' | 'settings' | 'unfocused' | 'controller';

export class PauseService {
    private readonly active = new Set<PauseReason>();
    private focused = true;
    private pauseWhenUnfocused = true;
    public get paused(): boolean { return this.active.size > 0; }
    public get reasons(): readonly PauseReason[] { return [...this.active]; }
    public set(reason: PauseReason, paused: boolean): void {
        if (paused) this.active.add(reason); else this.active.delete(reason);
    }
    public toggleManual(): void { this.set('manual', !this.active.has('manual')); }
    public setFocused(focused: boolean): void { this.focused = focused; this.refreshFocus(); }
    public configure(pauseWhenUnfocused: boolean): void { this.pauseWhenUnfocused = pauseWhenUnfocused; this.refreshFocus(); }
    public clearManual(): void { this.active.delete('manual'); }
    private refreshFocus(): void { this.set('unfocused', !this.focused && this.pauseWhenUnfocused); }
}
