import {Nullable} from "./common";
import {LOG_LEVEL} from "./logs";


/**
 * Contents of popup messages and its associated auto dismiss timeout.
 */
interface PopupMessage {
    level: LOG_LEVEL,
    message: string,
    timeoutMillis: Nullable<number>,
    title: string,
}

export type {PopupMessage};
