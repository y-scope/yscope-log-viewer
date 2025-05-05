/* eslint-disable max-params */
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
        decoderOptions: DecoderOptions,
        fileSrc: FileSrcType,
        pageSize: number,
        onExportChunk: (logs: string) => void,
        onQueryResults: (queryProgress: number, queryResults: QueryResults) => void,
        cursor: CursorType,
        isPrettified: boolean
    ): Promise<{fileInfo: LogFileInfo; pageData: PageData}> {
        const logFileManager = await LogFileManager.create({
            decoderOptions: decoderOptions,
            fileSrc: fileSrc,
            onExportChunk: onExportChunk,
            onQueryResults: onQueryResults,
            pageSize: pageSize,
        });

        this.logFileManager = logFileManager;

        return {
            fileInfo: {
                fileName: logFileManager.fileName,
                numEvents: logFileManager.numEvents,
                onDiskFileSizeInBytes: logFileManager.onDiskFileSizeInBytes,
            },
            pageData: this.loadPage(cursor, isPrettified),
        };
    }

    loadPage (cursor: CursorType, isPrettified: boolean): PageData {
        const logFileManager = this.getLogFileManagerAndThrowErrorIfNull();
        return logFileManager.loadPage(cursor, isPrettified);
    }


    setFilter (
        cursor: CursorType,
        isPrettified: boolean,
        logLevelFilter: LogLevelFilter
    ): PageData {
        const logFileManager = this.getLogFileManagerAndThrowErrorIfNull();
        logFileManager.setLogLevelFilter(logLevelFilter);

        return this.loadPage(cursor, isPrettified);
    }

    exportLogs (): void {
        const logFileManager = this.getLogFileManagerAndThrowErrorIfNull();
        logFileManager.exportChunkAndScheduleNext(0);
    }

    startQuery (queryString: string, isRegex: boolean, isCaseSensitive: boolean): void {
        const logFileManager = this.getLogFileManagerAndThrowErrorIfNull();
        logFileManager.startQuery({queryString, isRegex, isCaseSensitive});
    }


    private getLogFileManagerAndThrowErrorIfNull (): LogFileManager {
        if (null === this.logFileManager) {
            throw new Error("LogFileManager hasn't initialized");
        }

        return this.logFileManager;
    }
}

export {LogFileManagerProxy};
