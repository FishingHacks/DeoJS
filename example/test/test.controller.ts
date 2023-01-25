import { Controller, RouterOptions, Middleware, ErrorHandler, Get, Query, pipes, Render, Logger, CustomHttpStatusCodeError, Inject } from "overnight";
import { logger } from 'overnight/types/routing';
import { TeapotLogger, OriginalUrl, RequestChild } from "../custom.decorator";
import { TestService } from "./test.service";

@Controller('')
@RouterOptions({ caseSensitive: true, mergeParams: true })
@Middleware((req, res, next, logger) => {
    logger.debug(req.originalUrl);
    return next();
})
@ErrorHandler((err, req, res, next) => {
    console.log(err);
    return next();
})
export class TestController {
    constructor(@Inject() private testService: TestService) {}

    @Get('abc')
    @TeapotLogger
    a(
        @Query('name', pipes.strings.isString(), pipes.strings.max(10))
        name: string,
        @OriginalUrl() url: string
    ) {
        return { name, url };
    }

    @Get('test')
    handleTestRoute() {
        this.testService.logCat();
        throw new CustomHttpStatusCodeError({ text: 'Hii, im text' }, 510);
    }

    @Get('/')
    @Render('index.ejs')
    async redi(
        @Query('name') name: string,
        @RequestChild('method', pipes.strings.toUpperCase()) method: string,
        @Logger() logger: logger,
        @RequestChild('url') url: string,
        @RequestChild('httpVersion') httpVersion: string
    ) {
        logger.debug(`HTTP/${httpVersion} ${method} ${url}`);
        return { name: name || 'Fishie' };
    }
}
