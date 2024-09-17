import {downloadBlob} from "../utils/file";


class LogExportManager {
    readonly #chunks: string[];

    readonly #numChunks: number;

    readonly #fileName: string;

    constructor (numChunks: number, fileName: string) {
        this.#chunks = [];
        this.#numChunks = numChunks;
        this.#fileName = fileName;
    }

    getChunkLength () {
        return this.#chunks.length;
    }

    appendChunkData (chunkData: string) {
        // TODO: check corner case: what if chunkData is empty?
        this.#chunks.push(chunkData);
        if (this.#chunks.length === this.#numChunks) {
            this.download();
        }
    }

    download () {
        const blob = new Blob(this.#chunks, {type: "text/plain"});
        const fileNameTimeStamped = `${this.#fileName}-exported-${new Date().toISOString()
            .replace(/[:.]/g, "-")}.log`;

        downloadBlob(blob, fileNameTimeStamped);
    }
}

export default LogExportManager;
