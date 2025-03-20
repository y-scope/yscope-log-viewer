import {CONFIG_KEY} from "../typings/config";
import {
    LLM_REQUEST_STATUS,
    LlmState,
    SetLlmStateCallback,
} from "../typings/llm";
import {getConfig} from "./config";
import {pipeThroughOpenAiStream} from "./openai";


const HTTP_RESPONSE_STATUS_OK = 200;

/**
 * Concatenate prompt with log.
 *
 * @param log
 * @param prompt
 * @return a concatenated string of prompt and log
 */
const formatPromptWithLog = (log: string, prompt: string): string => {
    const tripleBacktick = "```";
    return `${prompt}\n${tripleBacktick}\n${log}\n${tripleBacktick}`;
};

/**
 * Send logs to the configured LLM and update LLM states on response.
 *
 * @param logText
 * @param lastLlmState
 * @param setLlmState
 */
const requestLlm = (logText: string, lastLlmState: LlmState, setLlmState: SetLlmStateCallback) => {
    if (null !== lastLlmState.abortController) {
        lastLlmState.abortController.abort();
    }
    const {endpoint, prompt} = getConfig(CONFIG_KEY.LLM_OPTIONS);
    const promptWithLog: string = formatPromptWithLog(logText, prompt);
    const request = new Request(endpoint, {
        method: "POST",
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    content: promptWithLog,
                    role: "user",
                },
            ],
            stream: true,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const abortController = new AbortController();
    const llmState: LlmState = {
        abortController: abortController,
        log: logText,
        prompt: prompt,
        response: [],
        status: LLM_REQUEST_STATUS.STREAMING,
    };

    setLlmState(llmState);
    fetch(request, {signal: abortController.signal}).then((response) => {
        if (HTTP_RESPONSE_STATUS_OK !== response.status) {
            throw new Error();
        }

        if (null === response.body) {
            throw new Error("Failed to read response body.");
        }

        return response.body;
    })
        .then(async (body) => {
            const reader = pipeThroughOpenAiStream(body).getReader();
            for (;;) {
                const result = await reader.read();
                if (result.done) {
                    llmState.status = LLM_REQUEST_STATUS.COMPLETED;
                    setLlmState({...llmState});
                    break;
                }
                llmState.response.push(result.value);
                setLlmState({...llmState});
            }
        })
        .catch((reason: unknown) => {
            if ("AbortError" !== reason.name) {
                llmState.status = LLM_REQUEST_STATUS.ERROR;
                setLlmState({...llmState});
            }
        });
};

export {
    formatPromptWithLog, requestLlm,
};
