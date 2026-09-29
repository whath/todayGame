import { CategoryRegistry } from '../runtime/GameCategory';
/** Composition root: adding an installed category is explicit, not dynamic code loading. */
export function createCategories(): CategoryRegistry {
    const registry = new CategoryRegistry();
    registry.register({ id: 'racing', titleId: 'category.racing', descriptionId: 'category.racing.detail' });
    registry.register({ id: 'relay', titleId: 'category.relay', descriptionId: 'category.relay.detail' });
    return registry;
}
