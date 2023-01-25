import { constants } from '../constants';
import { emptyClassConstructor } from '../types/generic';
import { ModuleOptions } from '../types/module';
import { isController, isModule } from '../utils';

export function Module(options: ModuleOptions) {
    return function <T extends emptyClassConstructor<{}>>(constructor: T) {
        for (const m of options.imports || []) {
            if (!isModule(m)) throw new Error(m.name + ' is not a module');
        }
        for (const c of options.controllers || []) {
            if (!isController(c))
                throw new Error(c.name + ' is not a controller');
        }

        Reflect.defineMetadata(
            constants.metadata.module.signature,
            true,
            constructor
        );
        Reflect.defineMetadata(
            constants.metadata.module.moduleImports,
            (options.imports || []).filter((el) => isModule(el)),
            constructor
        );
        Reflect.defineMetadata(
            constants.metadata.module.moduleProvider,
            (options.controllers || []).filter((el) => isController(el)),
            constructor
        );
    };
}
