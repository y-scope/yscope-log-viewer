/* eslint max-lines: ["error", 400] */
const NUM_INDENTATION_SPACES: number = 4;

const WHITESPACE_CHARACTERS: string[] = [" ",
    "\t",
    "\n"];

interface Region {
    type: string;
    level: number;
}

interface PrettifyState {
    braceLevelCounter: number;
    bracketLevelCounter: number;
    copyBeginOffset: number;
    indentLevel: number;
    isEscaped: boolean;
    isPrettifiedStringDifferent: boolean;
    lineBreakPending: boolean;
    parenLevelCounter: number;
    regionStack: Region[];
    result: string;
}

/**
 * Get the whitespace (newline and indentation) for starting a new line.
 *
 * @param indentLevel The level of indentation for the line.
 * @return the whitespace (newline and indentation) for starting a new line.
 * @private
 */
const getStartingWhitespaceOfNewLine = (indentLevel: number): string => {
    return `\n${" ".repeat(indentLevel * NUM_INDENTATION_SPACES)}`;
};

/**
 * Find the index of the next char in the provided string which is not one of WHITESPACE_CHARACTERS.
 *
 * @param str
 * @param index It will find from the index + 1.
 * @return The position of the next non-white-space char.
 * @private
 */
const findNextNonWhitespaceChar = (str: string, index: number): number => {
    for (let i = index + 1; i < str.length; ++i) {
        if (!WHITESPACE_CHARACTERS.includes(str[i] ?? " ")) {
            return i;
        }
    }

    return str.length;
};

/**
 * Get the index of the next unescaped closing '"' or "'".
 *
 * @param uglyString
 * @param index
 * @return The index of the next unescaped closing '"' or "'".
 * @private
 */
const handleQuote = (
    uglyString: string,
    index: number,
): number => {
    const quote = uglyString[index];
    if ('"' !== quote && "'" !== quote) {
        return index;
    }

    for (let i = index + 1; i < uglyString.length; ++i) {
        if (quote === uglyString[i] && "\\" !== uglyString[i - 1]) {
            return i + 1;
        }
    }

    return uglyString.length;
};

/**
 * Handles the opening of a square bracket "[" during prettification.
 *
 * Adds a newline if a line break is pending and tracks the indent level for correct spacing of
 * array entries.
 *
 * @param uglyString
 * @param index
 * @param state The current state of the prettifier.
 * @return The index of the next non-white-space char after "[".
 * @private
 */
const handleOpeningBracket = (
    uglyString: string,
    index: number,
    state: PrettifyState
): number => {
    const openingBracket = uglyString[index];
    if ("[" !== openingBracket) {
        return index;
    }

    if (state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.lineBreakPending = false;
        state.isPrettifiedStringDifferent = true;
    }
    state.regionStack.push({type: "[", level: state.bracketLevelCounter + 1});
    state.bracketLevelCounter++;
    state.result += uglyString.substring(state.copyBeginOffset, index + 1);
    state.copyBeginOffset = findNextNonWhitespaceChar(uglyString, index);

    return state.copyBeginOffset;
};

/**
 * Handles the closing of a square bracket "[" during prettification.
 *
 * @param uglyString
 * @param index
 * @param state The current state of the prettifier.
 * @return The index of the next char of "]".
 * @private
 */
const handleClosingBracket = (
    uglyString: string,
    index: number,
    state: PrettifyState
): number => {
    const closingBracket = uglyString[index];
    if ("]" !== closingBracket) {
        return index;
    }

    if ("[" === (state.regionStack[state.regionStack.length - 1] ?? {}).type) {
        state.regionStack.pop();
    }

    return index + 1;
};

/**
 * Handles a comma "," during prettification.
 *
 * Determines whether to insert a newline or a space after the comma based on the current nesting
 * context. If the character following the comma is a whitespace character, it is skipped.
 *
 * @param uglyString The original unformatted string.
 * @param index The index of the current char.
 * @param state The current state of the prettifier.
 * @return An updated index (`newIndex`) for the main loop.
 * @private
 */
const handleComma = (
    uglyString: string,
    index: number,
    state: PrettifyState
): number => {
    const comma = uglyString[index];
    if ("," !== comma) {
        return index;
    }

    if (0 === state.bracketLevelCounter && 0 === state.indentLevel) {
        return index + 1;
    }

    if (state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.lineBreakPending = false;
    }

    const nextNonWhiteSpaceCharPos = findNextNonWhitespaceChar(uglyString, index);
    state.result += uglyString.substring(state.copyBeginOffset, index + 1);
    state.copyBeginOffset = nextNonWhiteSpaceCharPos;

    const isDanglingComma = ["}",
        ")",
        "]"].includes(uglyString[nextNonWhiteSpaceCharPos] ?? "");
    const shouldBreak = !isDanglingComma && (
        0 === state.bracketLevelCounter ||
        ["{",
            "("].includes((state.regionStack[state.regionStack.length - 1] ?? {}).type ?? ""));

    if (shouldBreak) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
    } else if (!isDanglingComma) {
        state.result += " ";
    }
    state.isPrettifiedStringDifferent = true;

    return state.copyBeginOffset;
};

/**
 * Handles the opening of a curly brace "{" or parenthesis "(".
 *
 * Adds a newline before the character and increases indentation level.
 *
 * @param uglyString The original unformatted string.
 * @param index The index of the current char.
 * @param isBraceOrParen True if it is for "{"; false if it is for "(".
 * @param state The current state of the prettifier.
 * @return The next non-white-space char after "{" or "(".
 * @private
 */
const handleOpeningBraceOrParen = (
    uglyString: string,
    index: number,
    isBraceOrParen: boolean,
    state: PrettifyState
): number => {
    const openingBraceOrParen = uglyString[index];
    if ((isBraceOrParen ?
        "{" :
        "(") !== openingBraceOrParen) {
        return index;
    }
    if (state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.isPrettifiedStringDifferent = true;
    }

    state.result += uglyString.substring(state.copyBeginOffset, index + 1);
    state.copyBeginOffset = findNextNonWhitespaceChar(uglyString, index);

    state.regionStack.push(
        isBraceOrParen ?
            {type: "{", level: state.braceLevelCounter + 1} :
            {type: "(", level: state.braceLevelCounter + 1}
    );

    state.indentLevel++;
    state.lineBreakPending = true;

    return state.copyBeginOffset;
};

/**
 * Handles the closing of a curly brace "}" or parenthesis ")".
 *
 * Decreases the indentation level and adds a newline before the closing character, unless the
 * block was empty (line break was pending).
 *
 * @param uglyString The original unformatted string.
 * @param index The index of the current char.
 * @param isBraceOrParen True if it is for "}"; false if it is for ")".
 * @param state The current state of the prettifier.
 * @return The index of the next char of "}" or ")".
 * @private
 */
const handleClosingBraceOrParen = (
    uglyString: string,
    index: number,
    isBraceOrParen: boolean,
    state: PrettifyState
): number => {
    const closingBraceOrParen = uglyString[index];
    if ((isBraceOrParen ?
        "}" :
        ")") !== closingBraceOrParen) {
        return index;
    }

    state.result += uglyString.substring(state.copyBeginOffset, index);
    state.copyBeginOffset = index + 1;

    state.indentLevel = Math.max(0, state.indentLevel - 1);

    if (!state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.isPrettifiedStringDifferent = true;
    }

    state.lineBreakPending = false;

    if ((state.regionStack[state.regionStack.length - 1] ?? {}).type === (isBraceOrParen ?
        "{" :
        "(")) {
        state.regionStack.pop();
    }

    state.result += closingBraceOrParen;

    return index + 1;
};

/**
 * Prettifies the given string according to these rules:
 * <ul>
 *  <li>Regions enclosed by "{}"/"()" are indented and every parameter/kv-pair is printed on a new
 *  line.</li>
 *  <li>Where possible, if the region contains none or a single parameter/kv-pair, we don't print
 *  it on a separate line.</li>
 *  <li>For regions enclosed by "[]", every entry is space-separated.</li>
 * </ul>
 *
 * We implement the rules above as follows:
 * - After seeing '\', we ignore the next character.
 * - After seeing '"', we only monitor for an unescaped '"' and skip the content within the region.
 * - After seeing "'", we only monitor for an unescaped "'" and skip the content within the region.
 * - After seeing "{"/"(", we *typically* add a newline and push it into a stack.
 *  - The one exception to this is if there is only one parameter/kv-pair in the region enclosed by
 *  "{}"/"()". However, this is hard to determine without reading ahead until the end of the region.
 *  So a reasonable heuristic is if, after the initial opening "{"/"(", we encounter a ',' or "{" or
 *  "(" or "[", we will simply add a newline.
 * - After seeing "}"/")", we pop the curly or paren stack.
 * - After seeing ',':
 *  - (1) If we are in an object with a region enclosed by "{" or "(", we add a newline.
 *  - (2) Otherwise, if we are in an object enclosed by "[]", we add a ' '.
 *  - In both (1) & (2), we skip the next character util it is not a character in
 *  _WHITESPACE_CHARACTERS.
 * - To handle the difference in handling ',' when we're in a region enclosed by "{"/"(" versus "[":
 *  - If we are in a "{"/"("-region nested within a "["-region, then we add a newline. Otherwise,
 *  we add a ' '.
 *
 * @param uglyString
 * @return A tuple: [a boolean indicating whether
 * anything was prettified, the prettified string]
 */
const prettify = (uglyString: string): [boolean, string] => {
    const state: PrettifyState = {
        braceLevelCounter: 0,
        bracketLevelCounter: 0,
        copyBeginOffset: 0,
        indentLevel: 0,
        isEscaped: false,
        isPrettifiedStringDifferent: false,
        lineBreakPending: false,
        parenLevelCounter: 0,
        regionStack: [],
        result: "",
    };

    let i = 0;
    while (i < uglyString.length) {
        const c = uglyString[i] ?? "";

        if (state.isEscaped) {
            state.isEscaped = false;
            state.result += c;
            i += 1;
        } else if ("\\" === c) {
            state.isEscaped = true;
            state.result += c;
            i += 1;
        } else if ('"' === c || "'" === c) {
            i = handleQuote(uglyString, i);
        } else if ("[" === c) {
            i = handleOpeningBracket(uglyString, i, state);
        } else if ("]" === c) {
            i = handleClosingBracket(uglyString, i, state);
        } else if ("," === c) {
            i = handleComma(uglyString, i, state);
        } else if ("{" === c || "(" === c) {
            i = handleOpeningBraceOrParen(uglyString, i, "{" === c, state);
        } else if ("}" === c || ")" === c) {
            i = handleClosingBraceOrParen(uglyString, i, "}" === c, state);
        } else {
            i++;
        }
    }

    return [state.isPrettifiedStringDifferent,
        state.copyBeginOffset < uglyString.length ?
            state.result + uglyString.substring(state.copyBeginOffset) :
            state.result];
};

export {prettify};
