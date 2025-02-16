import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    ToggleButtonGroup,
    useColorScheme,
} from "@mui/joy";
import type {Mode} from "@mui/system/cssVars/useCurrentColorScheme";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import {THEME_NAME} from "../../../typings/config";


/**
 * Renders a toggle button form field for overriding the dynamic theme selection based on user's
 * system setting.
 *
 * @return
 */
const ThemeOverrideFormField = () => {
    const {setMode, mode} = useColorScheme();

    return (
        <FormControl>
            <FormLabel>
                Theme override
            </FormLabel>
            <ToggleButtonGroup
                size={"sm"}
                value={mode as string}
                onChange={(__, newValue) => {
                    setMode(newValue as Mode);
                }}
            >
                <Button
                    startDecorator={<LightModeIcon/>}
                    value={THEME_NAME.LIGHT}
                >
                    Light
                </Button>
                <Button
                    startDecorator={<DarkModeIcon/>}
                    value={THEME_NAME.DARK}
                >
                    Dark
                </Button>
            </ToggleButtonGroup>
            <FormHelperText>
                {`Current mode: ${mode}`}
            </FormHelperText>
        </FormControl>
    );
};

export default ThemeOverrideFormField;
