let enumClpWorkerProtocol = 0;
let CLP_WORKER_PROTOCOL = {
    ERROR: enumClpWorkerProtocol++,
    LOADING_MESSAGES: enumClpWorkerProtocol++,
    LOAD_FILE: enumClpWorkerProtocol++,
    UPDATE_VERBOSITY: enumClpWorkerProtocol++,
    GET_LINE_FROM_EVENT: enumClpWorkerProtocol++,
    GET_EVENT_FROM_LINE: enumClpWorkerProtocol++,
    CHANGE_PAGE: enumClpWorkerProtocol++,
    LOAD_LOGS: enumClpWorkerProtocol++,
    REDRAW_PAGE: enumClpWorkerProtocol++,
    PRETTY_PRINT: enumClpWorkerProtocol++,
    UPDATE_STATE: enumClpWorkerProtocol++,
    UPDATE_FILE_INFO: enumClpWorkerProtocol++,
    UPDATE_SEARCH_STRING: enumClpWorkerProtocol++,
    UPDATE_SEARCH_RESULTS: enumClpWorkerProtocol++,
};
CLP_WORKER_PROTOCOL = Object.freeze(CLP_WORKER_PROTOCOL);

export default CLP_WORKER_PROTOCOL;
