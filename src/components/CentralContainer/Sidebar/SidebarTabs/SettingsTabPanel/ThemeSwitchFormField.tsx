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
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

import {THEME_NAME} from "../../../../../typings/config";


/**
 * Renders a toggle button form field for theme selection.
 *
 * @return
 */
const ThemeSwitchFormField = () => {
    const {setMode, mode} = useColorScheme();

    return (
        <FormControl>
            <FormLabel>
                Theme
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
                    startDecorator={<SettingsBrightnessIcon/>}
                    value={THEME_NAME.SYSTEM}
                >
                    System
                </Button>
                <Button
                    startDecorator={<DarkModeIcon/>}
                    value={THEME_NAME.DARK}
                >
                    Dark
                </Button>
            </ToggleButtonGroup>
            <FormHelperText>
                Log viewer color theme. System theme will match your system settings.
            </FormHelperText>
        </FormControl>
    );
};

export default ThemeSwitchFormField;
