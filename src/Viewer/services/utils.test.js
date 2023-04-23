import {binarySearchWithTimestamp} from "./utils";

// This file tests the helper functions inside utils.

/**
 * Using timestampArray as a reference, create an array named logEvents which
 * every single element in this array has a key named "timestamp".
 * @param {Array} logEvents
 * @param {Array} timestampArray Array of integers
 */
function _loadLogEvents(logEvents, timestampArray) {
    logEvents.length = 0;
    for (let i = 0; i < timestampArray.length; ++i) {
        logEvents.push({"timestamp": timestampArray[i]});
    }
}

test("binarySearchWithTimestamp", () => {
    let logEvents = [];
    let timestampArray = [];
    let retval;
    
    // Test if the logEvent array is empty
    retval = binarySearchWithTimestamp(0, logEvents);
    expect(retval).toBe(null);

    // Test when the logEvent array only has one element
    timestampArray = [1];
    _loadLogEvents(logEvents, timestampArray);
    retval = binarySearchWithTimestamp(0, logEvents);
    expect(retval).toBe(0);
    retval = binarySearchWithTimestamp(1, logEvents);
    expect(retval).toBe(0);
    retval = binarySearchWithTimestamp(1000, logEvents);
    expect(retval).toBe(null);

    // Test when the logEvent array has multiple elements but no duplicates
    timestampArray = [3, 7, 9, 11, 14, 17, 20, 23, 31]
    _loadLogEvents(logEvents, timestampArray);
    retval = binarySearchWithTimestamp(1, logEvents);
    expect(retval).toBe(0);
    retval = binarySearchWithTimestamp(10, logEvents);
    expect(retval).toBe(3);
    retval = binarySearchWithTimestamp(11, logEvents);
    expect(retval).toBe(3);
    retval = binarySearchWithTimestamp(19, logEvents);
    expect(retval).toBe(6);
    retval = binarySearchWithTimestamp(31, logEvents);
    expect(retval).toBe(8);
    retval = binarySearchWithTimestamp(32, logEvents);
    expect(retval).toBe(null);
    retval = binarySearchWithTimestamp(1000, logEvents);
    expect(retval).toBe(null);

    // Test when the logEvent array has multiple elements and duplicates
    timestampArray = [3, 7, 9, 11, 11, 11, 14, 17, 31, 31, 31, 39, 39, 40, 41, 41]
    _loadLogEvents(logEvents, timestampArray);
    retval = binarySearchWithTimestamp(1, logEvents);
    expect(retval).toBe(0);
    retval = binarySearchWithTimestamp(10, logEvents);
    expect(retval).toBe(3);
    retval = binarySearchWithTimestamp(11, logEvents);
    expect(retval).toBe(3);
    retval = binarySearchWithTimestamp(12, logEvents);
    expect(retval).toBe(6);
    retval = binarySearchWithTimestamp(30, logEvents);
    expect(retval).toBe(8);
    retval = binarySearchWithTimestamp(31, logEvents);
    expect(retval).toBe(8);
    retval = binarySearchWithTimestamp(32, logEvents);
    expect(retval).toBe(11);
    retval = binarySearchWithTimestamp(39, logEvents);
    expect(retval).toBe(11);
    retval = binarySearchWithTimestamp(40, logEvents);
    expect(retval).toBe(13);
    retval = binarySearchWithTimestamp(41, logEvents);
    expect(retval).toBe(14);
    retval = binarySearchWithTimestamp(42, logEvents);
    expect(retval).toBe(null);
    retval = binarySearchWithTimestamp(1000, logEvents);
    expect(retval).toBe(null);
});