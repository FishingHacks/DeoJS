import {
    NextFunction,
    Request,
    Response,
} from 'express';
import 'reflect-metadata';
import { constants } from './constants';
import { FunctionWithReturn } from './types/generic';
import { ExecutionContext, InternalController, logger, RouteHandler } from './types/routing';
import { ParameterType, Pipe } from './types/util';

export function maybe<T, K extends Array<any> = []>(
    a: boolean | ((...args: K) => boolean),
    value: T,
    ...args: K
): T | undefined {
    if (typeof a === 'function' ? a(...args) : a) return value;
}

export function removeMaybesFromArray<T>(...val: (T | undefined)[]): T[] {
    return val.filter((el) => el !== undefined) as T[];
}

export function getValue<T>(value: T | FunctionWithReturn<T>): T {
    if (typeof value === 'function') return callUnsafe(value);
    return value;
}
export function callUnsafe(value: any): any {
    return value();
}

export function pick<T>(defaultValue: T, ...picks: (T | undefined)[]): T {
    for (const v of picks) {
        if (!!v) return v;
    }
    return defaultValue;
}
export function extendArrayMetadata<T extends Array<unknown>>(
    key: string,
    metadata: T,
    target: Function
) {
    Reflect.defineMetadata(
        key,
        [...(Reflect.getMetadata(key, target) || []), ...metadata],
        target
    );
}

export function extendObjectMetadata(
    key: string,
    target: Function,
    metadata: any,
    objKey: string
) {
    if (!Reflect.hasMetadata(key, target)) {
        Reflect.defineMetadata(key, { [objKey]: metadata }, target);
    } else {
        const data = Reflect.getMetadata(key, target);
        data[objKey] = metadata;
        Reflect.defineMetadata(key, data, target);
    }
}

export function generateController<T extends new () => any>(
    controller: T
): InternalController {
    if (!isController(controller))
        throw new Error('Controller is not a controller');
    return {
        middleware:
            Reflect.getMetadata(
                constants.metadata.controller.middleware,
                controller
            ) || [],
        routerOptions:
            Reflect.getMetadata(
                constants.metadata.controller.options,
                controller
            ) || {},
        routes: generateRoutes(controller),
        url:
            Reflect.getMetadata(
                constants.metadata.controller.path,
                controller
            ) || '/',
        errorHandler:
            Reflect.getMetadata(
                constants.metadata.controller.errorHandler,
                controller
            ) || undefined,
        generateRouter: controller.prototype.generateRouter,
    };
}

function generateRoutes<T extends new () => any>(
    controller: T
): RouteHandler[] {
    if (!Reflect.hasMetadata(constants.metadata.controller.routes, controller))
        return [];
    return Reflect.getMetadata(
        constants.metadata.controller.routes,
        controller
    );
}

export function fillInParameters(
    req: Request,
    res: Response,
    next: NextFunction,
    logger: logger,
    params: RouteHandler['params'],
) {
    if (!params) return [];
    let param_count = 0;
    for (const p of params) {
        if (p.index + 1 > param_count) param_count = p.index + 1;
    }
    const arr = new Array(param_count).fill(undefined);
    for (const p of params) {
        const val = pipeData(
            p.pipes,
            fillParameter(p.type, p.data, req, res, next, logger)
        );
        if (!val.success) {
            res.status(400).json({
                error: true,
                errorMessage: val.data,
                causedBy: 'PipeValidation',
                causer: 'fillInParameters',
            });
            throw val.data;
        }
        arr[p.index] = val.data;
    }
    return arr;
}

function pipeData(pipes: Pipe[], value: any): { success: boolean; data: any } {
    if (pipes.length < 1) return { success: true, data: value };
    for (const pipe of pipes) {
        try {
            const newValue = pipe(value);
            if (newValue !== undefined) value = newValue;
        } catch (e: any) {
            return {
                success: false,
                data:
                    (e as Error)?.stack ||
                    (e as Error)?.message ||
                    (e as Error)?.name ||
                    (e as Error)?.toString() ||
                    'Unknown Error!',
            };
        }
    }
    return { success: true, data: value };
}

function chainPipes(...pipes: Pipe[]): Pipe {
    return (value: any) => {
        for (const v of pipes) {
            const newVal = v(value);
            if (newVal !== undefined) value = newVal;
        }
        return value;
    };
}

function fillParameter(
    type: ParameterType,
    data: string | undefined,
    req: Request,
    res: Response,
    next: NextFunction,
    logger: logger
) {
    if (type === ParameterType.Request) return req;
    else if (type === ParameterType.Response) return res;
    else if (type === ParameterType.Next) return next;
    else if (type === ParameterType.Ip) return req.ip;
    else if (type === ParameterType.Session) return (req as any).session;
    else if (type === ParameterType.Body)
        return data ? (req.body || {})[data] : req.body || {};
    else if (type === ParameterType.Header)
        return data ? (req.headers || {})[data] : req.headers || {};
    else if (type === ParameterType.Parameter)
        return data ? (req.params || {})[data] : req.params || {};
    else if (type === ParameterType.Query)
        return data ? (req.query || {})[data] : req.query || {};
    else if (type === ParameterType.Custom)
        return (data as any as (ctx: ExecutionContext) => any)({
            next,
            req,
            res,
            logger,
        });
    else if (type === ParameterType.Logger) return logger;
    return undefined;
}

export function isUndefined(value: any): value is undefined {
    return value === undefined;
}
export function isNil(value: any): value is undefined | null {
    return isUndefined(value) || value === null;
}

export function chainRouteDecorators(
    ...decorators: (<T>(
        target: Object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<T>
    ) => void | TypedPropertyDescriptor<T>)[]
) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        for (const decorator of decorators) {
            const value = decorator(target, key, descriptor);
            if (typeof value === 'function') target[key] = value;
        }
        return target[key];
    };
}



export function createParamDecorator(
    handler: (ctx: ExecutionContext) => any
): (...pipes: Pipe[]) => (target: any, key: string, index?: number) => void {
    return (...pipes: Pipe[]) =>
        function (target, key, index) {
            if (isUndefined(index)) return;
            extendArrayMetadata(
                constants.metadata.route.params,
                [
                    {
                        type: ParameterType.Custom,
                        data: (ctx: ExecutionContext) =>
                            handler(ctx) as any as string,
                        index,
                        pipes
                    },
                ],
                target[key]
            );
        };
}

export function createParamDecoratorWithData<K = unknown>(
    handler: (data: K, ctx: ExecutionContext) => any
): (data: K, ...pipes: Pipe[]) => (target: any, key: string, index?: number) => void {
    return (data: K, ...pipes: Pipe[]) =>
        function (target, key, index) {
            if (isUndefined(index)) return;
            extendArrayMetadata(
                constants.metadata.route.params,
                [
                    {
                        type: ParameterType.Custom,
                        data: (ctx: ExecutionContext) =>
                            handler(data, ctx) as string,
                        index,
                        pipes,
                    },
                ],
                target[key]
            );
        };
}

export function isController(target: any): boolean {
    return Reflect.hasMetadata(constants.metadata.controller.signature, target);
}
export function isModule(target: any): boolean {
    return Reflect.hasMetadata(constants.metadata.module.signature, target);
}
export function joinPath(...paths: string[]) {
    let newPath = '';

    for (let path of paths) {
        if (!path.startsWith('/')) path = '/' + path;
        if (path.endsWith('/')) path = path.substring(0, path.length - 1);
        newPath += path;
    }
    newPath = newPath.trim();
    return newPath.length > 0 ? newPath : '/';
}