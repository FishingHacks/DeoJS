import 'reflect-metadata';
import { constants } from './constants';
import {
    ClassByConstructor,
    classConstructor,
    emptyClassConstructor,
} from './types/generic';

const services: Record<string, any> = {};

function getService<T extends emptyClassConstructor<any>>(
    $class: T
): ClassByConstructor<T> {
    if (services[$class.name]) return services[$class.name];
    else if (!isInjectable($class))
        throw new Error('Class ' + $class.name + ' is not injectable!');
    else return (services[$class.name] = new $class());
}

function IsObject(x:any) {
    return typeof x === 'object' ? x !== null : typeof x === 'function';
}

function isInjectable<T extends emptyClassConstructor<any>>(
    $class: T
): boolean {
    return Reflect.hasMetadata(constants.metadata.injectableSignature, $class);
}

export function generateInjectArguments<T extends emptyClassConstructor<any>>(
    $class: T
): any[] {
    const args: { index: number; param: emptyClassConstructor<any> }[] =
        Reflect.getMetadata(constants.metadata.injectableClass, $class) || [];
    if (args.length < 1) return [];
    let length = 0;
    for (const arg of args) {
        if (length <= arg.index) length = arg.index + 1;
    }
    const generatedModules: any[] = Array(length).fill(undefined);
    for (const arg of args) {
        generatedModules[arg.index] = getService(arg.param);
    }
    return generatedModules;
}
