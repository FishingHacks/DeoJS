import { Transformer, ValidationError, Validator } from './type';

export function isString(): Validator {
    return (value) => {
        if (typeof value !== 'string')
            throw new ValidationError('Value is not a string');
    };
}
export function max(max: number): Validator {
    return (value) => {
        isString()(value);
        if (value.length > max)
            throw new ValidationError(
                'Value is more than ' + max + ' Characters'
            );
    };
}
export function min(min: number): Validator {
    return (value) => {
        isString()(value);
        if (value.length < min)
            throw new ValidationError(
                'Value is less than ' + min + ' Characters'
            );
    };
}
export function startsWith(str: string): Validator {
    return (value) => {
        isString()(value);
        if (!(value as string).startsWith(str))
            throw new ValidationError('Value does not start with ' + str);
    };
}
export function endsWith(str: string): Validator {
    return (value) => {
        isString()(value);
        if (!(value as string).endsWith(str))
            throw new ValidationError('Value does not end with ' + str);
    };
}
export function matches(regex: RegExp): Validator {
    return (value) => {
        isString()(value);
        if (!(value as string).match(regex) === null)
            throw new ValidationError(
                'Value does not match ' + regex.toString()
            );
    };
}
export function uuid(): Validator {
    return (value) => {
        isString()(value);
        matches(REGEXES.uuid)(value);
    };
}
export function email(): Validator {
    return (value) => {
        isString()(value);
        matches(REGEXES.email)(value);
    };
}
export function cuid(): Validator {
    return (value) => {
        isString()(value);
        matches(REGEXES.cuid)(value);
    };
}
export function validTimestamp(): Validator {
    return (value) => {
        isString()(value);
        matches(REGEXES.timestamp)(value);
    };
}
export function timestampToDate(): Transformer {
    return (value) => {
        isString()(value);
        validTimestamp()(value);
        return new Date(value as string);
    };
}
export function trim(): Transformer {
    return (value) => {
        isString()(value);
        return (value as string).trim();
    };
}
export function trimStart(): Transformer {
    return (value) => {
        isString()(value);
        return (value as string).trimStart();
    };
}
export function trimEnd(): Transformer {
    return (value) => {
        isString()(value);
        return (value as string).trimEnd();
    };
}
export function replace(
    search: string | RegExp,
    replace: string,
    onlyFirstOccurence: false
): any;
export function replace(
    search: string | RegExp,
    replace: string | ((substring: string, ...args: any[]) => string),
    onlyFirstOccurence?: true
): any;
export function replace(
    search: string | RegExp,
    replacer: string | ((substring: string, ...args: any[]) => string),
    onlyFirstOccurence?: boolean
): Transformer {
    return (value) => {
        isString()(value);
        if (onlyFirstOccurence && typeof replacer === 'function')
            throw new SyntaxError(
                'Error: Replacer functions are only allowed in replacers that replace all occurences (have no or false 3rd argument)'
            );
        if (onlyFirstOccurence)
            return (value as string).replace(search, replacer as string);
        return (value as string).replaceAll(search, replacer as string);
    };
}
export function includes(search: string): Validator {
    return (value) => {
        isString()(value);
        if (!(value as string).includes(search))
            throw new ValidationError('Value does not include ' + search);
    };
}
export function toUpperCase(): Transformer {
    return (value) => {
        isString()(value);
        return (value as string).toUpperCase();
    }
}
export function toLowerCase(): Transformer {
    return (value) => {
        isString()(value);
        return (value as string).toLowerCase();
    }
}

const REGEXES = {
    uuid: /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/,
    email: /$(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])^/,
    cuid: /^c[a-z0-9]+$/,
    timestamp:
        /^[0-9]{4}-(0[0-9]|10|11|12)-([012][0-9]|30|31)T([01][0-9]|2[0-4]):([0-5][0-9]|60):([0-5][0-9]|60)(.[0-9]+)?Z$/,
};
