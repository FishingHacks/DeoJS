import {
    TransformationError,
    Transformer,
    ValidationError,
    Validator,
} from './type';

export function enumValidator(
    values: (string | number)[] | Record<string, number | string>
): Validator {
    if (!(values instanceof Array)) {
        values = Object.values(values).filter(
            (el) => typeof el === 'number'
        ) as number[];
    }
    return function (value) {
        if (!(values as (number | string)[]).includes(value))
            throw new ValidationError(value + ' is not part of the enum');
    };
}
export function nativeEnumValidator(
    values: Record<string, string | number>
): Transformer {
    return function (value) {
        if (values[value] === undefined)
            throw new TransformationError(value + ' is not part of the enum');
        else if (typeof value === 'number') return value;
        else if (typeof values[value] === 'number') return values[value];
        else
            throw new TransformationError(
                'Could not parse the value to the enum'
            );
    };
}
