import downloadDecompressedLogs from "../utils/downloadDecompressedLogs";


class LogExportManager {
    private blob: Blob;

    private numChunks: number;

    constructor (numChunks?: number) {
        this.blob = new Blob();
        this.numChunks = numChunks ?? 0;
    }

    getBlob (): Blob {
        return this.blob;
    }

    appendChunkData (chunkData: string) {
        this.blob = new Blob([this.blob,
            chunkData], {type: "text/plain"});
    }

    getNumChunks (): number {
        return this.numChunks;
    }

    setNumChunks (numChunks: number) {
        this.numChunks = numChunks;
    }

    download (fileName: string) {
        // FIXME: eslint complains about this format
        downloadDecompressedLogs({blob: this.blob, fileName});
    }

    reset (numChunks?: number) {
        this.blob = new Blob();
        this.numChunks = numChunks ?? 0;
    }
}

export default LogExportManager;
