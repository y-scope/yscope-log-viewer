// TODO If we need to use the original timestamp pattern, uncomment this line
// import * as dayjs from "dayjs";
import LogtypeBuf from "./LogtypeBuf";
import PROTOCOL from "./PROTOCOL";

class IRTokenDecoder {
    constructor () {
        this._timestampPattern = null;
        this._zoneId = null;
        this._logtype = null;
        this._constantBeginOffset = 0;
    }

    setTimestampPattern (timestampPattern) {
        // Change timestamp pattern's syntax to match dayjs
        this._timestampPattern = timestampPattern.replaceAll("y", "Y").replaceAll("d", "D");
    }

    setZoneId (zoneId) {
        this._zoneId = zoneId;
    }

    loadLogtype (logtype) {
        this._logtype = logtype;
        this._constantBeginOffset = 0;
    }

    decodeTimestamp (outputResizableBuffer, timestamp) {
        if (timestamp >= 0n) {
            // NOTE: Since we don't specify a timezone, JavaScript will use the
            // user's local  timezone. This should be more convenient for the
            // user.
            const date = new Date(0);
            date.setUTCMilliseconds(Number(timestamp));
            outputResizableBuffer.pushString(date.toISOString());
            // TODO If we need to use the original timestamp pattern,
            //  uncomment this line
            // return dayjs(Number(timestamp)).format(this._timestampPattern);
        }
    }

    decodeUpToNextVar (outputResizableBuffer) {
        const logtypeBytes = this._logtype.getValueUint8Array();
        for (let i = this._constantBeginOffset; i < logtypeBytes.length;) {
            const b = logtypeBytes[i];
            if (LogtypeBuf.ESCAPE_CHARACTER === b) {
                // Add constant since last write
                outputResizableBuffer.push(logtypeBytes.subarray(this._constantBeginOffset, i));
                this._constantBeginOffset = i + 1;

                // Skip escape character and escaped character
                i += 2;
                continue;
            }

            if (LogtypeBuf.INTEGER_VARIABLE_DELIMITER !== b
                && LogtypeBuf.FLOAT_VARIABLE_DELIMITER !== b
                && LogtypeBuf.VARIABLE_ID_DELIMITER !== b) {
                ++i;
                continue;
            }

            // Add constant since last write
            outputResizableBuffer.push(logtypeBytes.subarray(this._constantBeginOffset, i));
            this._constantBeginOffset = ++i;

            return b;
        }

        throw new Error("No more variable delimiters in logtype.");
    }

    drainLogtype (outputResizableBuffer) {
        const logtypeBytes = this._logtype.getValueUint8Array();
        for (let i = this._constantBeginOffset; i < logtypeBytes.length; ++i) {
            const b = logtypeBytes[i];
            if (LogtypeBuf.ESCAPE_CHARACTER === b) {
                // Add constant since last write
                outputResizableBuffer.push(logtypeBytes.subarray(this._constantBeginOffset, i));

                // Skip escape character
                ++i;

                this._constantBeginOffset = i;
            }
        }
        if (this._constantBeginOffset < logtypeBytes.length) {
            // Add remainder of message
            outputResizableBuffer.push(
                logtypeBytes.subarray(this._constantBeginOffset, logtypeBytes.length)
            );
            this._constantBeginOffset = logtypeBytes.length;
        }
    }
}

export default IRTokenDecoder;
