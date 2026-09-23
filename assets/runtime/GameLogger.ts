import { BuildVariant } from './BuildInfo';
export type LogCategory = 'BOOT' | 'INPUT' | 'SCENE' | 'SAVE' | 'SETTINGS' | 'AUDIO' | 'ASSET' | 'GAMEPLAY' | 'UI';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export interface LogEntry { readonly timestamp: number; readonly category: LogCategory; readonly level: LogLevel; readonly message: string }
export class GameLogger {
    private readonly entries: LogEntry[] = [];
    public constructor(private readonly variant: BuildVariant, private readonly sink: (entry: LogEntry) => void,
        private readonly now = () => Date.now()) {}
    public log(category: LogCategory, level: LogLevel, message: string): void {
        if (level === 'DEBUG' && this.variant !== 'development') return;
        if (level === 'INFO' && this.variant === 'release') return;
        const entry = Object.freeze({ timestamp: this.now(), category, level, message });
        this.entries.push(entry); if (this.entries.length > 200) this.entries.shift(); this.sink(entry);
    }
    public snapshot(): readonly LogEntry[] { return [...this.entries]; }
}
