import AbstractBuf from "./AbstractBuf";
import {javaIntegerDivide} from "./utils";

class FourByteVarBuf extends AbstractBuf {
    static NON_DICT_VAR_MAXIMUM_LENGTH_AS_STRING = 11;
    static INTEGER_MAX_VALUE = (2 ** 32) - 1;
    static HYPHEN_CHAR_CODE = "-".charCodeAt(0);
    static PERIOD_CHAR_CODE = ".".charCodeAt(0);
    static ZERO_CHAR_CODE = "0".charCodeAt(0);

    constructor () {
        super();
        this._decodedValueArrayBuffer =
            new ArrayBuffer(FourByteVarBuf.NON_DICT_VAR_MAXIMUM_LENGTH_AS_STRING);
        this._signedIntBackedEncoding = 0;
    }

    setFourByteVariableEncoding (signedIntBackedEncoding) {
        this._signedIntBackedEncoding = signedIntBackedEncoding;
    }

    decodeAsIntegerType () {
        // Compute number of digits in a tight loop to minimize branching cost
        // later on
        let val = this._signedIntBackedEncoding;
        let numDigits = 0;
        do {
            ++numDigits;
            val = javaIntegerDivide(val, 10);
        } while (0 !== val);
        let endOffset = numDigits;

        const bytes = new Uint8Array(this._decodedValueArrayBuffer);

        // Decode value into buffer efficiently by working with positive modulus
        // if possible
        val = this._signedIntBackedEncoding;
        let digitsBeginPos = 0;
        let i = numDigits - 1;
        if (val < 0) {
            // Add negative sign
            bytes[0] = FourByteVarBuf.HYPHEN_CHAR_CODE;
            ++endOffset;
            ++digitsBeginPos;
            ++i;

            // Value is negative, so decode one digit and then convert it to a
            // positive value
            // NOTE: We can't convert the value to positive immediately since
            // the largest representable negative number is (at the time of
            // writing) one more than the largest representable positive number
            bytes[i--] = (FourByteVarBuf.ZERO_CHAR_CODE + ((val % 10) * -1));
            val = javaIntegerDivide(val, -10);
        }
        for (; i >= digitsBeginPos; --i) {
            bytes[i] = (FourByteVarBuf.ZERO_CHAR_CODE + val % 10);
            val = javaIntegerDivide(val, 10);
        }

        this._valueUint8Array = bytes.subarray(0, endOffset);
    }

    decodeAsFloatType () {
        const bytes = new Uint8Array(this._decodedValueArrayBuffer);

        let endOffset = 0;
        if (this._signedIntBackedEncoding < 0) {
            bytes[endOffset++] = FourByteVarBuf.HYPHEN_CHAR_CODE;
        }

        // Bits 3-5 are # of decimal digits minus 1
        const numDigits = ((this._signedIntBackedEncoding & 0x038) >> 3) + 1;

        // + 1 to include the decimal point
        let numCharsRemaining = numDigits + 1;
        endOffset += numCharsRemaining;

        // Bits 0-2 are the offset of the decimal from the right minus 1
        let decimalPointOffset = (this._signedIntBackedEncoding & 0x07) + 1;
        // Make decimalPointOffset relative to the left
        decimalPointOffset = endOffset - 1 - decimalPointOffset;

        // Decode until the decimal point or the non-zero digits are exhausted
        let digits = (this._signedIntBackedEncoding & FourByteVarBuf.INTEGER_MAX_VALUE) >> 6;
        let offset = endOffset - 1;
        for (; offset > decimalPointOffset; --offset) {
            bytes[offset] = FourByteVarBuf.ZERO_CHAR_CODE + (digits % 10);
            digits = javaIntegerDivide(digits, 10);
            --numCharsRemaining;
        }

        if (digits > 0) {
            // Skip decimal point since it's added at the end
            --offset;
            --numCharsRemaining;

            while (digits > 0) {
                bytes[offset--] = FourByteVarBuf.ZERO_CHAR_CODE + (digits % 10);
                digits = javaIntegerDivide(digits, 10);
                --numCharsRemaining;
            }
        }

        // Add remaining zeros
        bytes.fill(FourByteVarBuf.ZERO_CHAR_CODE, offset + 1 - numCharsRemaining, offset + 1);

        // Add decimal
        bytes[decimalPointOffset] = FourByteVarBuf.PERIOD_CHAR_CODE;

        this._valueUint8Array = bytes.subarray(0, endOffset);
    }
}

export default FourByteVarBuf;
