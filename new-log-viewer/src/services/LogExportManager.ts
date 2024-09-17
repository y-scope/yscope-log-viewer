import {downloadBlob} from "../utils/file";


/**
 * Manager for exporting logs to a file.
 */
class LogExportManager {
    /**
     * Array to store chunks of log data.
     *
     * @type {string[]}
     * @private
     */
    readonly #chunks: string[] = [];

    /**
     * Total number of chunks to export.
     *
     * @type {number}
     * @private
     */
    readonly #numChunks: number;

    /**
     * Name of the file to export to.
     *
     * @type {string}
     * @private
     */
    readonly #fileName: string;

    constructor (numChunks: number, fileName: string) {
        this.#numChunks = numChunks;
        this.#fileName = fileName;
    }

    /**
     * Append a chunk of log string.
     * If the number of chunks reaches the specified limit, trigger a download.
     *
     * @param chunkData The chunk of log string to append.
     * @return The current download progress.
     */
    appendChunkData (chunkData: string) {
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
     *
     * @private
     */
    #download () {
        const blob = new Blob(this.#chunks, {type: "text/plain"});
        const fileNameTimeStamped = `${this.#fileName}-exported-${new Date().toISOString()
            .replace(/[:.]/g, "-")}.log`;

        downloadBlob(blob, fileNameTimeStamped);
    }
}

export default LogExportManager;
