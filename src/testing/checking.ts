import 'reflect-metadata';
import { constants } from '../constants';
import { classConstructor, emptyClassConstructor } from '../types/generic';
import { HTTP_METHODS } from '../types/http';
import { RouteHandler } from '../types/routing';

export class TestingCheckError extends Error {}

export function isModule<T extends emptyClassConstructor<any>>(constructor: T) {
    return Reflect.hasMetadata(
        constants.metadata.module.signature,
        constructor
    );
}

export function isService<T extends emptyClassConstructor<any>>(
    constructor: T
) {
    return Reflect.hasMetadata(
        constants.metadata.injectableSignature,
        constructor
    );
}

export function isController<T extends classConstructor<any>>(constructor: T) {
    return Reflect.hasMetadata(
        constants.metadata.controller.signature,
        constructor
    );
}

export function hasRoute<T extends classConstructor<any>>(
    constructor: T,
    routeData: { path: string; method: HTTP_METHODS | 'all'; strict?: boolean }
) {
    routeData.strict ||= false;
    if (!isController(constructor))
        throw new TestingCheckError('The constructor is not a controller');
    const routes = (Reflect.getMetadata(
        constants.metadata.controller.routes,
        constructor
    ) || []) as RouteHandler[];

    return (
        routes.find(
            (el) =>
                el.url === routeData.path &&
                (el.method === routeData.method ||
                    (el.method === 'all' && !routeData.strict))
        ) !== undefined
    );
}
