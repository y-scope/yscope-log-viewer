/**
 * EOF error thrown by DataInputStream
 */
class DataInputStreamEOFError extends Error {
    /**
     * Constructor
     * @param {number} bufLen The length of the buffer when the error occurred
     * @param {number} requiredLen The required length of the buffer when the
     * error occurred
     * @param {string} message
     */
    constructor (bufLen, requiredLen, message= "") {
        let formattedMessage = `[bufLen=${bufLen}, requiredLen=${requiredLen}]`;
        if ("" !== message) {
            formattedMessage += ` ${message}`;
        }
        super(formattedMessage);
        this.name = "DataInputStreamEOFError";
        this.bufLen = bufLen;
        this.requiredLen = requiredLen;
    }
}

/**
 * Class to decode primitive types from a byte stream (similar to Java's
 * DataInputStream class)
 */
class DataInputStream {
    /**
     * Constructor
     * @param {ArrayBufferLike} arrayBuffer The array buffer that's backing this
     * class
     */
    constructor (arrayBuffer) {
        this._dataView = new DataView(arrayBuffer);
        this._byteIx = 0;
    }

    /**
     * Seeks to the given index
     * @param {number} idx
     */
    seek (idx) {
        if (idx > this._dataView.byteLength) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, idx);
        }
        this._byteIx = idx;
    }

    /**
     * @return {number} The position of the read head in the stream
     */
    getPos () {
        return this._byteIx;
    }

    /**
     * Reads the specified amount of data
     * @param {number} length
     * @return {Uint8Array} The data read
     */
    readFully (length) {
        const requiredLen = this._byteIx + length;
        if (this._dataView.byteLength < requiredLen) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, requiredLen);
        }

        const val = new Uint8Array(this._dataView.buffer, this._byteIx, length);
        this._byteIx += length;
        return val;
    }

    /**
     * Reads an unsigned byte
     * @return {number} The read byte
     */
    readUnsignedByte () {
        const requiredLen = this._byteIx + 1;
        if (this._dataView.byteLength < requiredLen) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, requiredLen);
        }
        return this._dataView.getUint8(this._byteIx++);
    }

    /**
     * Reads a signed byte
     * @return {number} The read byte
     */
    readSignedByte () {
        const requiredLen = this._byteIx + 1;
        if (this._dataView.byteLength < requiredLen) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, requiredLen);
        }
        return this._dataView.getInt8(this._byteIx++);
    }

    /**
     * Reads an unsigned short
     * @return {number} The read short
     */
    readUnsignedShort () {
        const requiredLen = this._byteIx + 2;
        if (this._dataView.byteLength < requiredLen) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, requiredLen);
        }
        const val = this._dataView.getUint16(this._byteIx, false);
        this._byteIx += 2;
        return val;
    }

    /**
     * Reads a signed short
     * @return {number} The read short
     */
    readSignedShort () {
        const requiredLen = this._byteIx + 2;
        if (this._dataView.byteLength < requiredLen) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, requiredLen);
        }
        const val = this._dataView.getInt16(this._byteIx, false);
        this._byteIx += 2;
        return val;
    }

    /**
     * Reads an int
     * @return {number} The read int
     */
    readInt () {
        const requiredLen = this._byteIx + 4;
        if (this._dataView.byteLength < requiredLen) {
            this._byteIx = this._dataView.byteLength;
            throw new DataInputStreamEOFError(this._dataView.byteLength, requiredLen);
        }
        const val = this._dataView.getInt32(this._byteIx, false);
        this._byteIx += 4;
        return val;
    }
}

export {DataInputStream, DataInputStreamEOFError};
