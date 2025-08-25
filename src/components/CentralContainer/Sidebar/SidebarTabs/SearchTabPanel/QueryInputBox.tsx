import React, {useCallback} from "react";

import {
    LinearProgress,
    Stack,
    Textarea,
} from "@mui/joy";

import useQueryStore from "../../../../../stores/queryStore";
import useUiStore from "../../../../../stores/uiStore";
import {QUERY_PROGRESS_VALUE_MAX} from "../../../../../typings/query";
import {UI_ELEMENT} from "../../../../../typings/states";
import {isDisabled} from "../../../../../utils/states";
import {updateWindowUrlHashParams} from "../../../../../utils/url";
import ToggleIconButton from "./ToggleIconButton";

import "./QueryInputBox.css";


/**
 * Provides a text input and optional toggles for submitting search queries.
 *
 * @return
 */
const QueryInputBox = () => {
    const isCaseSensitive = useQueryStore((state) => state.queryIsCaseSensitive);
    const isRegex = useQueryStore((state) => state.queryIsRegex);
    const querystring = useQueryStore((state) => state.queryString);
    const queryProgress = useQueryStore((state) => state.queryProgress);
    const uiState = useUiStore((state) => state.uiState);

    const handleQueryInputChange = useCallback((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newQueryString = ev.target.value;
        updateWindowUrlHashParams({subquery: newQueryString});
        const {setQueryString, startQuery} = useQueryStore.getState();
        setQueryString(newQueryString);
        startQuery();
    }, []);

    const handleCaseSensitivityButtonClick = useCallback(() => {
        const newQueryIsSensitive = !isCaseSensitive;
        updateWindowUrlHashParams({queryIsCaseSensitive: newQueryIsSensitive});
        const {setQueryIsCaseSensitive, startQuery} = useQueryStore.getState();
        setQueryIsCaseSensitive(newQueryIsSensitive);
        startQuery();
    }, [isCaseSensitive]);

    const handleRegexButtonClick = useCallback(() => {
        const newQueryIsRegex = !isRegex;
        updateWindowUrlHashParams({queryIsRegex: newQueryIsRegex});
        const {setQueryIsRegex, startQuery} = useQueryStore.getState();
        setQueryIsRegex(newQueryIsRegex);
        startQuery();
    }, [isRegex]);

    const isQueryInputBoxDisabled = isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX);

    return (
        <div className={"query-input-box-with-progress"}>
            <Textarea
                className={"query-input-box"}
                maxRows={7}
                placeholder={"Search"}
                size={"sm"}
                value={querystring}
                endDecorator={
                    <Stack
                        direction={"row"}
                        spacing={0.25}
                    >
                        <ToggleIconButton
                            className={"query-option-button"}
                            disabled={isQueryInputBoxDisabled}
                            isChecked={isCaseSensitive}
                            size={"sm"}
                            tooltipTitle={"Match case"}
                            variant={"plain"}
                            onClick={handleCaseSensitivityButtonClick}
                        >
                            Aa
                        </ToggleIconButton>

                        <ToggleIconButton
                            className={"query-option-button"}
                            disabled={isQueryInputBoxDisabled}
                            isChecked={isRegex}
                            size={"sm"}
                            tooltipTitle={"Use regular expression"}
                            variant={"plain"}
                            onClick={handleRegexButtonClick}
                        >
                            .*
                        </ToggleIconButton>
                    </Stack>
                }
                slotProps={{
                    textarea: {
                        className: "query-input-box-textarea",
                        disabled: isQueryInputBoxDisabled,
                    },
                    endDecorator: {className: "query-input-box-end-decorator"},
                }}
                onChange={handleQueryInputChange}/>
            <LinearProgress
                className={"query-input-box-linear-progress"}
                determinate={true}
                thickness={4}
                value={queryProgress * 100}
                color={QUERY_PROGRESS_VALUE_MAX === queryProgress ?
                    "success" :
                    "primary"}/>
        </div>
    );
};


export default QueryInputBox;
