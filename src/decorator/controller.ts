import { NextFunction, Request, Response } from 'express';
import { constants } from '../constants';
import { classConstructor } from '../types/generic';
import { InternalController, logger } from '../types/routing';
import { extendArrayMetadata } from '../utils';

export function Controller(url: string) {
    if (!url.startsWith('/')) url = '/' + url;

    return function <T extends classConstructor<any>>(constructor: T) {
        Reflect.defineMetadata(
            constants.metadata.controller.signature,
            true,
            constructor
        );
        Reflect.defineMetadata(
            constants.metadata.controller.path,
            url,
            constructor
        );

        return constructor;
    };
}

export function RouterOptions(options: InternalController['routerOptions']) {
    return function <T extends classConstructor<any>>(constructor: T) {
        if (!options) return constructor;
        const old_options =
            Reflect.getMetadata(
                constants.metadata.controller.options,
                constructor
            ) || {};

        old_options.caseSensitive =
            !!old_options.caseSensitive || !!options?.caseSensitive;
        old_options.mergeParams =
            !!old_options.mergeParams || !!options?.mergeParams;
        old_options.strict = !!old_options.strict || !!options?.strict;

        Reflect.defineMetadata(
            constants.metadata.controller.options,
            old_options,
            constructor
        );
        return constructor;
    };
}

export function Middleware(middleware: (req: Request, res: Response, next: NextFunction, logger: logger) => any) {
    return function <T extends classConstructor<any>>(constructor: T) {
        extendArrayMetadata(
            constants.metadata.controller.middleware,
            [middleware],
            constructor
        );
        return constructor;
    };
}

// extendArrayMetadata(constants.metadata.controller.middleware, [middleware], constructor);
export function ErrorHandler(
    handler: (
        err: any,
        req: Request,
        res: Response,
        next: NextFunction,
        logger: logger
    ) => any
) {
    return function <T extends classConstructor<any>>(constructor: T) {
        if (
            Reflect.hasMetadata(
                constants.metadata.controller.errorHandler,
                constructor
            )
        )
            console.error(
                'ERROR: You should only 1 error handler is allowed per controller, overwriting the old one! Controller: ' +
                    constructor.name
            );

        Reflect.defineMetadata(
            constants.metadata.controller.errorHandler,
            handler,
            constructor
        );
        return constructor;
    };
}
