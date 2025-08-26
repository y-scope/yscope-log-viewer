import {ZSTDDecoder} from "zstddec/stream";

import PlainTextDecoder from "../PlainTextDecoder";


class ZstdDecoder extends PlainTextDecoder {
    static override async create (dataArray: Uint8Array) {
        const decompressor = new ZSTDDecoder();
        await decompressor.init();
        const decompressedDataArray = decompressor.decode(dataArray);
        return new PlainTextDecoder(decompressedDataArray);
    }
}

export default ZstdDecoder;
