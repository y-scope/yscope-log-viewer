/* eslint-disable max-classes-per-file */

/**
 * Byte lengths for primitive types.
 */
const SHORT_BYTES = 2;
const INT_BYTES = 4;
const LONG_BYTES = 8;

/**
 * EOF error thrown by DataInputStream.
 */
class DataInputStreamEOFError extends Error {
    bufLen: number;

    requiredLen: number;

    /**
     * @param bufLen The length of the buffer.
     * @param requiredLen The required length of the buffer (i.e. what was needed for
     * a successful read).
     * @param message
     */
    constructor (bufLen: number, requiredLen: number, message: string = "") {
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
 * Decodes primitive types from a byte stream (similar to Java's DataInputStream class).
 */
class DataInputStream {
    #dataView: DataView;

    #isLittleEndian: boolean;

    #byteIdx: number;

    /**
     * @param arrayBuffer Underlying array buffer.
     * @param isLittleEndian Byte endianness.
     */
    constructor (arrayBuffer: ArrayBufferLike, isLittleEndian: boolean = false) {
        this.#dataView = new DataView(arrayBuffer);
        this.#isLittleEndian = isLittleEndian;
        this.#byteIdx = 0;
    }

    /**
     * Seeks to the given index.
     *
     * @param idx
     * @throws {Error} If encounter EOF while seeking.
     */
    seek (idx: number): void {
        if (idx > this.#dataView.byteLength) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, idx);
        }
        this.#byteIdx = idx;
    }

    /**
     * Returns the current read offset in the stream.
     *
     * @return
     */
    getPos (): number {
        return this.#byteIdx;
    }

    /**
     * Reads the specified amount of data.
     *
     * @param length
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readFully (length: number): Uint8Array {
        const requiredLen: number = this.#byteIdx + length;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }

        const val: Uint8Array = new Uint8Array(this.#dataView.buffer, this.#byteIdx, length);
        this.#byteIdx += length;

        return val;
    }

    /**
     * Reads an unsigned byte.
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readUnsignedByte (): number {
        const requiredLen: number = this.#byteIdx + 1;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }

        return this.#dataView.getUint8(this.#byteIdx++);
    }

    /**
     * Reads a signed byte
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readSignedByte (): number {
        const requiredLen: number = this.#byteIdx + 1;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }

        return this.#dataView.getInt8(this.#byteIdx++);
    }

    /**
     * Reads an unsigned short
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readUnsignedShort (): number {
        const requiredLen: number = this.#byteIdx + SHORT_BYTES;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }
        const val: number = this.#dataView.getUint16(this.#byteIdx, this.#isLittleEndian);
        this.#byteIdx += SHORT_BYTES;

        return val;
    }

    /**
     * Reads a signed short
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readSignedShort (): number {
        const requiredLen: number = this.#byteIdx + SHORT_BYTES;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }
        const val: number = this.#dataView.getInt16(this.#byteIdx, this.#isLittleEndian);
        this.#byteIdx += SHORT_BYTES;

        return val;
    }

    /**
     * Reads an int.
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readInt (): number {
        const requiredLen: number = this.#byteIdx + INT_BYTES;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }
        const val: number = this.#dataView.getInt32(this.#byteIdx, this.#isLittleEndian);
        this.#byteIdx += INT_BYTES;

        return val;
    }

    /**
     * Reads a signed long int (64 bit).
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readSignedLong (): bigint {
        const requiredLen = this.#byteIdx + LONG_BYTES;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }
        const val: bigint = this.#dataView.getBigInt64(this.#byteIdx, this.#isLittleEndian);
        this.#byteIdx += LONG_BYTES;

        return val;
    }

    /**
     * Reads an unsigned long int (64 bit).
     *
     * @return
     * @throws {Error} If encounter EOF while reading.
     */
    readUnsignedLong (): bigint {
        const requiredLen = this.#byteIdx + LONG_BYTES;
        if (this.#dataView.byteLength < requiredLen) {
            this.#byteIdx = this.#dataView.byteLength;
            throw new DataInputStreamEOFError(this.#dataView.byteLength, requiredLen);
        }
        const val: bigint = this.#dataView.getBigUint64(this.#byteIdx, this.#isLittleEndian);
        this.#byteIdx += LONG_BYTES;

        return val;
    }
}

export {
    DataInputStream,
    DataInputStreamEOFError,
};
