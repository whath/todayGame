// The official creator-types package omits Creator-generated cc/env constants.
// This declaration is headless-check-only; Creator supplies its own declaration at import.
declare module 'cc/env' { export const DEBUG: boolean; }
