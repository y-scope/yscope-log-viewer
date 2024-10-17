import {downloadBlob} from "../utils/file";


const EXPORT_LOG_PROGRESS_VALUE_MIN = 0;
const EXPORT_LOG_PROGRESS_VALUE_MAX = 1;

/**
 * Manager for exporting logs as a file.
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
        this.#exportedFileName = `exported-${new Date().toISOString()
            .replace(/[:.]/g, "-")}-${fileName}.log`;
    }

    /**
     * Appends the provided chunk of logs into an internal buffer. If the number of chunks reaches
     * the specified limit, triggers a download.
     *
     * @param chunk
     * @return The current download progress as a float between 0 and 1.
     */
    appendChunk (chunk: string): number {
        if (0 === this.#numChunks) {
            this.#download();

            return EXPORT_LOG_PROGRESS_VALUE_MAX;
        }
        this.#chunks.push(chunk);
        if (this.#chunks.length === this.#numChunks) {
            this.#download();
            this.#chunks.length = 0;

            return EXPORT_LOG_PROGRESS_VALUE_MAX;
        }

        return this.#chunks.length / this.#numChunks;
    }

    /**
     * Triggers a download of the accumulated chunks.
     */
    #download () {
        const blob = new Blob(this.#chunks, {type: "text/plain"});
        downloadBlob(blob, this.#exportedFileName);
    }
}

export default LogExportManager;
export {
    EXPORT_LOG_PROGRESS_VALUE_MAX,
    EXPORT_LOG_PROGRESS_VALUE_MIN,
};
