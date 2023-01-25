export type classConstructor<T> = new (...args: any[]) => T;
export type emptyClassConstructor<T> = new () => T;
export type Optional<T extends Record<string | number | symbol, any>> = {
    [K in keyof T]?: T[K];
};
export type Required<T extends Record<string | number | symbol, any>> = {
    [K in keyof T]-?: T[K];
};
export type FunctionWithReturn<T> = () => T;
export type ClassByConstructor<T extends (new (...args: any[]) => any)|(new () => any)> =
    T extends (new (...args: any[]) => infer R) | (new () => infer R) ? R : never;