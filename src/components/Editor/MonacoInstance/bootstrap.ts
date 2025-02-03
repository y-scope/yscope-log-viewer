import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

import "monaco-editor";


self.MonacoEnvironment = {
    getWorker: () => {
        return new EditorWorker();
    },
};
