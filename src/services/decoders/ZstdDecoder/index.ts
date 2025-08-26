import {ZSTDDecoder} from "zstddec";

import PlainTextDecoder from "../PlainTextDecoder";


class ZstdDecoder extends PlainTextDecoder {
    static override async create (dataArray: Uint8Array) {
        const decoder = new ZSTDDecoder();
        await decoder.init();
        const decompressedDataArray = decoder.decode(dataArray);
        return new PlainTextDecoder(decompressedDataArray);
    }
}

export default ZstdDecoder;
