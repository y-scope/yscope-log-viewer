import React from "react";
import {Table} from "react-bootstrap";


/* eslint-disable @stylistic/js/array-element-newline, sort-keys */
const SHORTCUTS = [
    {
        action: "Focus on Editor",
        windows: ["`"],
        macOs: ["`"],
    },
    {
        action: "Next Page",
        windows: ["Ctrl", "]"],
        macOs: ["⌘", "]"],
    },
    {
        action: "Prev Page",
        windows: ["Ctrl", "["],
        macOs: ["⌘", "["],
    },
    {
        action: "First Page",
        windows: ["Ctrl", ","],
        macOs: ["⌘", ","],
    },
    {
        action: "Last Page",
        windows: ["Ctrl", "."],
        macOs: ["⌘", "."],
    },
    {
        action: "Go to Top",
        windows: ["Ctrl", "U"],
        macOs: ["⌘", "U"],
    },
    {
        action: "Go to Bottom",
        windows: ["Ctrl", "I"],
        macOs: ["⌘", "I"],
    },
];
/* eslint-enable @stylistic/js/array-element-newline, sort-keys */

const ShortcutsTable = () => {
    const renderShortcutKeys = (keys) => keys.map((key, keyIdx) => (
        <span key={keyIdx}>
            <kbd>
                {key}
            </kbd>
            {((keys.length - 1) !== keyIdx) &&
                <span> + </span>}
        </span>
    ));

    return (
        <Table
            borderless={true}
            style={{fontSize: "15px"}}
        >
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Windows</th>
                    <th>macOS</th>
                </tr>
            </thead>
            <tbody>
                {SHORTCUTS.map((shortcut, actionIdx) => (
                    <tr key={actionIdx}>
                        <td>
                            {shortcut.action}
                        </td>
                        <td>
                            {renderShortcutKeys(shortcut.windows)}
                        </td>
                        <td>
                            {renderShortcutKeys(shortcut.macOs)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default ShortcutsTable;
