class BufferPool {
    constructor (objectConstructor) {
        this._objectConstructor = objectConstructor;
        this._objects = [];
        this._numUsedObjects = 0;
    }

    free () {
        this._numUsedObjects = 0;
    }

    getNext () {
        let obj;
        if (this._numUsedObjects === this._objects.length) {
            obj = new this._objectConstructor();
            this._objects.push(obj);
            ++this._numUsedObjects;
        } else {
            obj = this._objects[this._numUsedObjects++];
        }
        return obj;
    }

    get (index) {
        return this._objects[index];
    }
}

export default BufferPool;
