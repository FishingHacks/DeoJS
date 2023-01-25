import { constants } from './constants';
import { classConstructor } from './types/generic';
import { ModuleOptions } from './types/module';
import { isModule } from './utils';

export function turnModuleIntoControllers(
    target: any,
    parsedMods?: string[]
): classConstructor<any>[] {
    if (!isModule(target)) throw new Error('module is not a module');
    const module = constructModuleOptionsByModule(target);
    const obj: classConstructor<any>[] = [];
    parsedMods ||= [];
    for (const c of module.controllers || []) {
        obj.push(c);
    }
    for (const m of module.imports || []) {
        if (parsedMods.includes(m.name)) continue;
        parsedMods.push(m.name);
        for (const c of turnModuleIntoControllers(m, parsedMods)) {
            obj.push(c);
        }
    }
    return obj;
}

export function constructModuleOptionsByModule(target: any): ModuleOptions {
    if (!isModule(target)) throw new Error('module is not a module');
    return {
        controllers:
            Reflect.getMetadata(
                constants.metadata.module.moduleProvider,
                target
            ) || [],
        imports:
            Reflect.getMetadata(
                constants.metadata.module.moduleImports,
                target
            ) || [],
    };
}
