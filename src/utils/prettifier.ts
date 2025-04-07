const NUM_INDENTATION_SPACES: number = 4;

const WHITESPACE_CHARACTERS: string[] = [" ",
    "\t",
    "\n"];

interface PrettifyState {
    arrayIndentLevels: number[];
    copyBeginOffset: number;
    indentLevel: number;
    isEscaped: boolean;
    isPrettifiedStringDifferent: boolean;
    lineBreakPending: boolean;
    quoteChar: string | null;
    result: string;
    squareBracketsLevel: number;
}

/**
 * Get the whitespace (newline and indentation) for starting a new line.
 *
 * @param indentLevel The level of indentation for the line.
 * @return the whitespace (newline and indentation) for starting a
 * new line.
 * @private
 */
const getStartingWhitespaceOfNewLine = (indentLevel: number): string => {
    return `\n${" ".repeat(indentLevel * NUM_INDENTATION_SPACES)}`;
};

/**
 * Handles escape characters when prettifying.
 *
 * If a backslash (`\`) is encountered, sets `isEscaped = true`
 * so the next character is ignored. If `isEscaped` is already
 * true, it resets it and skips processing the current character.
 *
 * @param c The current character being parsed.
 * @param state The current state of the prettifier.
 * @return True if the current character was handled (escaped or backslash).
 */
const handleEscape = (c: string, state: PrettifyState): boolean => {
    if (state.isEscaped) {
        state.isEscaped = false;

        return true;
    }
    if ("\\" === c) {
        state.isEscaped = true;

        return true;
    }

    return false;
};

/**
 * Checks whether the current parsing context is inside a quoted string.
 *
 * @param state The current state of the prettifier.
 * @return True if inside a quoted string (single or double quotes).
 */
const insideQuote = (state: PrettifyState): boolean => {
    return null !== state.quoteChar;
};

/**
 * Handles the opening of a square bracket `[` during prettification.
 *
 * Adds a newline if a line break is pending and tracks the indent level
 * for correct spacing of array entries.
 *
 * @param state The current state of the prettifier.
 */
const handleOpeningBracket = (state: PrettifyState): void => {
    if (state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.lineBreakPending = false;
        state.isPrettifiedStringDifferent = true;
    }
    state.arrayIndentLevels.push(state.indentLevel);
    state.squareBracketsLevel++;
};

/**
 * Handles a comma `,` during prettification.
 *
 * Determines whether to insert a newline or a space after the comma
 * based on the current nesting context. If the character following
 * the comma is a whitespace character, it is skipped.
 *
 * @param uglyString The original unformatted string.
 * @param index The index of the current char.
 * @param state The current state of the prettifier.
 * @return An updated index (`newIndex`) for the main loop.
 */
const handleComma = (
    uglyString: string,
    index: number,
    state: PrettifyState
): {newIndex: number} => {
    if (0 === state.squareBracketsLevel && 0 === state.indentLevel) {
        return {newIndex: index};
    }

    if (state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.lineBreakPending = false;
    }

    const nextCharPos = index + 1;
    state.result += uglyString.substring(state.copyBeginOffset, nextCharPos);
    state.copyBeginOffset = nextCharPos;

    const shouldBreak =
        0 === state.squareBracketsLevel ||
        state.indentLevel >
        (state.arrayIndentLevels[state.squareBracketsLevel - 1] ?? 0);

    state.result += shouldBreak ?
        getStartingWhitespaceOfNewLine(state.indentLevel) :
        " ";
    state.isPrettifiedStringDifferent = true;

    const nextChar = uglyString[nextCharPos] ?? "";
    if (WHITESPACE_CHARACTERS.includes(nextChar)) {
        state.copyBeginOffset++;

        return {newIndex: index + 1};
    }

    return {newIndex: index};
};

/**
 * Handles the opening of a curly brace `{` or parenthesis `(`.
 *
 * Adds a newline before the character and increases indentation level.
 *
 * @param uglyString The original unformatted string.
 * @param index The index of the current char.
 * @param state The current state of the prettifier.
 */
const handleOpeningBraceOrParen = (
    uglyString: string,
    index: number,
    state: PrettifyState
): void => {
    if (state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.isPrettifiedStringDifferent = true;
    }

    const nextCharPos = index + 1;
    state.result += uglyString.substring(state.copyBeginOffset, nextCharPos);
    state.copyBeginOffset = nextCharPos;

    state.indentLevel++;
    state.lineBreakPending = true;
};

/**
 * Handles the closing of a curly brace `}` or parenthesis `)`.
 *
 * Decreases the indentation level and adds a newline before the closing
 * character, unless the block was empty (line break was pending).
 *
 * @param uglyString The original unformatted string.
 * @param index The index of the current char.
 * @param char The closing character (`}` or `)`).
 * @param state The current state of the prettifier.
 */
const handleClosingBraceOrParen = (
    uglyString: string,
    index: number,
    char: string,
    state: PrettifyState
): void => {
    state.result += uglyString.substring(state.copyBeginOffset, index);
    state.copyBeginOffset = index + 1;

    state.indentLevel = Math.max(0, state.indentLevel - 1);

    if (!state.lineBreakPending) {
        state.result += getStartingWhitespaceOfNewLine(state.indentLevel);
        state.isPrettifiedStringDifferent = true;
    }

    state.lineBreakPending = false;
    state.result += char;
};

/**
 * Prettifies the given string according to these rules:
 * <ul>
 * <li>Regions enclosed by "{}"/"()" are indented and every
 * parameter/kv-pair is printed on a new line.</li>
 * <ul>
 * <li>Where possible, if the region contains none or a single
 * parameter/kv-pair, we don't print it on a separate line.</li>
 * </ul>
 * <li>For regions enclosed by "[]", every entry is space-separated.
 * </li>
 * </ul>
 *
 * We implement the rules above as follows:
 * - After seeing '\', we ignore the next character.
 * - After seeing '"', we only monitor for an unescaped '"'.
 * - After seeing '\'', we only monitor for an unescaped '\''.
 * - After seeing '{'/'(', we *typically* add a newline and increase
 * the indentation level.
 * - The one exception to this is if there is only one
 * parameter/kv-pair in the region enclosed by "{}"/"()". However,
 * this is hard to determine without reading ahead until the end of
 * the region. So a reasonable heuristic is if, after the initial
 * opening '{'/'(', we encounter a ','/'{'/'('/'[', we will simply
 * add a newline.
 * - After seeing '}'/')', we decrease the indentation level.
 * - After seeing ',':
 * - (1) If we are in an object with a region enclosed by '{' or '(',
 *       we add a newline.
 * - (2) Otherwise, if we are in an object enclosed by "[]", we add a
 *       ' '.
 * - In both (1) & (2), we skip the next character if it's a character
 *   in _WHITESPACE_CHARACTERS.
 * - To handle the difference in handling ',' when we're in a region
 *   enclosed by '{'/'(' versus '[':
 *     - If we are in a '{'/'('-region nested within a '['-region, then
 *       we add a newline.
 *     - Otherwise, we add a ' '.
 *     - An easy way to determine this is to keep track of the
 *       indentation level when we enter a '['-region.
 *     - When we encounter the ',', if the indentation level is higher
 *       than when we entered the '['-region, then we know we must be
 *       in a '{'/'('-region.
 *     - Since we can have '['-regions nested in other '['-regions, we
 *       need to keep track of the indentation level per '['-region.
 *
 * @param uglyString
 * @return A tuple: [a boolean indicating whether
 * anything was prettified, the prettified string]
 */
const prettify = (uglyString: string): [boolean, string] => {
    const state: PrettifyState = {
        arrayIndentLevels: [],
        copyBeginOffset: 0,
        indentLevel: 0,
        isEscaped: false,
        isPrettifiedStringDifferent: false,
        lineBreakPending: false,
        quoteChar: null,
        result: "",
        squareBracketsLevel: 0,
    };

    for (let i = 0; i < uglyString.length; ++i) {
        const c = uglyString[i] ?? "";

        if (handleEscape(c, state)) {
            continue;
        }

        if (insideQuote(state)) {
            if (state.quoteChar === c) {
                state.quoteChar = null;
            }
        } else if ('"' === c || "'" === c) {
            state.quoteChar = c;
        } else if ("[" === c) {
            handleOpeningBracket(state);
        } else if ("]" === c) {
            state.squareBracketsLevel--;
            state.arrayIndentLevels.pop();
        } else if ("," === c) {
            const result = handleComma(uglyString, i, state);
            i = result.newIndex;
        } else if ("{" === c || "(" === c) {
            handleOpeningBraceOrParen(uglyString, i, state);
        } else if ("}" === c || ")" === c) {
            handleClosingBraceOrParen(uglyString, i, c, state);
        }
    }

    if (state.copyBeginOffset < uglyString.length) {
        state.result += uglyString.substring(state.copyBeginOffset);
    }

    return [state.isPrettifiedStringDifferent,
        state.result];
};

export {prettify};
