import FourByteVarBuf from "./FourByteVarBuf";

// This file tests the encoded-variable decoding methods by using values that
// have already been encoded (the alternative being to take a string, encode
// it, decode it, and compare the original and decoded strings). This is so we
// can avoid duplicating the encoding methods in another language besides our
// core in C++ (https://github.com/y-scope/clp). In fact, the eventual goal is
// to replace the JavaScript decoding methods with bindings to our C++ core.
// The tests and encoded values below are copied from our C++ core.

test("decodeAsIntegerType", () => {
    const textDecoder = new TextDecoder();
    const varBuf = new FourByteVarBuf();

    // Basic conversions
    varBuf.setFourByteVariableEncoding(0);
    varBuf.decodeAsIntegerType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("0");

    varBuf.setFourByteVariableEncoding(-1);
    varBuf.decodeAsIntegerType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("-1");

    varBuf.setFourByteVariableEncoding(1);
    varBuf.decodeAsIntegerType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("1");

    // Edges of representable range
    varBuf.setFourByteVariableEncoding(-(2 ** 31));
    varBuf.decodeAsIntegerType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("-2147483648");

    varBuf.setFourByteVariableEncoding((2 ** 31) - 1);
    varBuf.decodeAsIntegerType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("2147483647");
});

test("decodeAsFloatType", () => {
    const textDecoder = new TextDecoder();
    const varBuf = new FourByteVarBuf();

    // Basic conversions
    varBuf.setFourByteVariableEncoding(0x8);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("0.0");

    varBuf.setFourByteVariableEncoding(0x80000288);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("-1.0");

    varBuf.setFourByteVariableEncoding(0x288);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("1.0");

    varBuf.setFourByteVariableEncoding(0x40);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe(".1");

    // Edges of representable range
    varBuf.setFourByteVariableEncoding(0x80000019);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("-00.00");

    varBuf.setFourByteVariableEncoding(0xfffffff8);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("-3355443.1");

    varBuf.setFourByteVariableEncoding(0x7ffffff8);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("3355443.1");

    varBuf.setFourByteVariableEncoding(0xffffffff);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe("-.33554431");

    varBuf.setFourByteVariableEncoding(0x7fffffff);
    varBuf.decodeAsFloatType();
    expect(textDecoder.decode(varBuf.getValueUint8Array())).toBe(".33554431");
});
