import 'reflect-metadata';
import { constants } from '../constants';
import { extendArrayMetadata } from '../utils';

export function Injectable<T extends new () => any>(target: T) {
    Reflect.defineMetadata(
        constants.metadata.injectableSignature,
        true,
        target
    );
    return target;
}

export function Inject<T extends new () => any>($class?: T) {
    return function (target: any, key: string | symbol, index?: number) {
        if (
            $class &&
            !Reflect.hasMetadata(constants.metadata.injectableSignature, $class)
        )
            throw new Error('Cannot inject a non-injectable class');
        const type = $class || Reflect.getMetadata('design:type', target, key);

        if (index !== null && index !== undefined) {
            extendArrayMetadata(
                constants.metadata.injectableClass,
                [{ index, param: type }],
                target
            );
        }
    };
}
