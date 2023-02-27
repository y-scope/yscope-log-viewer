class AbstractBuf {
    constructor () {
        this._valueUint8Array = null;
    }

    loadFrom (dataInputStream, length) {
        this._valueUint8Array = dataInputStream.readFully(length);
    }

    getValueUint8Array() {
        return this._valueUint8Array;
    }
}

export default AbstractBuf;
