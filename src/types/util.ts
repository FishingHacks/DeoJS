export interface Pipe {
    (value: any): any;
}
export interface Parameter {
    type: ParameterType;
    data?: string;
    index: number;
    pipes: Pipe[];
}
export enum ParameterType {
    Request,
    Response,
    Next,
    Session,
    Parameter,
    Body,
    Query,
    Header,
    Ip,
    Logger,
    Custom,
}
