/**
 * A simple prettifier that tries to strike a balance between efficiency
 * and beauty.
 */
class SimplePrettifier {
    static NUM_INDENTATION_SPACES = 4;

    static _WHITESPACE_CHARACTERS = [" ", "\t", "\n"];

    /**
     * @param {number} indentLevel The level of indentation for the line.
     * @return {string} the whitespace (newline and indentation) for starting a
     * new line.
     * @private
     */
    _getStartingWhitespaceOfNewLine (indentLevel) {
        return "\n" + " ".repeat(indentLevel * SimplePrettifier.NUM_INDENTATION_SPACES);
    }

    /**
     * Prettifies the given string according to these rules:
     * <ul>
     *     <li>Regions enclosed by "{}"/"()" are indented and every
     *     parameter/kv-pair is printed on a new line.</li>
     *     <ul>
     *         <li>Where possible, if the region contains none or a single
     *         parameter/kv-pair, we don't print it on a separate line.</li>
     *     </ul>
     *     <li>For regions enclosed by "[]", every entry is space-separated.
     *     </li>
     * </ul>
     *
     * @param {string} uglyString
     * @return {[boolean, string]} A tuple: [a boolean indicating whether
     * anything was prettified, the prettified string]
     */
    prettify (uglyString) {
        /* We implement the rules above as follows:
        - After seeing '\', we ignore the next character.
        - After seeing '"', we only monitor for an unescaped '"'.
        - After seeing '\'', we only monitor for an unescaped '\''.
        - After seeing '{'/'(', we *typically* add a newline and increase
          the indentation level.
            - The one exception to this is if there is only one
              parameter/kv-pair in the region enclosed by "{}"/"()". However,
              this is hard to determine without reading ahead until the end of
              the region. So a reasonable heuristic is if, after the initial
              opening '{'/'(', we encounter a ','/'{'/'('/'[', we will simply
              add a newline.
        - After seeing '}'/')', we decrease the indentation level.
        - After seeing ',':
            - (1) If we are in an object with a region enclosed by '{' or '(',
                  we add a newline.
            - (2) Otherwise, if we are in an object enclosed by "[]", we add a
                  ' '.
            - In both (1) & (2), we skip the next character if it's a character
              in _WHITESPACE_CHARACTERS.
            - To handle the difference in handling ',' when we're in a region
              enclosed by '{'/'(' versus '[':
                - If we are in a '{'/'('-region nested within a '['-region, then
                  we add a newline.
                - Otherwise, we add a ' '.
                - An easy way to determine this is to keep track of the
                  indentation level when we enter a '['-region.
                - When we encounter the ',', if the indentation level is higher
                  than when we entered the '['-region, then we know we must be
                  in a '{'/'('-region.
                - Since we can have '['-regions nested in other '['-regions, we
                  need to keep track of the indentation level per '['-region.
         */

        let newString = "";
        let indentLevel = 0;
        let isEscaped = false;
        let quoteChar = null;
        let squareBracketsLevel = 0;
        const arrayIndentLevels = [];
        let lineBreakPending = false;
        let copyBeginOffset = 0;
        let isPrettifiedStringDifferent = false;
        for (let i = 0; i < uglyString.length; ++i) {
            const c = uglyString[i];

            // Skip this character if it has been escaped
            if (isEscaped) {
                isEscaped = false;
                continue;
            }

            if ("'" === c) {
                isEscaped = true;
            } else if (null !== quoteChar) {
                // Check if we've reached the end of the quoted region
                if (quoteChar === c) {
                    quoteChar = null;
                }
            } else if ('"' === c || "'" === c) {
                // Start of a quoted region
                quoteChar = c;
            } else if ("[" === c) {
                if (lineBreakPending) {
                    newString += this._getStartingWhitespaceOfNewLine(indentLevel);
                    lineBreakPending = false;
                    isPrettifiedStringDifferent = true;
                }

                arrayIndentLevels.push(indentLevel);
                ++squareBracketsLevel;
            } else if ("]" === c) {
                --squareBracketsLevel;
                arrayIndentLevels.pop();
            } else if ("," === c) {
                if (0 === squareBracketsLevel && 0 === indentLevel) {
                    // Comma is not within a bracketed region, so it doesn't
                    // need handling
                    continue;
                }

                if (lineBreakPending) {
                    newString += this._getStartingWhitespaceOfNewLine(indentLevel);
                    lineBreakPending = false;
                }

                // Copy the next unmodified segment
                const nextCharPos = i + 1;
                newString += uglyString.substring(copyBeginOffset, nextCharPos);
                copyBeginOffset = nextCharPos;

                // Add whitespace
                let whitespace;
                if (0 === squareBracketsLevel
                    || indentLevel > arrayIndentLevels[squareBracketsLevel - 1])
                {
                    whitespace = this._getStartingWhitespaceOfNewLine(indentLevel);
                } else {
                    whitespace = " ";
                }
                newString += whitespace;
                isPrettifiedStringDifferent = true;

                if (nextCharPos < uglyString.length
                    && SimplePrettifier._WHITESPACE_CHARACTERS.includes(uglyString[nextCharPos]))
                {
                    // Skip the next character
                    ++i;
                    copyBeginOffset = i + 1;
                }
            } else if ("{" === c || "(" === c) {
                if (lineBreakPending) {
                    newString += this._getStartingWhitespaceOfNewLine(indentLevel);
                    lineBreakPending = false;
                    isPrettifiedStringDifferent = true;
                }
                lineBreakPending = true;

                // Copy the next unmodified segment
                const nextCharPos = i + 1;
                newString += uglyString.substring(copyBeginOffset, nextCharPos);
                copyBeginOffset = nextCharPos;

                ++indentLevel;
            } else if ("}" === c || ")" === c) {
                // Copy the next unmodified segment
                newString += uglyString.substring(copyBeginOffset, i);
                copyBeginOffset = i + 1;

                --indentLevel;
                if (indentLevel < 0) {
                    indentLevel = 0;
                }

                // If a line-break is pending when we reach the end of a region
                // enclosed by "{}"/"()", then that means there the region was
                // empty. So we can ignore the pending line break.
                if (false === lineBreakPending) {
                    newString += this._getStartingWhitespaceOfNewLine(indentLevel);
                    isPrettifiedStringDifferent = true;
                }
                lineBreakPending = false;
                newString += c;
            }
        }
        // Add any remaining unmodified segments
        if (copyBeginOffset < uglyString.length) {
            newString += uglyString.substring(copyBeginOffset);
        }

        return [isPrettifiedStringDifferent, newString];
    }
}

export default SimplePrettifier;
