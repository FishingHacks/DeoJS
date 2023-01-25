import { ServerTypes } from "./types/routing";

export const constants = {
    metadata: {
        injectableSignature: '__injectable__',
        injectableClass: 'injectable:class',
        controller: {
            signature: '__controller__',
            path: 'controller:path',
            middleware: 'controller:middleware',
            errorHandler: 'controller:errorhandler',
            options: 'controller:options',
            routes: 'controller:routes',
        },
        route: {
            signature: '__route__',
            errorHandler: 'route:errorhandler',
            middleware: 'route:middleware',
            render: 'route:render',
            redirect: 'route:redirect',
            code: 'route:code',
            type: 'route:type',
            header: 'route:header',
            params: 'route:parameters',
        },
        module: {
            signature: '__module__',
            moduleImports: 'module:imports',
            moduleProvider: 'module:provider',
        },
    },
    server: {
        logSeverityPrefixes: {
            DEBUG: '[{time}] [Debug]:',
            ERR: '[{time}] [ERROR]:',
            INFO: '[{time}] [Info]:',
            WARN: '[{time}] [Warn]:',
        } as Record<ServerTypes['logSeverites'], string>,
    },
};
