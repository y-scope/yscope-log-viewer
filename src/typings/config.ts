import {DecoderOptions} from "./decoders";
import {TAB_NAME} from "./tab";


enum THEME_NAME {
    SYSTEM = "system",
    DARK = "dark",
    LIGHT = "light",
}

enum CONFIG_KEY {
    DECODER_OPTIONS = "decoderOptions",
    INITIAL_TAB_NAME = "initialTabName",
    THEME = "theme",
    PAGE_SIZE = "pageSize",
}

/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
enum LOCAL_STORAGE_KEY {
    DECODER_OPTIONS_FORMAT_STRING = `${CONFIG_KEY.DECODER_OPTIONS}/formatString`,
    DECODER_OPTIONS_LOG_LEVEL_KEY = `${CONFIG_KEY.DECODER_OPTIONS}/logLevelKey`,
    DECODER_OPTIONS_TIMESTAMP_KEY = `${CONFIG_KEY.DECODER_OPTIONS}/timestampKey`,
    INITIAL_TAB_NAME = CONFIG_KEY.INITIAL_TAB_NAME,
    THEME = CONFIG_KEY.THEME,
    PAGE_SIZE = CONFIG_KEY.PAGE_SIZE,
}
/* eslint-enable @typescript-eslint/prefer-literal-enum-member */

type ConfigMap = {
    [CONFIG_KEY.DECODER_OPTIONS]: DecoderOptions,
    [CONFIG_KEY.INITIAL_TAB_NAME]: TAB_NAME,
    [CONFIG_KEY.THEME]: THEME_NAME,
    [CONFIG_KEY.PAGE_SIZE]: number,
};

type ConfigUpdate = {
    [T in keyof ConfigMap]: {
        key: T;
        value: ConfigMap[T];
    }
}[keyof ConfigMap];

export {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
    THEME_NAME,
};
export type {
    ConfigMap,
    ConfigUpdate,
};
