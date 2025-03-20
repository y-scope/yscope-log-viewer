import {Nullable} from "./common";


enum LLM_REQUEST_STATUS {
    COMPLETED,
    ERROR,
    NOT_YET_INITIATED,
    STREAMING,
}

type LlmState = {
    abortController: Nullable<AbortController>;
    log: string;
    prompt: string;
    response: string[];
    status: LLM_REQUEST_STATUS;
};

interface LlmOptions {
    endpoint: string;
    eventNum: number;
    prompt: string;
}

/**
 * The default value for `LlmState`.
 *
 */
const LLM_STATE_DEFAULT: Readonly<LlmState> = Object.freeze({
    abortController: null,
    prompt: "",
    response: [],
    status: LLM_REQUEST_STATUS.NOT_YET_INITIATED,
});

type SetLlmStateCallback = (llmState: LlmState) => void;

export {
    LLM_REQUEST_STATUS,
    LLM_STATE_DEFAULT,
};
export type {
    LlmOptions, LlmState, SetLlmStateCallback,
};
