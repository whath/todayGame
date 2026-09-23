export interface MenuInput {
    up?: boolean; down?: boolean; left?: boolean; right?: boolean;
    accept?: boolean; back?: boolean; tab?: boolean; previousTab?: boolean; settings?: boolean;
    reset?: boolean; diagnostics?: boolean;
    pause?: boolean;
    /** undefined = no eligible key; null = explicit unbind. */
    bindingKey?: string | null;
}
