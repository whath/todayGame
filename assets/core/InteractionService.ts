import { Owner } from './GameplayKernel';
export type InteractionPolicy = 'Exclusive' | 'Shared' | 'Simultaneous' | 'Competitive' | 'Cooperative' | 'Queued';
export interface InteractionRequest { actorId: string; targetId: string }
export interface InteractionResult extends InteractionRequest { accepted: boolean; reason: 'accepted' | 'missing' | 'denied' | 'claimed' | 'waiting' }
export interface Interactable {
    id: string; policy: InteractionPolicy; participants?: number;
    canInteract(actorId: string): boolean;
    cooperate?(actorIds: readonly string[]): boolean;
    /** Game-supplied winner rule; no automatic P1 priority for competitive play. */
    compete?(actorIds: readonly string[]): string | null;
    execute(actorIds: readonly string[]): void;
}
export class OwnershipService {
    private readonly claims = new Map<string, { actors: Set<string>; owner: Owner }>();
    public claim(id: string, actorId: string, owner: Owner): boolean {
        if (owner === 'None' || !id || !actorId) return false;
        const existing = this.claims.get(id);
        if (existing) {
            if (existing.owner === 'Shared' && owner === 'Shared') { existing.actors.add(actorId); return true; }
            if (!existing.actors.has(actorId) || existing.owner !== owner) return false;
            return true;
        }
        this.claims.set(id, { actors: new Set([actorId]), owner }); return true;
    }
    public owner(id: string): Owner { return this.claims.get(id)?.owner ?? 'None'; }
    public claimant(id: string): string | undefined { const claim = this.claims.get(id); return claim?.owner === 'Shared' ? undefined : claim?.actors.values().next().value; }
    public release(id: string, actorId: string): void {
        const claim = this.claims.get(id); if (!claim) return;
        claim.actors.delete(actorId); if (!claim.actors.size) this.claims.delete(id);
    }
    public releaseActor(actorId: string): void { for (const id of this.claims.keys()) this.release(id, actorId); }
    public clear(): void { this.claims.clear(); }
}
/** Frame-batched arbitration: lexical Actor ID breaks ties independently of request order. */
export class InteractionService {
    public readonly ownership = new OwnershipService();
    private readonly targets = new Map<string, Interactable>();
    private readonly queues = new Map<string, string[]>();
    public register(target: Interactable): void {
        if (!target.id || this.targets.has(target.id) || (target.policy === 'Competitive' && !target.compete)
            || (target.participants !== undefined && (!Number.isInteger(target.participants) || target.participants < 1))) throw Error('Invalid interaction target');
        this.targets.set(target.id, target);
    }
    public resolve(requests: readonly InteractionRequest[]): InteractionResult[] {
        const results: InteractionResult[] = [];
        const grouped = new Map<string, Set<string>>();
        for (const r of requests) { if (!grouped.has(r.targetId)) grouped.set(r.targetId, new Set()); grouped.get(r.targetId)!.add(r.actorId); }
        // Queued candidates are revalidated even when no new requests arrive.
        for (const id of this.queues.keys()) if (!grouped.has(id)) grouped.set(id, new Set());
        grouped.forEach((actors, id) => {
            const target = this.targets.get(id);
            const report = (actorId: string, reason: InteractionResult['reason']) => results.push({ actorId, targetId: id, accepted: reason === 'accepted', reason });
            if (!target) { actors.forEach(a => report(a, 'missing')); return; }
            const ordered = [...actors].sort();
            if (target.policy === 'Queued') {
                const queue = this.queues.get(id) ?? [];
                for (const a of ordered) if (!queue.includes(a)) queue.push(a);
                this.queues.set(id, queue);
                ordered.splice(0, ordered.length, ...queue);
            }
            const eligible = ordered.filter(a => { if (target.canInteract(a)) return true; report(a, 'denied'); return false; });
            let accepted: string[] = [];
            if (target.policy === 'Competitive') {
                if (this.ownership.owner(id) === 'None' && eligible.length) {
                    const winner = target.compete!(Object.freeze([...eligible]));
                    if (winner !== null && !eligible.includes(winner)) throw Error('Competitive winner is not eligible');
                    if (winner !== null) accepted = [winner];
                }
            } else if (target.policy === 'Shared') accepted = eligible;
            else if (target.policy === 'Simultaneous' || target.policy === 'Cooperative') {
                if (eligible.length >= (target.participants ?? 2) && (target.policy !== 'Cooperative' || target.cooperate?.(eligible) === true)) accepted = eligible;
            } else {
                const owner = this.ownership.claimant(id);
                const candidate = eligible.find(a => this.ownership.owner(id) === 'None' || owner === a);
                if (candidate) accepted = [candidate];
            }
            if (accepted.length) {
                const exclusive = target.policy === 'Exclusive' || target.policy === 'Queued' || target.policy === 'Competitive';
                const newlyClaimed = exclusive && this.ownership.owner(id) === 'None';
                if (exclusive && !this.ownership.claim(id, accepted[0], accepted[0] === 'player.1' ? 'Player1' : accepted[0] === 'player.2' ? 'Player2' : 'World')) accepted = [];
                if (accepted.length) {
                    try { target.execute(accepted); } catch (error) { if (newlyClaimed) this.ownership.release(id, accepted[0]); throw error; }
                }
            }
            eligible.forEach(a => report(a, accepted.includes(a) ? 'accepted' : target.policy === 'Exclusive' ? 'claimed' : 'waiting'));
            if (target.policy === 'Queued') {
                const remaining = eligible.filter(a => !accepted.includes(a));
                if (remaining.length) this.queues.set(id, remaining); else this.queues.delete(id);
            }
        });
        return results;
    }
    public releaseActor(actorId: string): void {
        this.ownership.releaseActor(actorId);
        this.queues.forEach((queue, id) => { const remaining = queue.filter(a => a !== actorId); if (remaining.length) this.queues.set(id, remaining); else this.queues.delete(id); });
    }
    public clear(): void { this.queues.clear(); this.targets.clear(); this.ownership.clear(); }
}
