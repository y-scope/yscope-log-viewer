/**
 * Simple class to store messages. Messages indicating progress
 * are replaced with updated progress.
 */
class MessageLogger {
    constructor () {
        this._msgs = [];
    }

    _isProgress (msg) {
        const isProgress = msg.includes("Progress");
        if (isProgress && this._msgs.length > 0) {
            const isPrevProgress = this._msgs[this._msgs.length-1].includes("Progress");
            if (isPrevProgress) {
                this._msgs.pop();
            }
        }
    }

    add (msg, error) {
        if (msg && msg !== "") {
            if (error) {
                this._msgs.push("Error: " + msg);
            } else {
                this._isProgress(msg);
                this._msgs.push(msg);
            }
        }
    }

    reset () {
        this._msgs = [];
        return this._msgs;
    }

    get () {
        return this._msgs;
    }
}

export default MessageLogger;
