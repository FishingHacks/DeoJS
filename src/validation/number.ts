import {
    TransformationError,
    Transformer,
    ValidationError,
    Validator,
} from './type';

export function isNumber(): Validator {
    return (value) => {
        if (typeof value !== 'number')
            throw new ValidationError('Value is not a number');
        if (isNaN(value)) throw new ValidationError('Value is not a number');
    };
}
export function tryParseValue(): Transformer {
    return (value) => {
        value = Number(value);
        if (typeof value !== 'number')
            throw new TransformationError(
                'Value could not be parsed to a number'
            );
        if (isNaN(value))
            throw new TransformationError(
                'Value could not be parsed to a number'
            );
        return value;
    };
}
export function finite(): Validator {
    return (value) => {
        isNumber()(value);
        if (!isFinite(value)) throw new ValidationError('Value is not finite');
    };
}
export function infinite(): Validator {
    return (value) => {
        isNumber()(value);
        if (isFinite(value)) throw new ValidationError('Value is not infinite');
    };
}
export function gt(num: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value <= num)
            throw new ValidationError('Value is not greater than ' + num);
    };
}
export function gte(num: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value < num)
            throw new ValidationError(
                'Value is not greater than or equal to' + num
            );
    };
}
export function lt(num: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value >= num)
            throw new ValidationError('Value is not less than ' + num);
    };
}
export function lte(num: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value > num)
            throw new ValidationError(
                'Value is not less than or equal to' + num
            );
    };
}
export function max(max: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value > max)
            throw new ValidationError('Value can only go up to ' + max);
    };
}
export function min(min: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value < min)
            throw new ValidationError('Value can only go down to ' + min);
    };
}
export function int(): Validator {
    return (value) => {
        isNumber()(value);
        if (Math.floor(value) !== value)
            throw new ValidationError('Value is not an int');
    };
}
export function positive(): Validator {
    return (value) => {
        isNumber()(value);
        if (value <= 0) throw new ValidationError('Value has to be positive');
    };
}
export function nonnegative(num: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value < 0) throw new ValidationError("Value can't be negative");
    };
}
export function negative(): Validator {
    return (value) => {
        isNumber()(value);
        if (value >= 0) throw new ValidationError('Value has to be negative');
    };
}
export function nonpositive(): Validator {
    return (value) => {
        isNumber()(value);
        if (value > 0) throw new ValidationError("Value can't be positive");
    };
}
export function step(step: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value % step !== 0)
            throw new ValidationError('Value has to be in steps of ' + step);
    };
}
export function multipleOf(multiples: number): Validator {
    return (value) => {
        isNumber()(value);
        if (value % multiples !== 0)
            throw new ValidationError(
                'Value has to be in multiples of ' + multiples
            );
    };
}
