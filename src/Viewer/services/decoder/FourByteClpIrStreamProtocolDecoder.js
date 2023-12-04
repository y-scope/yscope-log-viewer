import PROTOCOL from "./PROTOCOL";

class FourByteClpIrStreamProtocolDecoder {
    constructor (dataInputStream, tokenDecoder) {
        this._timestamp = null;
        this._textDecoder = new TextDecoder();
        this._metadataTimestamp = null;

        this.readAndValidateEncodingType(dataInputStream);
        this.initializeStream(dataInputStream, tokenDecoder);
    }

    _setTimestamp (timestamp) {
        this._timestamp = timestamp;
    }

    _reset () {
        this._timestamp = this._metadataTimestamp;
    }

    readTag (dataInputStream) {
        return dataInputStream.readUnsignedByte();
    }

    readLogtype (dataInputStream, tag, logtype) {
        let length;
        switch (tag) {
            case PROTOCOL.PAYLOAD.LOGTYPE_STR_LEN_UNSIGNED_BYTE:
                length = dataInputStream.readUnsignedByte();
                break;
            case PROTOCOL.PAYLOAD.LOGTYPE_STR_LEN_UNSIGNED_SHORT:
                length = dataInputStream.readUnsignedShort();
                break;
            case PROTOCOL.PAYLOAD.LOGTYPE_STR_LEN_SIGNED_INT:
                length = dataInputStream.readInt();
                break;
            default:
                throw new Error("Logtype missing from stream.");
        }
        logtype.loadFrom(dataInputStream, length);
    }

    validateProtocolVersion (version) {
        if ("v0.0.0" === version) {
            return;
        }
        const versionRegex = new RegExp(PROTOCOL.METADATA.VERSION_REGEX);
        if (false === versionRegex.test(version)) {
            throw new Error(`Invalid Protocol Version: ${version}`);
        }
        if (PROTOCOL.METADATA.VERSION_VALUE < versionRegex) {
            throw new Error(`Input protocol version is too new: ${version}`);
        }
        const currentBuildProtocolMajorVersion = PROTOCOL.METADATA.VERSION_VALUE.split(".")[0];
        const inputProtocolMajorVersion = version.split(".")[0];
        if (currentBuildProtocolMajorVersion > inputProtocolMajorVersion) {
            throw new Error(`Input protocol version is too old: ${version}`);
        }
    }

    initializeStream (dataInputStream, tokenDecoder) {
        const metadata = this.readMetadata(dataInputStream);
        const version = metadata[PROTOCOL.METADATA.VERSION_KEY];
        this.validateProtocolVersion(version);
        this._timestamp = BigInt(metadata[PROTOCOL.METADATA.REFERENCE_TIMESTAMP_KEY]);
        tokenDecoder.setZoneId(metadata[PROTOCOL.METADATA.TZ_ID_KEY]);
        tokenDecoder.setTimestampPattern(metadata[PROTOCOL.METADATA.TIMESTAMP_PATTERN_KEY]);
        this._metadataTimestamp = this._timestamp;
        return metadata;
    }

    readMetadata (dataInputStream) {
        const tag = this.readTag(dataInputStream);
        if (PROTOCOL.METADATA.JSON_ENCODING !== tag) {
            throw new Error(`Unsupported metadata encoding tag: ${tag}`);
        }
        return this.readSerializedMetadata(dataInputStream);
    }

    readSerializedMetadata (dataInputStream) {
        const tag = this.readTag(dataInputStream);
        let serializedMetadataLen;
        switch (tag) {
            case PROTOCOL.METADATA.METADATA_LEN_UBYTE:
                serializedMetadataLen = dataInputStream.readUnsignedByte();
                break;
            case PROTOCOL.METADATA.METADATA_LEN_USHORT:
                serializedMetadataLen = dataInputStream.readUnsignedShort();
                break;
            case PROTOCOL.METADATA.METADATA_LEN_INT:
                serializedMetadataLen = dataInputStream.readInt();
                break;
            default:
                throw new Error("Unsupported encoding for metadata length.");
        }
        const serializedMetadata = dataInputStream.readFully(serializedMetadataLen);
        return JSON.parse(this._textDecoder.decode(serializedMetadata));
    }

    tryReadingVar (dataInputStream, tag, varBuf) {
        if (PROTOCOL.PAYLOAD.isNotVar(tag)) {
            return false;
        }

        switch (tag) {
            case PROTOCOL.PAYLOAD.VAR_FOUR_BYTE_ENCODING:
                varBuf.setFourByteVariableEncoding(dataInputStream.readInt());
                break;
            case PROTOCOL.PAYLOAD.VAR_STR_LEN_UNSIGNED_BYTE:
                varBuf.loadFrom(dataInputStream, dataInputStream.readUnsignedByte());
                break;
            case PROTOCOL.PAYLOAD.VAR_STR_LEN_UNSIGNED_SHORT:
                varBuf.loadFrom(dataInputStream, dataInputStream.readUnsignedShort());
                break;
            case PROTOCOL.PAYLOAD.VAR_STR_LEN_SIGNED_INT:
                varBuf.loadFrom(dataInputStream, dataInputStream.readInt());
                break;
            default:
                throw new Error("Unsupported variable tag present in stream.");
        }

        return true;
    }

    readTimestamp (dataInputStream) {
        let timestampDelta;
        switch (this.readTag(dataInputStream)) {
            case PROTOCOL.PAYLOAD.TIMESTAMP_DELTA_SIGNED_BYTE:
                timestampDelta = dataInputStream.readSignedByte();
                break;
            case PROTOCOL.PAYLOAD.TIMESTAMP_DELTA_SIGNED_SHORT:
                timestampDelta = dataInputStream.readSignedShort();
                break;
            case PROTOCOL.PAYLOAD.TIMESTAMP_DELTA_SIGNED_INT:
                timestampDelta = dataInputStream.readInt();
                break;
            case PROTOCOL.PAYLOAD.TIMESTAMP_DELTA_SIGNED_LONG:
                timestampDelta = dataInputStream.readSignedLong();
                break;
            case PROTOCOL.PAYLOAD.TIMESTAMP_NULL:
                return PROTOCOL.PAYLOAD.TIMESTAMP_NULL_VAL;
            default:
                throw new Error("Timestamp missing from stream.");
        }
        this._timestamp += BigInt(timestampDelta);

        return this._timestamp;
    }

    readAndValidateEncodingType (dataInputStream) {
        for (let i = 0; i < PROTOCOL.FOUR_BYTE_ENCODING_MAGIC_NUMBER.length; ++i) {
            if (PROTOCOL.FOUR_BYTE_ENCODING_MAGIC_NUMBER[i] !== dataInputStream.readUnsignedByte())
            {
                throw new Error("IR stream doesn't use the four-byte encoding.");
            }
        }
    }
}

export default FourByteClpIrStreamProtocolDecoder;
