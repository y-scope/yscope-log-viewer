import axios, {AxiosError} from "axios";
import {
    getReasonPhrase,
    StatusCodes,
} from "http-status-codes";

import {
    convertAxiosError,
    getUint8ArrayFrom,
} from "../../src/utils/http";


// eslint-disable-next-line no-warning-comments
// TODO: Add unit tests with mock responses for below tests that interact with the httpbin endpoint.
const HTTP_BIN_ENDPOINT_BASE = "https://cloud.yscope.com/httpbin";

describe("getUint8ArrayFrom", () => {
    it(
        "should fetch a file and return a Uint8Array",
        async () => {
            const myString = "hello";
            const myDataArray = new TextEncoder().encode(myString);
            const url = `${HTTP_BIN_ENDPOINT_BASE}/base64/${btoa(myString)}`;

            const result = await getUint8ArrayFrom(url);
            expect(result).toEqual(myDataArray);
        }
    );
});

describe("Invalid HTTP sources", () => {
    it(
        "should cause a custom error to be thrown when the HTTP request is not successful",
        async () => {
            const url = `${HTTP_BIN_ENDPOINT_BASE}/status/${StatusCodes.NOT_FOUND}`;
            await expect(getUint8ArrayFrom(url)).rejects.toMatchObject({
                message: `Request failed with status code ${StatusCodes.NOT_FOUND}`,
                cause: {
                    url: url,
                },
            });
        }
    );

    it("should cause a TypeError to be thrown when the URL is invalid", async () => {
        const url = "/";
        await expect(() => getUint8ArrayFrom(url)).rejects.toThrow({
            name: "TypeError",
            message: "Invalid URL",
        });
    });
});

describe("convertAxiosError", () => {
    it("should handle errors with a response available", async () => {
        const url = `${HTTP_BIN_ENDPOINT_BASE}/status/${StatusCodes.NOT_FOUND}`;
        const expectedCode = "ERR_BAD_REQUEST";
        const expectedStatus = StatusCodes.NOT_FOUND;
        const expectedStatusText = getReasonPhrase(expectedStatus).toUpperCase();
        const expectedBody = "";

        try {
            // Access a 404 route.
            await axios.get(url);
        } catch (e) {
            const error = convertAxiosError(e as AxiosError);
            expect(error.cause).toEqual({
                url: url,
                code: expectedCode,
                details: `get returned ${expectedStatus}(${expectedStatusText}): ${expectedBody}`,
            });
        }
    });

    it("should handle errors with no response available", async () => {
        const url = "http://127.0.0.1:9";
        const expectedCode = "ECONNREFUSED";

        try {
            // Access the Discard server.
            await axios.get(url);
        } catch (e) {
            const error = convertAxiosError(e as AxiosError);
            expect(error.cause).toEqual({
                url: url,
                code: expectedCode,
                details: `get ${url} failed with no response: ${expectedCode}`,
            });
        }
    });

    it("should handle errors with certain properties missing", () => {
        const expectedUrl = "UNKNOWN URL";
        const expectedCode = "UNKNOWN CODE";

        const error = convertAxiosError(new AxiosError(""));
        expect(error.message).toBe(`${AxiosError.name}: ${expectedCode}`);
        expect(error.cause).toEqual({
            url: expectedUrl,
            code: expectedCode,
            details: `UNKNOWN METHOD ${expectedUrl} failed with no response: ${expectedCode}`,
        });
    });
});
