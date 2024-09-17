import {downloadBlob} from "../utils/file";


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
        this.#exportedFileName = fileName;
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

            return 1;
        }
        this.#chunks.push(chunkData);
        if (this.#chunks.length === this.#numChunks) {
            this.#download();
            this.#chunks.length = 0;
        }

        return this.#chunks.length / this.#numChunks;
    }

    /**
     * Trigger a download of the accumulated log data chunks.
     */
    #download () {
        const blob = new Blob(this.#chunks, {type: "text/plain"});
        const fileNameTimeStamped = `${this.#exportedFileName}-exported-${new Date().toISOString()
            .replace(/[:.]/g, "-")}.log`;

        downloadBlob(blob, fileNameTimeStamped);
    }
}

export default LogExportManager;
