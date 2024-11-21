import type {Config} from "jest";
import os from "node:os";
import pathPosix from "node:path/posix";


let PRIMARY_REPORTER: string | [string, Record<string, unknown>] = "default";
if ("undefined" !== typeof process.env.GITHUB_ACTIONS) {
    PRIMARY_REPORTER = [
        "github-actions",
        {silent: false},
    ];
}
console.log(`Environment variable "GITHUB_ACTIONS"="${process.env.GITHUB_ACTIONS}": ` +
    `primary reporter will be "${JSON.stringify(PRIMARY_REPORTER)}".`);

const JEST_CONFIG: Config = {
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{ts,tsx}"],
    coverageProvider: "v8",
    coverageReporters: ["text"],
    coverageThreshold: {
        "global": {
            branches: 100,
            functions: 100,
            lines: 100,
        },
        // eslint-disable-next-line no-warning-comments
        // TODO: Remove/adjust the overrides below as more test cases are added.
        "src/": {
            branches: 0,
            functions: 0,
            lines: 0,
        },
        "src/utils/math.ts": {
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    displayName: {
        name: "yscope-log-viewer",
        color: "blue",
    },
    errorOnDeprecated: true,
    maxConcurrency: os.cpus().length,
    maxWorkers: "100%",
    openHandlesTimeout: 1000,
    reporters: [
        PRIMARY_REPORTER,
        "summary",
    ],
    showSeed: true,
    testMatch: [
        pathPosix.join(__dirname, "test/**/?(*)test.{ts,tsx}"),
    ],
    testTimeout: 5000,
    transform: {
        ".(ts|tsx)$": [
            "ts-jest",
            {useESM: true},
        ],
    },
    verbose: true,

    // NOTE: Extra properties in types such as `Error`, `Map`, or `Set` are not preserved when
    // passing payloads between parent and child threads due to serialization.
    // See https://jestjs.io/docs/29.6/configuration#workerthreads
    workerThreads: true,
};

export default JEST_CONFIG;
