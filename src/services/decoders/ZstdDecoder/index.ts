import {
    decompress,
    init,
} from "@bokuweb/zstd-wasm";

import PlainTextDecoder from "../PlainTextDecoder";


class ZstdDecoder extends PlainTextDecoder {
    private constructor (logArray: Uint8Array) {
        super(logArray);
    }

    static override async create (dataArray: Uint8Array) {
        await init();
        const logArrayBuffer = decompress(dataArray);
        return new ZstdDecoder(logArrayBuffer);
    }
}

export default ZstdDecoder;
