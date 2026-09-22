import { game, Game } from 'cc';

export class CocosFocusAdapter {
    private hidden = false;
    private blurred = false;
    private active = false;
    public constructor(private readonly changed: (focused: boolean) => void) {}
    public start(): void {
        if (this.active) return;
        this.active = true;
        game.on(Game.EVENT_HIDE, this.onHide, this);
        game.on(Game.EVENT_SHOW, this.onShow, this);
        if (typeof window !== 'undefined') {
            window.addEventListener('blur', this.onBlur);
            window.addEventListener('focus', this.onFocus);
        }
        this.hidden = typeof document !== 'undefined' && document.hidden;
        this.blurred = typeof document !== 'undefined' && !document.hasFocus();
        this.publish();
    }
    public stop(): void {
        if (!this.active) return;
        this.active = false;
        game.off(Game.EVENT_HIDE, this.onHide, this);
        game.off(Game.EVENT_SHOW, this.onShow, this);
        if (typeof window !== 'undefined') {
            window.removeEventListener('blur', this.onBlur);
            window.removeEventListener('focus', this.onFocus);
        }
    }
    private readonly onHide = (): void => { this.hidden = true; this.publish(); };
    private readonly onShow = (): void => { this.hidden = false; this.publish(); };
    private readonly onBlur = (): void => { this.blurred = true; this.publish(); };
    private readonly onFocus = (): void => { this.blurred = false; this.publish(); };
    private publish(): void { this.changed(!this.hidden && !this.blurred); }
}
