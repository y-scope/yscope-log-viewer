import {getChunkNum} from "../../src/utils/math";


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
