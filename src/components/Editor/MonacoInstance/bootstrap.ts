// Imports monaco plugins and sets up environment for Monaco worker creation.


import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";

import "monaco-editor/features/clipboard/register";
import "monaco-editor/features/codicon/register";
import "monaco-editor/features/contextmenu/register";
import "monaco-editor/features/find/register";
import "monaco-editor/features/folding/register";
import "monaco-editor/features/hover/register";
import "monaco-editor/features/links/register";
import "monaco-editor/features/quickCommand/register";
import "monaco-editor/features/readOnlyMessage/register";
import "monaco-editor/features/sectionHeaders/register";
import "monaco-editor/features/wordHighlighter/register";


// Expose Monaco's worker to Vite
self.MonacoEnvironment = {
    getWorker: () => {
        // We don't need language-specific workers, so a basic `EditorWorker` is enough.
        return new EditorWorker();
    },
};
