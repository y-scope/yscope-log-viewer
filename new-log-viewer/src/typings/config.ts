enum CONFIG_NAME {
    DECODER_OPTIONS = "decoderOptions",
    THEME = "theme",
    PAGE_SIZE = "pageSize",
}

enum LOCAL_STORAGE_KEY {
    DECODER_OPTIONS_FORMAT_STRING = `${CONFIG_NAME.DECODER_OPTIONS}/formatString`,
    DECODER_OPTIONS_LOG_LEVEL_KEY = `${CONFIG_NAME.DECODER_OPTIONS}/logLevelKey`,
    DECODER_OPTIONS_TIMESTAMP_KEY = `${CONFIG_NAME.DECODER_OPTIONS}/timestampKey`,
    THEME = CONFIG_NAME.THEME,
    PAGE_SIZE = CONFIG_NAME.PAGE_SIZE,
}

type ConfigMap = {
    [CONFIG_NAME.DECODER_OPTIONS]: {
        formatString: string,
        logLevelKey: string,
        timestampKey: string,
    },
    [CONFIG_NAME.THEME]: string,
    [CONFIG_NAME.PAGE_SIZE]: number,
}

type ConfigUpdate = {
    [T in keyof ConfigMap]: { code: T, value: ConfigMap[T] };
}[keyof ConfigMap];

export {
    CONFIG_NAME, LOCAL_STORAGE_KEY,
};
export type {
    ConfigMap, ConfigUpdate,
};
