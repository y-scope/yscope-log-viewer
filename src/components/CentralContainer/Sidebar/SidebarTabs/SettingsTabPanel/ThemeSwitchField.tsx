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

import {THEME_NAME} from "../../../../../typings/config";


/**
 * Renders a theme selection field in the settings form.
 *
 * @return
 */
const ThemeSwitchField = () => {
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

export default ThemeSwitchField;
