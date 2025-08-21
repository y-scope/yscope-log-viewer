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
    const array = [-5, -3, 0, 1, 1, 8, 8, 8, 100];
    test("returns null if collection is empty", () => {
        const result = upperBoundBinarySearch(emptyArray, (arrayElement) => arrayElement, 5);
        expect(result).toBeNull();
    });
    test("returns the first index if upperBoundValue < all elements in array", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, -10);
        expect(result).toBe(0);
    });
    test("returns the first index if upperBoundValue < element in singleElementArray", () => {
        const result = upperBoundBinarySearch(
            singleElementArray,
            (arrayElement) => arrayElement,
            -10
        );

        expect(result).toBe(0);
    });
    test("returns the last index if upperBoundValue > all elements in array", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, 200);
        expect(result).toBe(array.length - 1);
    });
    test("returns the last index if upperBoundValue > element in singleElementArray", () => {
        const result = upperBoundBinarySearch(
            singleElementArray,
            (arrayElement) => arrayElement,
            200
        );

        expect(result).toBe(0);
    });
    test("returns the correct index if upperBoundValue doesn't match any elements", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, 2);
        expect(result).toBe(4);
    });
    test("returns the correct index if upperBoundValue matches a unique element", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, 0);
        expect(result).toBe(2);
    });
    test("returns the last matched index if upperBoundValue matches a duplicated element", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, 8);
        expect(result).toBe(7);
    });
    test("returns index 0 if upperBoundValue matches the first element", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, -5);
        expect(result).toBe(0);
    });
    test("returns the last index if upperBoundValue matches the last element", () => {
        const result = upperBoundBinarySearch(array, (arrayElement) => arrayElement, 100);
        expect(result).toBe(array.length - 1);
    });
});
