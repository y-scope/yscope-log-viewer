type Nullable<T> = T | null;

type NullableProperties<T> = {
    [P in keyof T]: Nullable<T[P]>;
};

type WithId<T> = T & { id: number };

export type {
    Nullable,
    NullableProperties,
    WithId,
};
