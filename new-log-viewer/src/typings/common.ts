type Nullable<T> = T | null;

type NullableProperties<T> = {
    [P in keyof T]: Nullable<T[P]>;
};

export type {
    Nullable,
    NullableProperties,
};
