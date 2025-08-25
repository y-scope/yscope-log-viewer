import React, {useCallback} from "react";

import {
    Button,
    Textarea,
} from "@mui/joy";

import useUiStore from "../../../../../stores/uiStore";
import useViewStore from "../../../../../stores/viewStore";
import {UI_ELEMENT} from "../../../../../typings/states";
import {isDisabled} from "../../../../../utils/states";

import "./FilterInputBox.css";


/**
 * Provides a text input to apply a KQL filter.
 *
 * @return
 */
const FilterInputBox = () => {
    const filterApplied = useViewStore((state) => state.isFilterApplied);
    const filterString = useViewStore((state) => state.kqlFilter);
    const uiState = useUiStore((state) => state.uiState);

    const handleFilterInputChange = useCallback((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newFilterString = ev.target.value;
        const {setKqlFilter} = useViewStore.getState();
        setKqlFilter(newFilterString);
    }, []);

    const handleButtonClick = useCallback(() => {
        const {filterLogs} = useViewStore.getState();
        filterLogs();
    }, []);

    const isFilterInputBoxDisabled = isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX);

    return (
        <Textarea
            className={"filter-input-box"}
            maxRows={7}
            placeholder={"KQL filter"}
            size={"sm"}
            value={filterString}
            endDecorator={
                <Button
                    className={"filter-button"}
                    disabled={filterApplied || isFilterInputBoxDisabled}
                    variant={"soft"}
                    onClick={handleButtonClick}
                >
                    {" "}
                    Filter
                </Button>
            }
            slotProps={{textarea: {
                disabled: isFilterInputBoxDisabled,
                className: "filter-input-box-textarea",
            },
            endDecorator: {className: "filter-input-box-end-decorator"}}}
            onChange={handleFilterInputChange}/>
    );
};


export default FilterInputBox;
