import React, {
    useContext,
    useState,
} from "react";

import {
    LinearProgress,
    Stack,
    Textarea,
} from "@mui/joy";

import {StateContext} from "../../../../../contexts/StateContextProvider";
import {
    QUERY_PROGRESS_VALUE_MAX,
    QueryArgs,
} from "../../../../../typings/query";
import {UI_ELEMENT} from "../../../../../typings/states";
import {isDisabled} from "../../../../../utils/states";
import ToggleIconButton from "./ToggleIconButton";

import "./QueryInputBox.css";


/**
 * Provides a text input and optional toggles for submitting search queries.
 *
 * @return
 */
const QueryInputBox = () => {
    const {queryProgress, startQuery, uiState} = useContext(StateContext);

    const [queryString, setQueryString] = useState<string>("");
    const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false);
    const [isRegex, setIsRegex] = useState<boolean>(false);

    const handleQuerySubmit = (newArgs: Partial<QueryArgs>) => {
        startQuery({
            isCaseSensitive: isCaseSensitive,
            isRegex: isRegex,
            queryString: queryString,
            ...newArgs,
        });
    };

    const handleQueryInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQueryString(ev.target.value);
        handleQuerySubmit({queryString: ev.target.value});
    };

    const handleCaseSensitivityButtonClick = () => {
        handleQuerySubmit({isCaseSensitive: !isCaseSensitive});
        setIsCaseSensitive(!isCaseSensitive);
    };

    const handleRegexButtonClick = () => {
        handleQuerySubmit({isRegex: !isRegex});
        setIsRegex(!isRegex);
    };

    const isQueryInputBoxDisabled = isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX);

    return (
        <div className={"query-input-box-with-progress"}>
            <Textarea
                className={"query-input-box"}
                maxRows={7}
                placeholder={"Search"}
                size={"sm"}
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
