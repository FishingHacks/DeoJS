import {
    ErrorRequestHandler,
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router,
    RouterOptions,
} from 'express';
import { HTTP_METHODS } from './http';
import { Parameter } from './util';

export interface RouteHandler {
    function: (...args: any[]) => any;
    url: string;
    middleware: RequestHandler[];
    method: HTTP_METHODS | 'all';
    errorHandler?: ErrorRequestHandler;
    render?: string;
    redirect?: string;
    code?: number;
    type?: string;
    headers?: Record<string, string>;
    params?: Parameter[];
}
export interface InternalController {
    routes: RouteHandler[];
    errorHandler?: ErrorRequestHandler;
    middleware: RequestHandler[];
    url: string;
    routerOptions: RouterOptions;
    generateRouter?: (controller: InternalController) => Router;
}

export interface ExecutionContext {
    req: Request;
    res: Response;
    next: NextFunction;
    logger: logger;
}
export type logger = Record<
    'info' | 'warn' | 'error' | 'debug',
    (...values: any[]) => any
> & {
    logValue(severity: ServerTypes['logSeverites'], ...values: any[]): void;
};
export type ServerTypes = {
    logSeverites: 'INFO' | 'WARN' | 'ERR' | 'DEBUG';
};
