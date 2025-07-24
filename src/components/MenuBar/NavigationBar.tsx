import React, {useCallback} from "react";

import {ButtonGroup} from "@mui/joy";

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";

import useUiStore from "../../stores/uiStore";
import useViewStore from "../../stores/viewStore";
import {UI_ELEMENT} from "../../typings/states";
import {ACTION_NAME} from "../../utils/actions";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../utils/states";
import MenuBarIconButton from "./MenuBarIconButton";
import PageNumInput from "./PageNumInput";


/**
 * Renders a navigation bar for page switching actions.
 *
 * @return
 */
const NavigationBar = () => {
    const uiState = useUiStore((state) => state.uiState);

    const handleNavButtonClick = useCallback((ev: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = ev.currentTarget.dataset;

        // Ensure `actionName` is a valid navigation action code with no args.
        if (
            actionName === ACTION_NAME.FIRST_PAGE ||
            actionName === ACTION_NAME.PREV_PAGE ||
            actionName === ACTION_NAME.NEXT_PAGE ||
            actionName === ACTION_NAME.LAST_PAGE
        ) {
            const {loadPageByAction} = useViewStore.getState();
            loadPageByAction({code: actionName, args: null});
        }
    }, []);

    return (
        <ButtonGroup
            className={ignorePointerIfFastLoading(uiState)}
            disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
            spacing={0.01}
            variant={"plain"}
        >
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
