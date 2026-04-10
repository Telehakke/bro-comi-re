import { isNumber } from "./typeGuards";

type Validator = Readonly<{
    MIN: number;
    MAX: number;
    ensure: (value: unknown, defaultValue: number) => number;
}>;

export const Offset: Validator = {
    MIN: 0,
    MAX: 100,
    ensure(value, defaultValue) {
        if (!isNumber(value))
            return Math.max(Math.min(defaultValue, this.MAX), this.MIN);

        return Math.max(Math.min(value, this.MAX), this.MIN);
    },
};

/* -------------------------------------------------------------------------- */

export const Opacity: Validator = {
    MIN: 0,
    MAX: 100,
    ensure(value, defaultValue) {
        if (!isNumber(value))
            return Math.max(Math.min(defaultValue, this.MAX), this.MIN);

        return Math.max(Math.min(value, this.MAX), this.MIN);
    },
};

/* -------------------------------------------------------------------------- */

export const FontSize: Validator = {
    MIN: 8,
    MAX: 32,
    ensure(value, defaultValue) {
        if (!isNumber(value))
            return Math.max(Math.min(defaultValue, this.MAX), this.MIN);

        return Math.max(Math.min(value, this.MAX), this.MIN);
    },
};

/* -------------------------------------------------------------------------- */

export const FilterStrength: Validator = {
    MIN: 1,
    MAX: 10,
    ensure(value, defaultValue) {
        if (!isNumber(value))
            return Math.max(Math.min(defaultValue, this.MAX), this.MIN);

        return Math.max(Math.min(value, this.MAX), this.MIN);
    },
};

/* -------------------------------------------------------------------------- */

export const ZoomStep: Validator = {
    MIN: 10,
    MAX: 200,
    ensure(value, defaultValue) {
        if (!isNumber(value))
            return Math.max(Math.min(defaultValue, this.MAX), this.MIN);

        return Math.max(Math.min(value, this.MAX), this.MIN);
    },
};
