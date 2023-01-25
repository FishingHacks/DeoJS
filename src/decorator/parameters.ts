import { constants } from '../constants';
import { ParameterType, Pipe } from '../types/util';
import { extendArrayMetadata } from '../utils';

type Pipes = Pipe[];

export function generateParameterDecorator(
    type: ParameterType,
    pipes: Pipes,
    data?: string
) {
    return function (target: any, key: string, index: number) {
        if (index === null || index === undefined) return;
        extendArrayMetadata(
            constants.metadata.route.params,
            [{ type, data, index, pipes }],
            target[key]
        );
        return target[key];
    };
}

export function Request(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Request, pipes);
}
export function Response(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Response, pipes);
}
export function Req(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Request, pipes);
}
export function Res(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Response, pipes);
}
export function Next(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Next, pipes);
}
export function Session(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Session, pipes);
}
export function Param(param?: string, ...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Parameter, pipes, param);
}
export function Body(body?: string, ...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Body, pipes, body);
}
export function Query(query?: string, ...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Query, pipes, query);
}
export function Header(header?: string, ...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Header, pipes, header);
}
export function IP(...pipes: Pipes) {
    return generateParameterDecorator(ParameterType.Ip, pipes);
}
export function Logger() {
    return generateParameterDecorator(ParameterType.Logger, []);
}
