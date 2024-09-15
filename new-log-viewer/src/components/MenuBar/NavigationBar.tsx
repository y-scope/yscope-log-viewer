import React, {useContext} from "react";

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";

import {StateContext} from "../../contexts/StateContextProvider";
import {UrlContext} from "../../contexts/UrlContextProvider";
import {
    ACTION_NAME,
    handleAction,
} from "../../utils/actions";
import PageNumInput from "./PageNumInput";
import SmallIconButton from "./SmallIconButton";


/**
 * Renders a navigation bar for page switching actions.
 *
 * @return
 */
const NavigationBar = () => {
    const {pageNum, numPages, loadPage} = useContext(StateContext);
    const handleNavButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = event.currentTarget.dataset as { actionName: ACTION_NAME };
        if (Object.values(ACTION_NAME).includes(actionName)) {
            handleAction(actionName, pageNum, numPages, loadPage);
        }
    };

    return (
        <>
            <SmallIconButton
                data-action-name={ACTION_NAME.FIRST_PAGE}
                onClick={handleNavButtonClick}
            >
                <SkipPrevious/>
            </SmallIconButton>
            <SmallIconButton
                data-action-name={ACTION_NAME.PREV_PAGE}
                onClick={handleNavButtonClick}
            >
                <NavigateBefore/>
            </SmallIconButton>

            <PageNumInput/>

            <SmallIconButton
                data-action-name={ACTION_NAME.NEXT_PAGE}
                onClick={handleNavButtonClick}
            >
                <NavigateNext/>
            </SmallIconButton>
            <SmallIconButton
                data-action-name={ACTION_NAME.LAST_PAGE}
                onClick={handleNavButtonClick}
            >
                <SkipNext/>
            </SmallIconButton>
        </>
    );
};

export default NavigationBar;
