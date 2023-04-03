import AbstractBuf from "./AbstractBuf";
import {javaIntegerDivide} from "./utils";

class FourByteVarBuf extends AbstractBuf {
    static NON_DICT_VAR_MAXIMUM_LENGTH_AS_STRING = 11;
    static ENCODED_FLOAT_DIGITS_BIT_MASK = (1 << 25) - 1;
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

    /**
     * Decodes the given encoded integer variable into a string. This is a
     * JavaScript equivalent of the decoding method from our
     * [core](https://github.com/y-scope/clp) in C++.
     */
    decodeAsIntegerType () {
        // Compute number of digits in a tight loop to minimize branching cost
        // later on
        let encodedInt = this._signedIntBackedEncoding;
        let numDigits = 0;
        do {
            ++numDigits;
            encodedInt = javaIntegerDivide(encodedInt, 10);
        } while (0 !== encodedInt);
        let endPos = numDigits;

        const bytes = new Uint8Array(this._decodedValueArrayBuffer);

        // Decode value into buffer efficiently by working with positive modulus
        // if possible
        encodedInt = this._signedIntBackedEncoding;
        let digitsBeginPos = 0;
        let i = numDigits - 1;
        if (encodedInt < 0) {
            // Add negative sign
            bytes[0] = FourByteVarBuf.HYPHEN_CHAR_CODE;
            ++endPos;
            ++digitsBeginPos;
            ++i;

            // Value is negative, so decode one digit and then convert it to a
            // positive value
            // NOTE: We can't convert the value to positive immediately since
            // the largest representable negative number is (at the time of
            // writing) one more than the largest representable positive number
            bytes[i--] = (FourByteVarBuf.ZERO_CHAR_CODE + ((encodedInt % 10) * -1));
            encodedInt = javaIntegerDivide(encodedInt, -10);
        }
        for (; i >= digitsBeginPos; --i) {
            bytes[i] = (FourByteVarBuf.ZERO_CHAR_CODE + encodedInt % 10);
            encodedInt = javaIntegerDivide(encodedInt, 10);
        }

        this._valueUint8Array = bytes.subarray(0, endPos);
    }

    /**
     * Decodes the given encoded float variable into a string. This is a
     * JavaScript equivalent of the decoding method from our
     * [core](https://github.com/y-scope/clp) in C++.
     */
    decodeAsFloatType () {
        const bytes = new Uint8Array(this._decodedValueArrayBuffer);

        let encodedFloat = this._signedIntBackedEncoding;
        const decimalPointPosFromRight = (encodedFloat & 0x07) + 1;
        encodedFloat >>= 3;
        const numDigits = (encodedFloat & 0x07) + 1;
        encodedFloat >>= 3;
        let digits = encodedFloat & FourByteVarBuf.ENCODED_FLOAT_DIGITS_BIT_MASK;
        encodedFloat >>= 25;
        const isNegative = encodedFloat & 0x1;

        // +1 for the decimal point
        const valueLength = isNegative + numDigits + 1;
        let numCharsToProcess = valueLength;

        // Decode until the decimal point or the non-zero digits are exhausted
        let pos = valueLength - 1;
        const decimalPointPos = valueLength - 1 - decimalPointPosFromRight;
        for (; pos > decimalPointPos && digits > 0; --pos) {
            bytes[pos] = FourByteVarBuf.ZERO_CHAR_CODE + (digits % 10);
            digits = javaIntegerDivide(digits, 10);
            --numCharsToProcess;
        }

        if (digits > 0) {
            // Skip decimal point since it's added at the end
            --pos;
            --numCharsToProcess;

            while (digits > 0) {
                bytes[pos--] = FourByteVarBuf.ZERO_CHAR_CODE + (digits % 10);
                digits = javaIntegerDivide(digits, 10);
                --numCharsToProcess;
            }
        }

        // Add remaining zeros
        bytes.fill(FourByteVarBuf.ZERO_CHAR_CODE, isNegative, numCharsToProcess);

        // Add decimal
        bytes[decimalPointPos] = FourByteVarBuf.PERIOD_CHAR_CODE;

        // Add sign
        if (isNegative) {
            bytes[0] = FourByteVarBuf.HYPHEN_CHAR_CODE;
            --numCharsToProcess;
        }

        this._valueUint8Array = bytes.subarray(0, valueLength);
    }
}

export default FourByteVarBuf;
