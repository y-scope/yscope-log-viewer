/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    decompress,
    init,
} from "@bokuweb/zstd-wasm";

import {DecoderOptions} from "../../../typings/decoders";
import PlainTextDecoder from "../PlainTextDecoder";


class ZstdDecoder extends PlainTextDecoder {
    private constructor (logArray: Uint8Array) {
        super(logArray);
    }

    static override async create (dataArray: Uint8Array, _decoderOptions: DecoderOptions) {
        await init();
        const logArrayBuffer = decompress(dataArray);
        return new ZstdDecoder(logArrayBuffer);
    }
}

export default ZstdDecoder;
