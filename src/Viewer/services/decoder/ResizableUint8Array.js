class ResizableUint8Array {
    constructor (initialCapacity) {
        this._textEncoder = new TextEncoder();
        this._uint8Array = new Uint8Array(initialCapacity);
        this._length = 0;
    }

    _growIfNecessary (requiredCapacity) {
        if (requiredCapacity > this._uint8Array.length) {
            // Grow array to max(length + 4KB, requiredCapacity)
            const currentUint8Array = this._uint8Array;
            this._uint8Array =
                new Uint8Array(Math.max(currentUint8Array.length + 4096, requiredCapacity));

            this._uint8Array.set(currentUint8Array);
        }
    }

    push (uint8Array) {
        this._growIfNecessary(this._length + uint8Array.length);

        this._uint8Array.set(uint8Array, this._length);
        this._length += uint8Array.length;
    }

    pushString (string) {
        // At the time of writing, encodeInto was only introduced a year ago in
        // some browsers, so we need to test if the browser supports it first.
        if (this._textEncoder.encodeInto) {
            const UTF_16_MAX_BYTES_PER_CHAR = 4;
            this._growIfNecessary(this._length + string.length * UTF_16_MAX_BYTES_PER_CHAR);

            const encodeIntoResult =
                this._textEncoder.encodeInto(string, this._uint8Array.subarray(this._length));
            this._length += encodeIntoResult.written;
        } else {
            this.push(this._textEncoder.encode(string));
        }
    }

    resize (length) {
        this._length = length;
    }

    getUint8Array (begin, end) {
        switch (arguments.length) {
            case 0:
                begin = 0;
                // Fall through
            case 1:
                end = this._length;
                break;
            case 2:
                break;
            default:
                throw new Error(
                    `Too many arguments: Expected between [0, 2] but got ${arguments.length}.`);
        }
        return this._uint8Array.subarray(begin, end);
    }

    getLength () {
        return this._length;
    }
}

export default ResizableUint8Array;
