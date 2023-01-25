import { chainRouteDecorators, createParamDecorator, createParamDecoratorWithData, HttpCode, MiddlewareForChild } from "../src";
import { HTTP_CODE } from "../src/types/http";

export const OriginalUrl = createParamDecorator((ctx) => {
    return ctx.req.originalUrl;
});
export const RequestChild = createParamDecoratorWithData(
    (data: string, ctx) => (ctx.req as any)[data]
);
export const ResponseChild = createParamDecoratorWithData(
    (data: string, ctx) => (ctx.res as any)[data]
);
export const TeapotLogger = chainRouteDecorators(
    HttpCode(HTTP_CODE.IM_A_TEAPOT),
    MiddlewareForChild((req, res, next) => {
        console.log('a');
        next();
    })
);
