import React, { useContext } from "react";

import { ButtonGroup } from "@mui/joy";

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";

import { StateContext } from "../../contexts/StateContextProvider";
import { UI_ELEMENT } from "../../typings/states";
import { ACTION_NAME } from "../../utils/actions";
import { ignorePointerIfFastLoading, isDisabled } from "../../utils/states";
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
        isPretty,
        uiState,
        loadPageByAction,
        setIsPretty,
    } = useContext(StateContext);

    const handleNavButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = event.currentTarget.dataset;

        if (
            actionName === ACTION_NAME.PRETTY_ON ||
            actionName === ACTION_NAME.PRETTY_OFF
        ) {
            setIsPretty(!isPretty);
        }

        // Ensure `actionName` is a valid navigation action code with no args.
        if (
            actionName === ACTION_NAME.PRETTY_ON ||
            actionName === ACTION_NAME.PRETTY_OFF ||
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
                data-action-name={isPretty ? ACTION_NAME.PRETTY_OFF : ACTION_NAME.PRETTY_ON}
                title={isPretty ? "Pretty On" : "Pretty Off"}
                isActive={isPretty}
                onClick={handleNavButtonClick}
            />
            <MenuBarIconButton
                data-action-name={ACTION_NAME.FIRST_PAGE}
                title={"First page"}
                onClick={handleNavButtonClick}
            >
                <SkipPrevious/>
            </MenuBarIconButton>
            <MenuBarIconButton
                data-action-name={ACTION_NAME.PREV_PAGE}
                title={"Previous page"}
                onClick={handleNavButtonClick}
            >
                <NavigateBefore/>
            </MenuBarIconButton>

            <PageNumInput/>

            <MenuBarIconButton
                data-action-name={ACTION_NAME.NEXT_PAGE}
                title={"Next page"}
                onClick={handleNavButtonClick}
            >
                <NavigateNext/>
            </MenuBarIconButton>
            <MenuBarIconButton
                data-action-name={ACTION_NAME.LAST_PAGE}
                title={"Last page"}
                onClick={handleNavButtonClick}
            >
                <SkipNext/>
            </MenuBarIconButton>
        </ButtonGroup>
    );
};

export default NavigationBar;
