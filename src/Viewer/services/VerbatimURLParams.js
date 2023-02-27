/**
 * Compared to URLSearchParams, this class does not URL-decode the search
 * parameters when reading them from a URL, nor does it URL-encode the
 * parameters when writing them to a URL.
 */
class VerbatimURLParams {
    /**
     * Constructs the object using the given url search string (e.g., from
     * window.location.search)
     * @param {string} urlSearch
     * @param {string} firstChar
     */
    constructor (urlSearch, firstChar) {
        this._kvPairs = {};

        // Erase first character ('?' or '#")
        if (firstChar === urlSearch.charAt(0)) {
            urlSearch = urlSearch.substring(1);
        }

        urlSearch.split('&').reduce((previous, current) => {
            const [key, value] = current.split('=');
            previous[key] = value;
            return previous;
        }, this._kvPairs)
    }

    /**
     * Gets the value corresponding to the specified key
     * @param {string} key
     * @returns {undefined|string} The value or undefined if the key doesn't
     * exist
     */
    get (key) {
        return this._kvPairs[key];
    }

    /**
     * Sets the given key to the given value
     * @param {string} key
     * @param {string} value
     */
    set (key, value) {
        // Forcibly convert the value to a string in case the user doesn't
        // pass in a string
        this._kvPairs[key] = `${value}`;
    }

    /**
     * Deletes the key-value pair corresponding to the given key
     * @param key
     */
    delete (key) {
        delete this._kvPairs[key];
    }

    /**
     * @returns {number} The number of key value pairs that exist
     */
    getLength () {
        return Object.keys(this._kvPairs).length;
    }

    /**
     * Converts the url parameters into a parameter string
     * @returns {string} The parameter string (without a preceding '?' or '#')
     */
    toString () {
        let s = "";
        for (const [key, value] of Object.entries(this._kvPairs)) {
            s += `${key}=${value}&`;
        }
        return s.substring(0, s.length - 1);
    }
}

export default VerbatimURLParams;
