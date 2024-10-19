import {LOG_LEVEL} from "./logs";


/**
 * Contents of pop-up messages and its associated auto dismiss timeout.
 */
interface PopUpMessage {
    level: LOG_LEVEL,
    message: string,
    timeoutMillis: number,
    title: string,
}

/**
 * A value that indicates that a pop-up message should not be automatically dismissed.
 */
const DO_NOT_TIMEOUT_VALUE = 0;

/**
 * The default duration in milliseconds after which an automatic dismissal will occur.
 */
const DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS = 10_000;


export type {PopUpMessage};
export {
    DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
    DO_NOT_TIMEOUT_VALUE,
};
