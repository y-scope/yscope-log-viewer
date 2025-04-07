import {prettify} from "../../src/utils/prettifier";


describe("simpleCasesNotToPrettify", () => {
    test("should not prettify if there are no object/tuple/array", () => {
        expect(prettify("")[0]).toBe(false);
        expect(prettify("INFO test message")[0]).toBe(false);
    });

    test("should not prettify if there are no comma/braces/parentheses/square brackets after " +
        "initial opening braces/parentheses", () => {
        expect(prettify("INFO test {} () []")[0]).toBe(false);
        expect(prettify("INFO test {x y z} (x y z) [x y z]")[0]).toBe(false);
    });
});

describe("simpleCasesOfPrettifyingBraces", () => {
    test("should prettify for field without quotes", () => {
        expect(prettify("INFO test message {x, y, z}")[1]).toBe(
            `INFO test message {
    x,
    y,
    z
}`
        );
    });
    test("should prettify for field with quotes", () => {
        expect(
            prettify(
                "INFO test message {\"x\": \"string message\", \"y\": 1.0, \"z\": false}"
            )[1]
        ).toBe(
            `INFO test message {
    "x": "string message",
    "y": 1.0,
    "z": false
}`
        );
    });
    test("should not prettify for the field containing raw JSON string", () => {
        expect(prettify("INFO test message {\"msg\": \"{\\\"x\\\": \\\"string message\\\", " +
            "\\\"y\\\": 1.0, \\\"z\\\": false}\", \"timestamp\": 12345}")[1]).toBe(
            `INFO test message {
    "msg": "{\\"x\\": \\"string message\\", \\"y\\": 1.0, \\"z\\": false}",
    "timestamp": 12345
}`
        );
    });
});

describe("simpleCasesOfPrettifyingParentheses", () => {
    test("should prettify for simple tuple", () => {
        expect(prettify("INFO test message (x, y, z)")[1]).toBe(
            `INFO test message (
    x,
    y,
    z
)`
        );
    });
});

describe("simpleCasesOfPrettifyingSquareBrackets", () => {
    test("should prettify for simple array", () => {
        expect(prettify("INFO test message [x, y, z]")[1]).toBe(
            "INFO test message [x, y, z]"
        );
    });
});

describe("complicatedCasesOfPrettifyingStructuredData", () => {
    test("should prettify for nested object and array", () => {
        expect(prettify("INFO test message {x: [1, 2, 3], y: {a, b, c}, z}")[1]).toBe(
            `INFO test message {
    x: [1, 2, 3],
    y: {
        a,
        b,
        c
    },
    z
}`
        );
    });

    test("should prettify for nested tuple and object", () => {
        expect(prettify("INFO test message (x, {y1, y2: (a, b)}, z)")[1]).toBe(
            `INFO test message (
    x,
    {
        y1,
        y2: (
            a,
            b
        )
    },
    z
)`
        );
    });

    test("should prettify for mixed object, tuple and array", () => {
        expect(prettify("INFO test message {x: [1, {a, b}, 3], y: (p, q, [7, 8])}")[1]).toBe(
            `INFO test message {
    x: [1, {
        a,
        b
    }, 3],
    y: (
        p,
        q,
        [7, 8]
    )
}`
        );
    });

    test("should prettify for deeply nesting structure", () => {
        expect(
            prettify(
                "INFO test message {\"outer\": {\"middle\": (\"inner\": [1, 2, 3])}}"
            )[1]
        ).toBe(
            `INFO test message {
    "outer": {
        "middle": (
            "inner": [1, 2, 3]
        )
    }
}`
        );
    });
});

describe("prettifyEmptyStructures", () => {
    test("should prettify empty nested object", () => {
        expect(prettify("INFO test message {\"x\": {{{}}, {}}}")[1]).toBe(
            `INFO test message {
    "x": {
        {
            {}
        },
        {}
    }
}`
        );
    });

    test("should prettify empty nested tuple", () => {
        expect(prettify("INFO test message ((()), ())")[1]).toBe(
            `INFO test message (
    (
        ()
    ),
    ()
)`
        );
    });

    test("should prettify empty nested array", () => {
        expect(prettify("INFO test message [[[]], []]")[1]).toBe(
            "INFO test message [[[]], []]"
        );
    });

    test("should prettify empty structures with mixed object, tuple and array", () => {
        expect(prettify("INFO test message {\"x\": {{[], []}}}")[1]).toBe(
            `INFO test message {
    "x": {
        {
            [],
            []
        }
    }
}`
        );
        expect(prettify("INFO test message {\"x\": {}, \"y\": [], \"z\": {[]}}")[1]).toBe(
            `INFO test message {
    "x": {},
    "y": [],
    "z": {
        []
    }
}`
        );
    });
});

describe("prettifyComma", () => {
    test("should skip the next char if it is one of space/new line/tab", () => {
        expect(prettify("INFO test message {x, y,\tz,\nw}")[1]).toBe(
            `INFO test message {
    x,
    y,
    z,
    w
}`
        );
    });

    test("should prettify if there is a comma at the end of an object", () => {
        expect(prettify("INFO test message {x, y, z,}")[1]).toBe(
            `INFO test message {
    x,
    y,
    z,
    
}`
        );
    });

    test("should prettify if there is a comma at the end of a tuple", () => {
        expect(prettify("INFO test message (x, y, z,)")[1]).toBe(
            `INFO test message (
    x,
    y,
    z,
    
)`
        );
    });

    test("should prettify if there is a comma at the end of an array", () => {
        expect(prettify("INFO test message [x, y, z,]")[1]).toBe(
            "INFO test message [x, y, z, ]"
        );
    });
});

describe("cornerCasesOfEscaping", () => {
    test("should be able to escape comma and braces/parentheses/square brackets", () => {
        expect(prettify("INFO test message \\{,\\} \\({\\) \\[\\(\\[\\]")[0]).toBe(false);
        expect(prettify("INFO test message {\\,} (\\{) [\\(\\[]")[0]).toBe(false);
    });

    test("should be able to escape new line/tab", () => {
        expect(prettify("INFO test message {\"msg\": \"{\\n\\t\\\"x\\\": \\\"string message\\\"," +
            "\\n\\t\\\"y\\\": 1.0,\\n\\t\\\"z\\\": false}\", \"timestamp\": 12345}")[1]).toBe(
            `INFO test message {
    "msg": "{\\n\\t\\"x\\": \\"string message\\",\\n\\t\\"y\\": 1.0,\\n\\t\\"z\\": false}",
    "timestamp": 12345
}`
        );
    });
});
