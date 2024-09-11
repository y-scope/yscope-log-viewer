import {extendTheme} from "@mui/joy/styles";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";


const monacoTheme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    solidBg: "#005fb8",
                    solidHoverBg: "#0258a8",
                    solidActiveBg: "#005fb8",
                },
                neutral: {
                    solidBg: "#e5e5e5",
                    solidHoverBg: "#cccccc",
                    solidActiveBg: "#e5e5e5",
                    solidColor: "#3b3b3b",
                },
                focusVisible: "#005fb8",
            },
        },
        dark: {
            palette: {
                primary: {
                    solidBg: "#0078d4",
                    solidHoverBg: "#026ec1",
                    solidActiveBg: "#0078d4",
                },
                neutral: {
                    solidBg: "#181818",
                    solidHoverBg: "#323232",
                    solidActiveBg: "#181818",
                },
                focusVisible: "#0078d4",
            },
        },
    },
    focus: {
        default: {
            outlineWidth: "3px",
        },
    },
    fontFamily: {
        body: "var(--ylv-ui-font-family)",
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
        JoyFormControl: {
            styleOverrides: {
                root: ({theme}) => ({
                    [theme.getColorSchemeSelector("dark")]: {
                        ":hover": {backgroundColor: "#232424"},
                    },
                    [theme.getColorSchemeSelector("light")]: {
                        ":hover": {backgroundColor: "#f8f8f8"},
                    },
                }),
            },
        },
    },
});

export default monacoTheme;