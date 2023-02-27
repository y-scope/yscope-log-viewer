import AbstractBuf from "./AbstractBuf";

class LogtypeBuf extends AbstractBuf {
    static ESCAPE_CHARACTER = "\\".charCodeAt(0);
    static INTEGER_VARIABLE_DELIMITER = 17;
    static VARIABLE_ID_DELIMITER = 18;
    static FLOAT_VARIABLE_DELIMITER = 19;
}

export default LogtypeBuf;
