import {CssVarsProvider} from "@mui/joy/styles";

import Layout from "./components/Layout";
import APP_THEME from "./components/theme";
import NotificationContextProvider from "./contexts/NotificationContextProvider";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider from "./contexts/UrlContextProvider";
import {CONFIG_KEY} from "./typings/config";
import {CONFIG_DEFAULT} from "./utils/config";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <CssVarsProvider
            defaultMode={CONFIG_DEFAULT[CONFIG_KEY.THEME]}
            modeStorageKey={CONFIG_KEY.THEME}
            theme={APP_THEME}
        >
            <NotificationContextProvider>
                <UrlContextProvider>
                    <StateContextProvider>
                        <Layout/>
                    </StateContextProvider>
                </UrlContextProvider>
            </NotificationContextProvider>
        </CssVarsProvider>
    );
};

export default App;
