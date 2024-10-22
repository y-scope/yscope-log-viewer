import {extendTheme} from "@mui/joy";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";


const APP_THEME = extendTheme({
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
    components: {
        JoySelect: {
            defaultProps: {
                indicator: <KeyboardArrowDown/>,
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
    fontFamily: {
        body: "var(--ylv-ui-font-family)",
    },
    radius: {
        /* eslint-disable sort-keys */
        xs: "2px",
        sm: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        /* eslint-enable sort-keys */
    },
});

export default APP_THEME;
