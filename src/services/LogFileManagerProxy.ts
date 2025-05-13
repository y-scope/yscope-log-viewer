import {Nullable} from "../typings/common";
import {DecoderOptions} from "../typings/decoders";
import {LogLevelFilter} from "../typings/logs";
import {QueryResults} from "../typings/query";
import {
    CursorType,
    FileSrcType,
    LogFileInfo,
    PageData,
} from "../typings/worker";
import LogFileManager from "./LogFileManager";


class LogFileManagerProxy {
    logFileManager: Nullable<LogFileManager> = null;

    async loadFile (
        {decoderOptions, fileSrc, pageSize}: {
            decoderOptions: DecoderOptions;
            fileSrc: FileSrcType;
            pageSize: number;
        },
        onExportChunk: (logs: string) => void,
        onQueryResults: (queryProgress: number, queryResults: QueryResults) => void,
    ): Promise<LogFileInfo> {
        const logFileManager = await LogFileManager.create({
            decoderOptions: decoderOptions,
            fileSrc: fileSrc,
            onExportChunk: onExportChunk,
            onQueryResults: onQueryResults,
            pageSize: pageSize,
        });

        this.logFileManager = logFileManager;

        return {
            fileName: logFileManager.fileName,
            fileType: logFileManager.fileType,
            numEvents: logFileManager.numEvents,
            onDiskFileSizeInBytes: logFileManager.onDiskFileSizeInBytes,
        };
    }

    loadPage (
        cursor: CursorType,
        isPrettified: boolean,
        logTimezone: string | null
    ): PageData {
        const logFileManager = this.#getLogFileManager();
        return logFileManager.loadPage(cursor, isPrettified, logTimezone);
    }

    setFilter (
        cursor: CursorType,
        isPrettified: boolean,
        logLevelFilter: LogLevelFilter,
        logTimezone: string | null
    ): PageData {
        const logFileManager = this.#getLogFileManager();
        logFileManager.setLogLevelFilter(logLevelFilter);

        return this.loadPage(cursor, isPrettified, logTimezone);
    }

    exportLogs (): void {
        const logFileManager = this.#getLogFileManager();
        logFileManager.exportChunkAndScheduleNext(0);
    }

    startQuery (queryString: string, isRegex: boolean, isCaseSensitive: boolean): void {
        const logFileManager = this.#getLogFileManager();
        logFileManager.startQuery({queryString, isRegex, isCaseSensitive});
    }

    /**
     * Gets the current log file manager.
     *
     * @return The current log file manager.
     * @throws {Error} If the log file manager hasn't been initialized.
     */
    #getLogFileManager (): LogFileManager {
        if (null === this.logFileManager) {
            throw new Error("LogFileManager hasn't initialized");
        }

        return this.logFileManager;
    }
}

export {LogFileManagerProxy};
