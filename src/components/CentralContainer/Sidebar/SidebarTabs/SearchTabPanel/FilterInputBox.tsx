import React, {useCallback} from "react";

import {
    Button,
    Textarea,
} from "@mui/joy";

import {handleErrorWithNotification} from "../../../../../stores/notificationStore";
import useQueryStore from "../../../../../stores/queryStore";
import useUiStore from "../../../../../stores/uiStore";
import useViewStore from "../../../../../stores/viewStore";
import {UI_ELEMENT} from "../../../../../typings/states";
import {CURSOR_CODE} from "../../../../../typings/worker";
import {isDisabled} from "../../../../../utils/states";

import "./FilterInputBox.css";


/**
 * Provides a text input to apply a KQL filter.
 *
 * @return
 */
const FilterInputBox = () => {
    const kqlFilterInput = useViewStore((state) => state.kqlFilterInput);
    const kqlFilter = useViewStore((state) => state.kqlFilter);
    const uiState = useUiStore((state) => state.uiState);

    const handleFilterInputChange = useCallback((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newFilterString = ev.target.value;
        const {setKqlFilterInput} = useViewStore.getState();
        setKqlFilterInput(newFilterString);
    }, []);

    const handleFilterButtonClick = useCallback(() => {
        const {setKqlFilter, filterLogs, loadPageByCursor, logEventNum} = useViewStore.getState();
        setKqlFilter(kqlFilterInput);
        filterLogs();

        (async () => {
            await loadPageByCursor({
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            });

            const {startQuery} = useQueryStore.getState();
            startQuery();
        })().catch(handleErrorWithNotification);
    }, [kqlFilterInput]);

    const isFilterInputBoxDisabled = isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX);
    const isKqlFilterModified = kqlFilter !== kqlFilterInput;

    return (
        <Textarea
            className={"filter-input-box"}
            maxRows={7}
            placeholder={"KQL filter"}
            size={"sm"}
            value={kqlFilterInput}
            endDecorator={
                <Button
                    className={"filter-button"}
                    disabled={isFilterInputBoxDisabled || !isKqlFilterModified}
                    variant={"soft"}
                    onClick={handleFilterButtonClick}
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
