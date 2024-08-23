import {Nullable} from "../typings/common";


/**
 * Finds the key in a map based on the provided value.
 *
 * @param map
 * @param value
 * @return The key if found, null otherwise.
 */
const getMapKeyByValue = <T, M>(map: Map<T, M>, value: M): Nullable<T> => {
    const entry = [...map].find(([, val]) => val === value);
    return ("undefined" !== typeof entry) ?
        entry[0] :
        null;
};

/**
 * Finds the value associated with the key that's nearest but less than or equal to a target key.
 *
 * @param map
 * @param targetKey
 * @return The value if found, null otherwise.
 */
const getMapValueWithNearestLessThanOrEqualKey = <T>(
    map: Map<number, T>,
    targetKey: number
): Nullable<T> => {
    let lowerBoundKey = -1;
    map.forEach((_, currentKey) => {
        if (currentKey <= targetKey && currentKey > lowerBoundKey) {
            lowerBoundKey = currentKey;
        }
    });

    return (-1 === lowerBoundKey) ?
        null :
        map.get(lowerBoundKey) as T;
};

export {
    getMapKeyByValue,
    getMapValueWithNearestLessThanOrEqualKey,
};
