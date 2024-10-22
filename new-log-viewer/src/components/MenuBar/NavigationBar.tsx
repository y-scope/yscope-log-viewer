import React, {useContext} from "react";

import {
    ButtonGroup,
    IconButton,
} from "@mui/joy";

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";

import {StateContext} from "../../contexts/StateContextProvider";
import {UI_ELEMENT} from "../../typings/states";
import {ACTION_NAME} from "../../utils/actions";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../utils/states";
import PageNumInput from "./PageNumInput";


/**
 * Renders a navigation bar for page switching actions.
 *
 * @return
 */
const NavigationBar = () => {
    const {uiState, loadPageByAction} = useContext(StateContext);

    const handleNavButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = event.currentTarget.dataset;

        // Ensure `actionName` is a valid navigation action code with no args.
        if (
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
            size={"sm"}
            spacing={0.01}
            variant={"plain"}
        >
            <IconButton
                data-action-name={ACTION_NAME.FIRST_PAGE}
                onClick={handleNavButtonClick}
            >
                <SkipPrevious/>
            </IconButton>
            <IconButton
                data-action-name={ACTION_NAME.PREV_PAGE}
                onClick={handleNavButtonClick}
            >
                <NavigateBefore/>
            </IconButton>

            <PageNumInput/>

            <IconButton
                data-action-name={ACTION_NAME.NEXT_PAGE}
                onClick={handleNavButtonClick}
            >
                <NavigateNext/>
            </IconButton>
            <IconButton
                data-action-name={ACTION_NAME.LAST_PAGE}
                onClick={handleNavButtonClick}
            >
                <SkipNext/>
            </IconButton>
        </ButtonGroup>
    );
};

export default NavigationBar;
