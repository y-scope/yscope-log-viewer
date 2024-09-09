import {
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";

import * as monaco from "monaco-editor";

import {CssVarsProvider} from "@mui/joy/styles";

import {StateContext} from "../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    UrlContext,
} from "../contexts/UrlContextProvider";
import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {ACTION_NAME} from "../utils/actions";
import {CONFIG_DEFAULT} from "../utils/config";
import monacoTheme from "../utils/theme";
import DropFileContainer from "./DropFileContainer";
import Editor from "./Editor";
import {goToPositionAndCenter} from "./Editor/MonacoInstance/utils";
import {
    handleAction,
    MenuBar,
} from "./MenuBar";
import {StatusBar} from "./StatusBar";

import "./Layout.css";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {numEvents} = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const logEventNumRef = useRef<Nullable<number>>(logEventNum);
    const numEventsRef = useRef<Nullable<number>>(numEvents);

    const handleCopyLinkButtonClick = () => {
        copyPermalinkToClipboard({}, {});
    };

    const handleEditorCustomAction = useCallback((
        editor: monaco.editor.IStandaloneCodeEditor,
        actionName: ACTION_NAME
    ) => {
        if (null === logEventNumRef.current || null === numEventsRef.current) {
            return;
        }
        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
            case ACTION_NAME.PREV_PAGE:
            case ACTION_NAME.NEXT_PAGE:
            case ACTION_NAME.LAST_PAGE:
                handleAction(actionName, logEventNumRef.current, numEventsRef.current);
                break;
            case ACTION_NAME.PAGE_TOP:
                goToPositionAndCenter(editor, {lineNumber: 1, column: 1});
                break;
            case ACTION_NAME.PAGE_BOTTOM: {
                const lineCount = editor.getModel()?.getLineCount();
                if ("undefined" === typeof lineCount) {
                    break;
                }
                goToPositionAndCenter(editor, {lineNumber: lineCount, column: 1});
                break;
            }
            default:
                break;
        }
    }, []);

    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    useEffect(() => {
        numEventsRef.current = numEvents;
    }, [numEvents]);

    return (
        <div className={"layout"}>
            <CssVarsProvider
                defaultMode={CONFIG_DEFAULT[CONFIG_KEY.THEME]}
                modeStorageKey={CONFIG_KEY.THEME}
                theme={monacoTheme}
            >
                <MenuBar/>
                <DropFileContainer>
                    <Editor onCustomAction={handleEditorCustomAction}/>
                </DropFileContainer>
                <StatusBar
                    handleCopyLinkButtonClick={handleCopyLinkButtonClick}
                    logEventNum={logEventNum}
                    numEvents={numEvents}/>
            </CssVarsProvider>
        </div>
    );
};

export default Layout;
