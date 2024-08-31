import {
    CssVarsProvider,
    extendTheme,
} from "@mui/joy/styles";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

import Layout from "./components/Layout";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider from "./contexts/UrlContextProvider";
import {CONFIG_KEY} from "./typings/config";
import {CONFIG_DEFAULT} from "./utils/config";


const monacoTheme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                success: {
                    solidBg: "#007acc",
                    solidHoverBg: "#0062a3",
                    solidActiveBg: "#0062a3",
                },
                neutral: {
                    solidBg: "#5f6a79",
                    solidHoverBg: "#4c5561",
                    solidActiveBg: "#4c5561",
                },
                focusVisible: "#0090f1",
            },
        },
        dark: {
            palette: {
                success: {
                    solidBg: "#0e639c",
                    solidHoverBg: "#1177bb",
                    solidActiveBg: "#1177bb",
                },
                neutral: {
                    solidBg: "#313131",
                    solidHoverBg: "#45494e",
                    solidActiveBg: "#45494e",
                },
                focusVisible: "#007fd4",
            },
        },
    },
    focus: {
        default: {
            outlineWidth: "3px",
        },
    },
    fontFamily: {
        body: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    borderRadius: "2px",
                    ...("md" === ownerState.size && {
                        "fontWeight": 600,
                        "minHeight": "32px",
                        "fontSize": "14px",
                        "--Button-paddingInline": "1rem",
                    }),
                }),
            },
        },
        JoySelect: {
            defaultProps: {
                indicator: <KeyboardArrowDown/>,
            },
            styleOverrides: {
                root: {
                    borderRadius: "2px",
                },
            },
        },
        JoyInput: {
            styleOverrides: {
                root: {
                    borderRadius: "2px",
                },
            },
        },
    },
});

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
