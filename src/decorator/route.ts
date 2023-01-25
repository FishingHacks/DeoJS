import {
    ErrorRequestHandler,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { constants } from '../constants';
import { HTTP_CODE, HTTP_METHODS } from '../types/http';
import { RouteHandler } from '../types/routing';
import {
    extendArrayMetadata,
    extendObjectMetadata,
} from '../utils';

function getHandlerForMethod(method: HTTP_METHODS | 'all') {
    return function (
        path: string,
        $middlewares?: RequestHandler[],
        $errorHandler?: ErrorRequestHandler
    ) {
        if (!path.startsWith('/')) path = '/' + path;

        return function (
            target: any,
            key: string,
            description: PropertyDescriptor
        ) {
            if (routeReserved(target, method, path))
                return console.error(
                    'More than 1 route reserved for ' + target.url + path
                );
            const fn = target[key];
            let errorHandler: ErrorRequestHandler | undefined =
                Reflect.getMetadata(constants.metadata.route.errorHandler, fn);
            const middlewares =
                Reflect.getMetadata(constants.metadata.route.middleware, fn) ||
                [];
            if (errorHandler && $errorHandler)
                console.error('Tried to define multiple error handlers');
            else if ($errorHandler) errorHandler = $errorHandler;

            if ($middlewares) middlewares.push(...$middlewares);

            const entry: RouteHandler = {
                url: path,
                function: fn,
                method: method,
                middleware: middlewares,
                errorHandler: errorHandler,
                render: Reflect.getMetadata(
                    constants.metadata.route.render,
                    fn
                ),
                redirect: Reflect.getMetadata(
                    constants.metadata.route.redirect,
                    fn
                ),
                code: Reflect.getMetadata(constants.metadata.route.code, fn),
                type: Reflect.getMetadata(constants.metadata.route.type, fn),
                headers: Reflect.getMetadata(
                    constants.metadata.route.header,
                    fn
                ),
                params: Reflect.getMetadata(
                    constants.metadata.route.params,
                    fn
                ),
            };

            extendArrayMetadata(
                constants.metadata.controller.routes,
                [entry],
                target.constructor || target
            );

            return fn;
        };
    };
}

export const Get = getHandlerForMethod('get');
export const All = getHandlerForMethod('all');
export const Delete = getHandlerForMethod('delete');
export const Head = getHandlerForMethod('head');
export const Options = getHandlerForMethod('options');
export const Patch = getHandlerForMethod('patch');
export const Post = getHandlerForMethod('post');
export const Put = getHandlerForMethod('put');
export function CustomRoute(
    method: HTTP_METHODS | 'all',
    path: string,
    middlewares?: RequestHandler[],
    errorHandler?: ErrorRequestHandler
) {
    return getHandlerForMethod(method)(method, middlewares, errorHandler);
}

export function ErrorHandlerForChild(handler: ErrorRequestHandler) {
    return changeMetadataHandler(
        constants.metadata.route.errorHandler,
        handler
    );
}

export function MiddlewareForChild(handler: RequestHandler) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        extendArrayMetadata(
            constants.metadata.route.middleware,
            [handler],
            target[key]
        );
        return target[key];
    };
}

export function Render(file: string) {
    return changeMetadataHandler(constants.metadata.route.render, file);
}
export function HttpCode(code: number | HTTP_CODE) {
    return changeMetadataHandler(constants.metadata.route.code, code);
}
export function ContentType(type: string) {
    return changeMetadataHandler(constants.metadata.route.type, type);
}
export function SetHeader(field: string, value: string) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        extendObjectMetadata(
            constants.metadata.route.header,
            target[key],
            value,
            field
        );
    };
}
export function Redirect(url: string) {
    return changeMetadataHandler(constants.metadata.route.redirect, url);
}

function routeReserved(target: any, method: HTTP_METHODS | 'all', url: string) {
    const alternativeUrl = url.startsWith('/') ? url.substring(1) : '/' + url;

    if (!Reflect.hasMetadata(constants.metadata.controller.routes, target))
        return false;
    return (
        Reflect.getMetadata(constants.metadata.controller.routes, target).find(
            (el: any) =>
                (el.url === url || el.url === alternativeUrl) &&
                (method !== 'all'
                    ? el.method === method || el.method === 'all'
                    : true)
        ) !== undefined
    );
}

export function changeMetadataHandler(metadataKey: string, value: any) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(metadataKey, value, target[key]);
        return target[key];
    };
}

export function SetMetadata(name: string, value: any) {
    return changeMetadataHandler(name, value);
}
