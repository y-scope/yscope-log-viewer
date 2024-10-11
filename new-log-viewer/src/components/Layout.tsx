import {useContext} from "react";

import {CssVarsProvider} from "@mui/joy";

import {NotificationContext} from "../contexts/NotificationContextProvider";
import {CONFIG_KEY} from "../typings/config";
import {CONFIG_DEFAULT} from "../utils/config";
import CentralContainer from "./CentralContainer";
import MenuBar from "./MenuBar";
import PopUpMessagesContainer from "./PopUpMessagesContainer";
import StatusBar from "./StatusBar";
import APP_THEME from "./theme";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {popupMessages, onPopupMessagesChange} = useContext(NotificationContext);

    return (
        <CssVarsProvider
            defaultMode={CONFIG_DEFAULT[CONFIG_KEY.THEME]}
            modeStorageKey={CONFIG_KEY.THEME}
            theme={APP_THEME}
        >
            <MenuBar/>
            <CentralContainer/>
            <StatusBar/>
            <PopUpMessagesContainer
                popupMessages={popupMessages}
                onPopupMessagesChange={onPopupMessagesChange}/>
        </CssVarsProvider>
    );
};

export default Layout;
