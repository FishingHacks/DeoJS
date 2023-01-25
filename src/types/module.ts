import { classConstructor, emptyClassConstructor } from "./generic";

export interface ModuleOptions {
    imports?: emptyClassConstructor<{}>[];
    controllers?: classConstructor<any>[];
}
