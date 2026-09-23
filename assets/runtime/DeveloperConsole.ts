import { BuildVariant, buildPolicy } from './BuildInfo';
/** Small command registry; no eval, script language, file access, or network commands. */
export class DeveloperConsole {
    private readonly commands = new Map<string, (args: readonly string[]) => string>();
    public constructor(private readonly variant: BuildVariant) {}
    public register(name: string, handler: (args: readonly string[]) => string): void {
        if (!/^[a-z_]+$/.test(name) || this.commands.has(name)) throw new Error('Invalid/duplicate command');
        this.commands.set(name, handler);
    }
    public execute(line: string): string {
        if (!buildPolicy(this.variant).developerTools) return 'Developer tools disabled';
        const [name, ...args] = line.trim().split(/\s+/);
        if (name === 'help') return ['help', ...this.commands.keys()].join(', ');
        const handler = this.commands.get(name); if (!handler) return `Unknown command: ${name}`;
        try { return handler(args); } catch (error) { return String(error); }
    }
}
