import { Owner } from './GameplayKernel';
export type InteractionPolicy = 'Exclusive' | 'Shared' | 'Simultaneous' | 'Cooperative' | 'Queued';
export interface InteractionRequest { actorId: string; targetId: string }
export interface InteractionResult extends InteractionRequest { accepted: boolean; reason: 'accepted' | 'missing' | 'denied' | 'claimed' | 'waiting' }
export interface Interactable {
    id: string; policy: InteractionPolicy; participants?: number;
    canInteract(actorId: string): boolean;
    cooperate?(actorIds: readonly string[]): boolean;
    execute(actorIds: readonly string[]): void;
}
export class OwnershipService {
    private readonly claims = new Map<string, { actorId: string; owner: Owner }>();
    public claim(id: string, actorId: string, owner: Owner): boolean {
        if (owner === 'None' || !id || !actorId) return false;
        const existing = this.claims.get(id); if (existing && existing.actorId !== actorId) return false;
        this.claims.set(id, { actorId, owner }); return true;
    }
    public owner(id: string): Owner { return this.claims.get(id)?.owner ?? 'None'; }
    public claimant(id: string): string | undefined { return this.claims.get(id)?.actorId; }
    public release(id: string, actorId: string): void { if (this.claimant(id) === actorId) this.claims.delete(id); }
    public releaseActor(actorId: string): void { this.claims.forEach((v, k) => { if (v.actorId === actorId) this.claims.delete(k); }); }
    public clear(): void { this.claims.clear(); }
}
/** Frame-batched arbitration: lexical Actor ID breaks ties independently of request order. */
export class InteractionService {
    public readonly ownership = new OwnershipService();
    private readonly targets = new Map<string, Interactable>();
    private readonly queues = new Map<string, string[]>();
    public register(target: Interactable): void {
        if (!target.id || this.targets.has(target.id) || (target.participants !== undefined && (!Number.isInteger(target.participants) || target.participants < 1))) throw Error('Invalid interaction target');
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
            if (target.policy === 'Shared') accepted = eligible;
            else if (target.policy === 'Simultaneous' || target.policy === 'Cooperative') {
                if (eligible.length >= (target.participants ?? 2) && (target.policy !== 'Cooperative' || target.cooperate?.(eligible) === true)) accepted = eligible;
            } else {
                const owner = this.ownership.claimant(id);
                const candidate = eligible.find(a => !owner || owner === a);
                if (candidate) accepted = [candidate];
            }
            if (accepted.length) {
                const exclusive = target.policy === 'Exclusive' || target.policy === 'Queued';
                if (exclusive) this.ownership.claim(id, accepted[0], accepted[0] === 'player.1' ? 'Player1' : accepted[0] === 'player.2' ? 'Player2' : 'World');
                try { target.execute(accepted); } catch (error) { if (exclusive) this.ownership.release(id, accepted[0]); throw error; }
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
