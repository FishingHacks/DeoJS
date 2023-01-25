export type Validator = (value: any) => void;
export type Transformer = (value: any) => any;

export class ValidationError extends Error { };
export class TransformationError extends Error { };