import {
    CssVarsProvider,
    extendTheme,
} from "@mui/joy/styles";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

import Layout from "./components/Layout";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider from "./contexts/UrlContextProvider";


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
                    outlinedBg: "#F6F8FA",
                    outlinedHoverBg: "#F3F4F6",
                    outlinedActiveBg: "#F3F4F6",
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
                    outlinedBg: "#313131",
                    outlinedHoverBg: "#3c3c3c",
                    outlinedActiveBg: "#3c3c3c",
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
        body: "SF Pro Text, var(--gh-fontFamily-fallback)",
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
                    ...("success" === ownerState.color &&
            "solid" === ownerState.variant && {
                        "--gh-palette-focusVisible": "rgba(46, 164, 79, 0.4)",
                        "border": "1px solid rgba(27, 31, 36, 0.15)",
                        "&:active": {
                            boxShadow: "inset 0px 1px 0px rgba(20, 70, 32, 0.2)",
                        },
                    }),
                    ...("neutral" === ownerState.color &&
            "outlined" === ownerState.variant && {
                        "&:active": {
                            boxShadow: "none",
                        },
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
        <CssVarsProvider>
            <UrlContextProvider>
                <StateContextProvider>
                    <Layout/>
                </StateContextProvider>
            </UrlContextProvider>
        </CssVarsProvider>
    );
};

export default App;
