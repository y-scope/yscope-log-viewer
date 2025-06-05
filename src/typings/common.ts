type Nullable<T> = T | null;

type WithId<T> = T & {id: number};

export type {
    Nullable,
    WithId,
};
