/**
 * @jest-environment jsdom
 */
import {Nullable} from "../../src/typings/common";
import {
    CONFIG_KEY,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
    THEME_NAME,
} from "../../src/typings/config";
import {DecoderOptions} from "../../src/typings/decoders";
import {TAB_NAME} from "../../src/typings/tab";
import {
    CONFIG_DEFAULT,
    getConfig,
    MAX_PAGE_SIZE,
    setConfig,
    testConfig,
} from "../../src/utils/config";


const VALID_DECODER_OPTIONS: DecoderOptions = {
    formatString: "some format string",
    logLevelKey: "@level",
    timestampKey: "@timestamp",
};
const EMPTY_DECODER_OPTIONS_PROMPTS: Record<keyof DecoderOptions, Nullable<string>> = {
    formatString: null,
    timestampKey: "Timestamp key cannot be empty.",
    logLevelKey: "Log level key cannot be empty.",
};

const VALID_PAGE_SIZE = 5000;
const INVALID_PAGE_SIZE = -1;

const UNMANAGED_THEME_THROWABLE =
    new Error(`"${CONFIG_KEY.THEME}" cannot be managed using these utilities.`);

/* eslint-disable sort-keys */
/**
 * Negative test cases for `testConfig` and `setConfig` function.
 */
const NEGATIVE_CONFIG_CASES: Record<string, {
    input: ConfigUpdate | ConfigUpdate[],
    expected?: Nullable<string | string[]>,
    throwable?: Error
}> = Object.freeze({
    "should return an error message for any empty decoder option except an empty `formatString`": {
        input: (Object.keys(VALID_DECODER_OPTIONS) as Array<keyof DecoderOptions>).map((key) => ({
            key: CONFIG_KEY.DECODER_OPTIONS,
            value: {
                ...VALID_DECODER_OPTIONS,
                [key]: "",
            },
        })) as ConfigUpdate[],
        expected: (Object.keys(VALID_DECODER_OPTIONS) as Array<keyof DecoderOptions>).map(
            (key) => EMPTY_DECODER_OPTIONS_PROMPTS[key]
        ) as string[],
    },
    'should throw an error for config "theme"': {
        input: {
            key: CONFIG_KEY.THEME,
            value: THEME_NAME.SYSTEM,
        },
        throwable: UNMANAGED_THEME_THROWABLE,
    },
    "should return an error message for invalid page size": {
        input: {
            key: CONFIG_KEY.PAGE_SIZE,
            value: -1,
        },
        expected: "Page size must be greater than 0 and less than 1000001.",
    },
});
/* eslint-enable sort-keys */

/**
 * Runs negative test cases with the given function.
 *
 * @param func
 */
const runNegativeCases = (func: (input: ConfigUpdate) => Nullable<string>) => {
    Object.entries(NEGATIVE_CONFIG_CASES).forEach(([description, {input, expected, throwable}]) => {
        if (Array.isArray(input)) {
            it(description, () => {
                input.forEach((testInput, index) => {
                    const result = func(testInput);
                    expect(result).toBe(expected?.[index]);
                });
            });
        } else {
            it(description, () => {
                if ("undefined" !== typeof expected) {
                    const result = func(input);
                    expect(result).toBe(expected);
                }
                if ("undefined" !== typeof throwable) {
                    expect(() => func(input)).toThrow(throwable);
                }
            });
        }
    });
};

describe("testConfig", () => {
    runNegativeCases(testConfig);

    it("should return null for valid decoder options", () => {
        const result = testConfig({
            key: CONFIG_KEY.DECODER_OPTIONS,
            value: VALID_DECODER_OPTIONS,
        });

        expect(result).toBeNull();
    });

    it("should return null for all valid TAB_NAME values", () => {
        Object.values(TAB_NAME).forEach((tabName) => {
            const result = testConfig({
                key: CONFIG_KEY.INITIAL_TAB_NAME,
                value: tabName,
            });

            expect(result).toBeNull();
        });
    });

    it("should return null for valid page size", () => {
        const result = testConfig({
            key: CONFIG_KEY.PAGE_SIZE,
            value: 1,
        });

        expect(result).toBeNull();
    });
});

describe("setConfig", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    runNegativeCases(setConfig);

    it("should store decoder options in localStorage", () => {
        const result = setConfig({
            key: CONFIG_KEY.DECODER_OPTIONS,
            value: VALID_DECODER_OPTIONS,
        });

        expect(result).toBeNull();
        expect(localStorage.getItem(LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING)).toBe(
            VALID_DECODER_OPTIONS.formatString
        );
        expect(localStorage.getItem(LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY)).toBe(
            VALID_DECODER_OPTIONS.logLevelKey
        );
        expect(localStorage.getItem(LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY)).toBe(
            VALID_DECODER_OPTIONS.timestampKey
        );
    });

    it("should store page size in localStorage", () => {
        const result = setConfig({
            key: CONFIG_KEY.PAGE_SIZE,
            value: VALID_PAGE_SIZE,
        });

        expect(result).toBeNull();
        expect(localStorage.getItem(LOCAL_STORAGE_KEY.PAGE_SIZE)).toBe(VALID_PAGE_SIZE.toString());
    });

    it("should throw an error for unsupported theme key", () => {
        expect(() => setConfig({
            key: CONFIG_KEY.THEME,
            value: THEME_NAME.SYSTEM,
        })).toThrow(`"${CONFIG_KEY.THEME}" cannot be managed using these utilities.`);
    });

    it("should log an error for invalid page size", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const result = setConfig({
            key: CONFIG_KEY.PAGE_SIZE,
            value: INVALID_PAGE_SIZE,
        });

        expect(result).toBe(
            `Page size must be greater than 0 and less than ${MAX_PAGE_SIZE + 1}.`
        );
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining(`Unable to set ${CONFIG_KEY.PAGE_SIZE}=${INVALID_PAGE_SIZE}`)
        );
        consoleSpy.mockRestore();
    });
});

describe("getConfig", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("should return the default value for an unset key", () => {
        const decoderOptions = getConfig(CONFIG_KEY.DECODER_OPTIONS);
        expect(decoderOptions).toEqual(CONFIG_DEFAULT[CONFIG_KEY.DECODER_OPTIONS]);

        const initialTabName = getConfig(CONFIG_KEY.INITIAL_TAB_NAME);
        expect(initialTabName).toBe(CONFIG_DEFAULT[CONFIG_KEY.INITIAL_TAB_NAME]);

        const pageSize = getConfig(CONFIG_KEY.PAGE_SIZE);
        expect(pageSize).toBe(CONFIG_DEFAULT[CONFIG_KEY.PAGE_SIZE]);
    });

    it("should retrieve decoder options once set", () => {
        setConfig({key: CONFIG_KEY.DECODER_OPTIONS, value: VALID_DECODER_OPTIONS});
        const result = getConfig(CONFIG_KEY.DECODER_OPTIONS);
        expect(result).toEqual(VALID_DECODER_OPTIONS);
    });

    it("should retrieve page size once set", () => {
        setConfig({key: CONFIG_KEY.PAGE_SIZE, value: VALID_PAGE_SIZE});
        const result = getConfig(CONFIG_KEY.PAGE_SIZE);
        expect(result).toBe(VALID_PAGE_SIZE);
    });

    it('should throw an error for config "theme"', () => {
        expect(() => getConfig(CONFIG_KEY.THEME)).toThrow(
            `"${CONFIG_KEY.THEME}" cannot be managed using these utilities.`
        );
    });

    it("should retrieve initial tab name once set", () => {
        setConfig({key: CONFIG_KEY.INITIAL_TAB_NAME, value: TAB_NAME.SEARCH});
        const result = getConfig(CONFIG_KEY.INITIAL_TAB_NAME);
        expect(result).toBe(TAB_NAME.SEARCH);
    });
});
