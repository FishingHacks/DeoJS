export class BadRequestError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 400;
    constructor(public body: any) {
        super();
    }
}
export class HttpError400 extends BadRequestError {}
export class UnauthorizedError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 401;
    constructor(public body: any) {
        super();
    }
}
export class HttpError401 extends UnauthorizedError {}
export class ForbiddenError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 403;
    constructor(public body: any) {
        super();
    }
}
export class HttpError403 extends ForbiddenError {}
export class NotFoundError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 404;
    constructor(public body: any) {
        super();
    }
}
export class HttpError404 extends NotFoundError {}
export class UnsupportedMediaTypeError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 415;
    constructor(public body: any) {
        super();
    }
}
export class HttpError415 extends UnsupportedMediaTypeError {}
export class TeapotError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 418;
    constructor(public body: any) {
        super();
    }
}
export class HttpError418 extends TeapotError {}
export class TooManyRequestsError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 429;
    constructor(public body: any) {
        super();
    }
}
export class HttpError429 extends TooManyRequestsError {}
export class InternalServerError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 500;
    constructor(public body: any) {
        super();
    }
}
export class HttpError500 extends InternalServerError {}
export class NotImplementedError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 501;
    constructor(public body: any) {
        super();
    }
}
export class HttpError501 extends NotImplementedError {}
export class BadGatewayError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 502;
    constructor(public body: any) {
        super();
    }
}
export class HttpError502 extends BadGatewayError {}
export class ServiceUnavailableError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    code = 503;
    constructor(public body: any) {
        super();
    }
}
export class HttpError503 extends ServiceUnavailableError { }
export class CustomHttpStatusCodeError extends Error {
    $$type = 'HTTP_CODE_ERROR';
    constructor(public body: any, public code: number) {
        super();
    }
}
export const ERRORS = [
    BadRequestError,
    HttpError400,
    UnauthorizedError,
    HttpError401,
    ForbiddenError,
    HttpError403,
    NotFoundError,
    HttpError404,
    UnsupportedMediaTypeError,
    HttpError415,
    TeapotError,
    HttpError418,
    TooManyRequestsError,
    HttpError429,
    InternalServerError,
    HttpError500,
    NotImplementedError,
    HttpError501,
    BadGatewayError,
    HttpError502,
    ServiceUnavailableError,
    HttpError503,
    CustomHttpStatusCodeError,
];
export type HTTP_ERROR =
    | BadRequestError
    | HttpError400
    | UnauthorizedError
    | HttpError401
    | ForbiddenError
    | HttpError403
    | NotFoundError
    | HttpError404
    | UnsupportedMediaTypeError
    | HttpError415
    | TeapotError
    | HttpError418
    | TooManyRequestsError
    | HttpError429
    | InternalServerError
    | HttpError500
    | NotImplementedError
    | HttpError501
    | BadGatewayError
    | HttpError502
    | ServiceUnavailableError
    | HttpError503
    | CustomHttpStatusCodeError;

export function isHttpCodeError(error: Error) {
    return ERRORS.map((el) => error instanceof el).includes(true);
}
export function getHttpErrorCode(error: HTTP_ERROR): [number, any] {
    if (
        isHttpCodeError(error||'') &&
        error?.$$type === 'HTTP_CODE_ERROR' &&
        error?.code !== undefined &&
        error?.body !== undefined
    )
        return [error.code, error.body];
    return [-1, undefined];
}
