import { generateInjectArguments } from "../serviceManager";
import { ClassByConstructor, classConstructor } from "../types/generic";

export function generateController<T extends classConstructor<any>>(controller: T): ClassByConstructor<T> {
    const args = generateInjectArguments(controller);
    return new controller(...args);
}