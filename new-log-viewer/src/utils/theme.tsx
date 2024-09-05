import {extendTheme} from "@mui/joy/styles";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";


const monacoTheme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                primary: {
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
                primary: {
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
        body: "-apple-system, BlinkMacSystemFont, system-ui, Ubuntu, 'Droid Sans', Roboto",
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: {
                    borderRadius: "2px",
                },
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

export default monacoTheme;
