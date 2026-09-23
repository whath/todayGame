/** Local, typed notification channel. Commands remain direct service calls. */
export class DomainEvent<T> {
    private readonly listeners = new Set<(event: T) => void>();
    public constructor(private readonly onError: (error: unknown) => void = error => console.error(error)) {}
    public subscribe(listener: (event: T) => void): () => void {
        this.listeners.add(listener); return () => { this.listeners.delete(listener); };
    }
    public publish(event: T): void {
        for (const listener of [...this.listeners]) {
            try { listener(event); } catch (error) { this.onError(error); }
        }
    }
    public clear(): void { this.listeners.clear(); }
}
