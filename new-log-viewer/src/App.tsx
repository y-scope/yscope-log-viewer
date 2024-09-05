import {CssVarsProvider} from "@mui/joy/styles";

import Layout from "./components/Layout";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider from "./contexts/UrlContextProvider";
import {CONFIG_KEY} from "./typings/config";
import {CONFIG_DEFAULT} from "./utils/config";
import monacoTheme from "./utils/theme";


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
            theme={monacoTheme}
        >
            <UrlContextProvider>
                <StateContextProvider>
                    <Layout/>
                </StateContextProvider>
            </UrlContextProvider>
        </CssVarsProvider>
    );
};

export default App;
