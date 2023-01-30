import {
  Request,
  Response,
  Express,
  RequestHandler,
  ErrorRequestHandler,
  Router,
  NextFunction,
} from 'express';
import express from 'express';
import {
  fillInParameters,
  generateController,
  isController,
  isNil,
  joinPath,
  maybe,
  pick,
  removeMaybesFromArray,
} from './utils';
import { constants } from './constants';
import { logger, ServerTypes } from './types/routing';
import { turnModuleIntoControllers } from './module.helper';
import { getHttpErrorCode } from './errors/http';
import { generateInjectArguments } from './serviceManager';
import { classConstructor } from './types/generic';

export function generateRouter<T extends classConstructor<any>>(
  controller: T,
  logger: logger,
): [string, Router] | undefined {
  if (!isController(controller)) return undefined;
  const controllerClass = new controller(
    ...generateInjectArguments(controller),
  );
  const controllerObj = generateController(controller);
  if (controllerObj.generateRouter)
    return [controllerObj.url, controllerObj.generateRouter(controllerObj)];
  const router = express.Router(controllerObj.routerOptions);
  if (controllerObj.middleware && controllerObj.middleware.length > 0)
    router.use(controllerObj.url, ...controllerObj.middleware);
  if (controllerObj.errorHandler)
    router.use(controllerObj.url, controllerObj.errorHandler);
  for (const r of controllerObj.routes) {
    logger.debug(
      'Registered route',
      joinPath(controllerObj.url, r.url),
      'for controller',
      controller.name,
    );
    router[r.method](
      r.url,
      removeMaybesFromArray<ErrorRequestHandler | RequestHandler>(
        maybe(!!controllerObj.errorHandler, controllerObj.errorHandler),
        maybe(!!r.errorHandler, r.errorHandler),
        ...r.middleware,
        async function (req: Request, res: Response, next: NextFunction) {
          if (!isNil(r.code)) res.status(r.code);
          if (!isNil(r.headers)) {
            for (const [k, v] of Object.entries(r.headers)) res.header(k, v);
          }
          if (!isNil(r.type)) res.type(r.type);
          if (!isNil(r.redirect)) return res.redirect(r.redirect);

          try {
            const args = fillInParameters(req, res, next, logger, r.params);
            if (r.render) {
              const data = await r.function.apply(controllerClass, args);
              if (res.headersSent)
                return console.error(
                  'Headers got send before render completion :c',
                );
              res.render(r.render || '', data);
            } else {
              const value = await r.function.apply(controllerClass, args);
              if (res.headersSent) return;
              if (typeof value === 'string') return res.send(value);
              else res.json(value);
            }
          } catch (e: any) {
            const [code, body] = getHttpErrorCode(e);
            if (code !== -1)
              res
                .status(code)
                [typeof body === 'string' ? 'send' : 'json'](body);
            return;
          }
        },
      ),
    );
  }

  return [controllerObj.url, router];
}

export class Server {
  app: Express;
  private isDevMode: boolean;
  get logger(): logger {
    return {
      debug: (...args) => this.debug(...args),
      error: (...args) => this.error(...args),
      info: (...args) => this.info(...args),
      warn: (...args) => this.warn(...args),
      logValue: (severity, ...args) => this.logValue(severity, ...args),
    };
  }

  constructor(
    dev?: boolean,
    config?: {
      viewsDirectory?: string;
      devMode?: boolean;
      renderer?: string;
    },
  ) {
    this.isDevMode = false;
    dev ||= config?.devMode || false;
    this.isDevMode ||= dev || false;
    this.app = express();
    if (config?.renderer) this.app.set('view engine', config.renderer);
    this.app.set('views', config?.viewsDirectory || './views');
    this.debug('Server initialized');
  }

  addController<T extends new () => any>(...controller: T[]) {
    for (const c of controller) {
      if (!c) continue;
      const router = generateRouter(c, this.logger);
      if (!router) continue;
      if (router[0].length < 1 || router[0] === '/') this.app.use(router[1]);
      else this.app.use(router[0], router[1]);
    }
  }

  addModule<T extends new () => any>(...modules: T[]) {
    for (const m of modules) {
      this.addController(...turnModuleIntoControllers(m));
    }
  }

  logValue(severity: ServerTypes['logSeverites'], ...values: any[]) {
    if (!this.isDevMode && severity === 'DEBUG') return;
    const prefix = constants.server.logSeverityPrefixes[severity].replaceAll(
      '{time}',
      new Date().toUTCString(),
    );
    if (severity === 'INFO') return console.info(prefix, ...values);
    else if (severity === 'WARN') return console.warn(prefix, ...values);
    else if (severity === 'ERR') return console.error(prefix, ...values);
    else return console.log(prefix, ...values);
  }

  private debug(...values: any[]) {
    if (!this.isDevMode) return;
    this.logValue('DEBUG', ...values);
  }
  private info(...values: any[]) {
    this.logValue('INFO', ...values);
  }
  private warn(...values: any[]) {
    this.logValue('WARN', ...values);
  }
  private error(...values: any[]) {
    this.logValue('ERR', ...values);
  }

  on404(req: Request, res: Response) {
    return res.send(
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot ' +
        req.method +
        ' ' +
        req.originalUrl +
        '</pre>\n</body>\n</html>\n',
    );
  }

  start(PORT?: number) {
    this.app.all('*', this.on404);
    this.debug('Starting the Server');
    const port = pick<number>(
      8080,
      PORT,
      Number(process.env.PORT),
      (global as any)?.config?.port,
      (global as any)?.expressConfig?.port,
    );
    this.app.listen(port, () =>
      this.debug('Server started and listening on port ' + port),
    );
  }
}
