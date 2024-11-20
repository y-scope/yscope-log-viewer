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
            functions: 90,
            lines: 90,
        },
        // eslint-disable-next-line no-warning-comments
        // TODO: Remove/adjust the overrides below as more test cases are added.
        "src/": {
            functions: 0,
            lines: 0,
        },
        "src/utils/math.ts": {
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
    testEnvironment: "node",
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

    // Caution: Extra properties set on `Error`, `Map` or `Set` will not be passed on through the
    // serialization.
    workerThreads: true,
};

export default JEST_CONFIG;
