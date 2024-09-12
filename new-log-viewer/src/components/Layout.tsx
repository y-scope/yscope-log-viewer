import {CssVarsProvider} from "@mui/joy/styles";

import {CONFIG_KEY} from "../typings/config";
import {CONFIG_DEFAULT} from "../utils/config";
import DropFileContainer from "./DropFileContainer";
import Editor from "./Editor";
import MenuBar from "./MenuBar";
import StatusBar from "./StatusBar";
import APP_THEME from "./theme";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
// eslint-disable-next-line no-warning-comments
// TODO: replace elements in this component once we integrate with a UI framework
// eslint-disable-next-line max-lines-per-function
const Layout = () => {
    return (
        <CssVarsProvider
            defaultMode={CONFIG_DEFAULT[CONFIG_KEY.THEME]}
            modeStorageKey={CONFIG_KEY.THEME}
            theme={APP_THEME}
        >
            <div className={"layout"}>
                <MenuBar/>
                <DropFileContainer>
                    <Editor/>
                </DropFileContainer>
                <StatusBar/>
            </div>
        </CssVarsProvider>
    );
};

export default Layout;
