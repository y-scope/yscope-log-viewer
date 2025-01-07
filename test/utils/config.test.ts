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
    UNMANAGED_THEME_THROWABLE,
} from "../../src/utils/config";


/**
 * Sample decoder options that are expected to pass validation.
 */
const VALID_DECODER_OPTIONS: DecoderOptions = {
    formatString: "some format string",
    logLevelKey: "@level",
    timestampKey: "@timestamp",
};

/**
 * Sample page size that is expected to pass validation.
 */
const VALID_PAGE_SIZE = 5000;

/**
 * Runs negative test cases with the given function.
 *
 * @param func
 */
const runNegativeCases = (func: (input: ConfigUpdate) => Nullable<string>) => {
    it("should return an error message for any empty decoder option except `formatString`", () => {
        const cases = (
            Object.keys(VALID_DECODER_OPTIONS) as Array<keyof DecoderOptions>
        ).map((key) => ({
            decoderOptions: {
                key: CONFIG_KEY.DECODER_OPTIONS,
                value: {
                    ...VALID_DECODER_OPTIONS,
                    [key]: "",
                },
            } as ConfigUpdate,
            expected: {
                formatString: null,
                logLevelKey: "Log level key cannot be empty.",
                timestampKey: "Timestamp key cannot be empty.",
            }[key],
        }));

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        cases.forEach((c) => {
            const result = func(c.decoderOptions);
            expect(result).toBe(c.expected);
        });

        consoleSpy.mockRestore();
    });

    it('should throw an error for config "theme"', () => {
        const input = {
            key: CONFIG_KEY.THEME,
            value: THEME_NAME.SYSTEM,
        } as ConfigUpdate;

        expect(() => func(input)).toThrow(UNMANAGED_THEME_THROWABLE);
    });

    it("should return an error message for invalid page size", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        const result = func({
            key: CONFIG_KEY.PAGE_SIZE,
            value: -1,
        });

        expect(result).toBe(`Page size must be greater than 0 and less than ${MAX_PAGE_SIZE + 1}.`);

        consoleSpy.mockRestore();
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
        })).toThrow(UNMANAGED_THEME_THROWABLE);
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
        expect(() => getConfig(CONFIG_KEY.THEME)).toThrow(UNMANAGED_THEME_THROWABLE);
    });

    it("should retrieve initial tab name once set", () => {
        setConfig({key: CONFIG_KEY.INITIAL_TAB_NAME, value: TAB_NAME.SEARCH});
        const result = getConfig(CONFIG_KEY.INITIAL_TAB_NAME);
        expect(result).toBe(TAB_NAME.SEARCH);
    });
});
