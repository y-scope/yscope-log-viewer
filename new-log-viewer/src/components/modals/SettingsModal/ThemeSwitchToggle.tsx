import {
    Button,
    ToggleButtonGroup,
    useColorScheme,
} from "@mui/joy";
import type {Mode} from "@mui/system/cssVars/useCurrentColorScheme";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

import {THEME_NAME} from "../../../typings/config";


/**
 * Renders a toggle button group for theme selection.
 *
 * @return
 */
const ThemeSwitchToggle = () => {
    const {setMode, mode} = useColorScheme();

    return (
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
    );
};

export default ThemeSwitchToggle;
