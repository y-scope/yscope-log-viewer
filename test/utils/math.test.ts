/* eslint-disable @stylistic/array-element-newline */
import {
    clamp,
    getChunkNum,
    upperBoundBinarySearch,
} from "../../src/utils/math";


describe("clamp", () => {
    test("returns the number itself if it is within the range", () => {
        expect(clamp(5, 1, 10)).toBe(5);
        expect(clamp(1, 1, 10)).toBe(1);
        expect(clamp(10, 1, 10)).toBe(10);
    });

    test("returns the lower boundary if the number is less than the range", () => {
        expect(clamp(0, 1, 10)).toBe(1);
        expect(clamp(-5, 1, 10)).toBe(1);
    });

    test("returns the upper boundary if the number is greater than the range", () => {
        expect(clamp(15, 1, 10)).toBe(10);
        expect(clamp(100, 1, 10)).toBe(10);
    });

    test(
        "returns the upper boundary when the upper boundary is less than the lower boundary",
        () => {
            expect(clamp(5, 10, 1)).toBe(1);
        }
    );
});

describe("getChunkNum", () => {
    test("returns 1 if the item number is 0 or less", () => {
        expect(getChunkNum(0, 5)).toBe(1);
        expect(getChunkNum(-10, 5)).toBe(1);
    });

    test("returns the correct chunk number for a given itemNum and chunkSize", () => {
        expect(getChunkNum(1, 5)).toBe(1);
        expect(getChunkNum(5, 5)).toBe(1);
        expect(getChunkNum(6, 5)).toBe(2);
        expect(getChunkNum(10, 5)).toBe(2);
        expect(getChunkNum(11, 5)).toBe(3);
    });

    test("returns correct chunk number for different chunk sizes", () => {
        expect(getChunkNum(10, 2)).toBe(5);
        expect(getChunkNum(15, 3)).toBe(5);
        expect(getChunkNum(20, 4)).toBe(5);
    });
});

describe("upperBoundBinarySearch", () => {
    const emptyArray: number[] = [];
    const singleElementArray = [3];
    const array = [-5, -3, 0, 1, 8, 100];
    test("returns null for empty collection with fake highIdx", () => {
        const result = upperBoundBinarySearch((idx) => emptyArray[idx], 0, 1, 5);
        expect(result).toBeNull();
    });
    test("returns null for empty collection with valid highIdx", () => {
        const result = upperBoundBinarySearch((idx) => emptyArray[idx], 0, -1, 5);
        expect(result).toBeNull();
    });
    test("returns the first index for upperboundValue < all elements in array", () => {
        const result = upperBoundBinarySearch((idx) => array[idx], 0, array.length - 1, 5);
        expect(result).toBe(0);
    });
    test("returns the first index for upperboundValue < elements in singleElementArray", () => {
        const result = upperBoundBinarySearch((idx) => singleElementArray[idx], 0, 0, 5);
        expect(result).toBe(0);
    });
    test("returns the last index for upperboundValue >= all elements in array", () => {
        const result = upperBoundBinarySearch((idx) => array[idx], 0, array.length - 1, 200);
        expect(result).toBe(array.length - 1);
    });
    test("returns the last index for upperboundValue >= elements in singleElementArray", () => {
        const result = upperBoundBinarySearch((idx) => singleElementArray[idx], 0, 0, 3);
        expect(result).toBe(0);
    });
    test("returns the index for upperboundValue doesn't exactly match any element", () => {
        const result = upperBoundBinarySearch((idx) => array[idx], 0, array.length - 1, 2);
        expect(result).toBe(3);
    });
    test("returns the index for upperboundValue matches an element", () => {
        const result = upperBoundBinarySearch((idx) => array[idx], 0, array.length - 1, 8);
        expect(result).toBe(4);
    });
    test("returns the index for upperboundValue matches the first element", () => {
        const result = upperBoundBinarySearch((idx) => array[idx], 0, array.length - 1, -5);
        expect(result).toBe(0);
    });
    test("returns the index for upperboundValue matches the last element", () => {
        const result = upperBoundBinarySearch((idx) => array[idx], 0, array.length - 1, 100);
        expect(result).toBe(5);
    });
});
