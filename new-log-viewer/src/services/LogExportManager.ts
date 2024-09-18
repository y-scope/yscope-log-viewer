import {downloadBlob} from "../utils/file";


const EXPORT_LOG_PROGRESS_INITIALIZATION = 0;
const EXPORT_LOG_PROGRESS_COMPLETE = 1;

/**
 * Manager for exporting logs to a file.
 */
class LogExportManager {
    /**
     * Internal buffer which stores decoded chunks of log data.
     */
    readonly #chunks: string[] = [];

    /**
     * Total number of chunks to export.
     */
    readonly #numChunks: number;

    /**
     * Name of the file to export to.
     */
    readonly #exportedFileName: string;

    constructor (numChunks: number, fileName: string) {
        this.#numChunks = numChunks;
        this.#exportedFileName = `exported-${fileName}-${new Date().toISOString()
            .replace(/[:.]/g, "-")}.log`;
    }

    /**
     * Append the provided chunk of logs into an internal buffer.
     * If the number of chunks reaches the specified limit, trigger a download.
     *
     * @param chunkData The chunk of log string to append.
     * @return The current download progress as a decimal between
     * 0 (initialization) and 1 (download complete).
     */
    appendChunkData (chunkData: string): number {
        if (0 === this.#numChunks) {
            this.#download();

            return EXPORT_LOG_PROGRESS_COMPLETE;
        }
        this.#chunks.push(chunkData);
        if (this.#chunks.length === this.#numChunks) {
            this.#download();
            this.#chunks.length = 0;

            return EXPORT_LOG_PROGRESS_COMPLETE;
        }

        return this.#chunks.length / this.#numChunks;
    }

    /**
     * Trigger a download of the accumulated log data chunks.
     */
    #download () {
        const blob = new Blob(this.#chunks, {type: "text/plain"});
        downloadBlob(blob, this.#exportedFileName);
    }
}

export default LogExportManager;
export {
    EXPORT_LOG_PROGRESS_COMPLETE,
    EXPORT_LOG_PROGRESS_INITIALIZATION,
};
