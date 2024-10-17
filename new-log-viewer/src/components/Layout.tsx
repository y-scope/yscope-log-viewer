import {CssVarsProvider} from "@mui/joy";

import {CONFIG_KEY} from "../typings/config";
import {CONFIG_DEFAULT} from "../utils/config";
import CentralContainer from "./CentralContainer";
import MenuBar from "./MenuBar";
import PopUps from "./PopUps";
import StatusBar from "./StatusBar";
import APP_THEME from "./theme";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    return (
        <CssVarsProvider
            defaultMode={CONFIG_DEFAULT[CONFIG_KEY.THEME]}
            modeStorageKey={CONFIG_KEY.THEME}
            theme={APP_THEME}
        >
            <MenuBar/>
            <CentralContainer/>
            <StatusBar/>
            <PopUps/>
        </CssVarsProvider>
    );
};

export default Layout;
