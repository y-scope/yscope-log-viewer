import React, {useContext} from "react";

import {ButtonGroup} from "@mui/joy";

import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import AutoFixOffRoundedIcon from "@mui/icons-material/AutoFixOffRounded";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";

import {StateContext} from "../../contexts/StateContextProvider";
import {UrlContext} from "../../contexts/UrlContextProvider";
import {UI_ELEMENT} from "../../typings/states";
import {ACTION_NAME} from "../../utils/actions";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../utils/states";
import MenuBarIconButton from "./MenuBarIconButton";
import MenuBarToggleButton from "./MenuBarToggleButton";
import PageNumInput from "./PageNumInput";


/**
 * Renders a navigation bar for page switching actions.
 *
 * @return
 */
const NavigationBar = () => {
    const {
        uiState,
        loadPageByAction,
    } = useContext(StateContext);
    const {isPrettified} = useContext(UrlContext);

    const handleNavButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = event.currentTarget.dataset;

        // Ensure `actionName` is a valid navigation action code with no args.
        if (
            actionName === ACTION_NAME.TOGGLE_PRETTIFY ||
            actionName === ACTION_NAME.FIRST_PAGE ||
            actionName === ACTION_NAME.PREV_PAGE ||
            actionName === ACTION_NAME.NEXT_PAGE ||
            actionName === ACTION_NAME.LAST_PAGE
        ) {
            loadPageByAction({code: actionName, args: null});
        }
    };

    return (
        <ButtonGroup
            className={ignorePointerIfFastLoading(uiState)}
            disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
            spacing={0.01}
            variant={"plain"}
        >
            <MenuBarToggleButton
                data-action-name={ACTION_NAME.TOGGLE_PRETTIFY}
                isActive={!isPrettified}
                offIcon={<AutoFixOffRoundedIcon/>}
                tooltipTitle={isPrettified ?? false ?
                    "Prettify Off" :
                    "Prettify On"}
                onClick={handleNavButtonClick}
                onIcon={<AutoFixHighRoundedIcon/>}/>
            <MenuBarIconButton
                data-action-name={ACTION_NAME.FIRST_PAGE}
                tooltipTitle={"First page"}
                onClick={handleNavButtonClick}
            >
                <SkipPrevious/>
            </MenuBarIconButton>
            <MenuBarIconButton
                data-action-name={ACTION_NAME.PREV_PAGE}
                tooltipTitle={"Previous page"}
                onClick={handleNavButtonClick}
            >
                <NavigateBefore/>
            </MenuBarIconButton>

            <PageNumInput/>

            <MenuBarIconButton
                data-action-name={ACTION_NAME.NEXT_PAGE}
                tooltipTitle={"Next page"}
                onClick={handleNavButtonClick}
            >
                <NavigateNext/>
            </MenuBarIconButton>
            <MenuBarIconButton
                data-action-name={ACTION_NAME.LAST_PAGE}
                tooltipTitle={"Last page"}
                onClick={handleNavButtonClick}
            >
                <SkipNext/>
            </MenuBarIconButton>
        </ButtonGroup>
    );
};

export default NavigationBar;
