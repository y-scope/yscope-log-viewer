import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Input,
    Typography,
} from "@mui/joy";

import useUiStore from "../../stores/uiStore";
import useViewStore from "../../stores/viewStore";
import {UI_ELEMENT} from "../../typings/states";
import {ACTION_NAME} from "../../utils/actions";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../utils/states";

import "./PageNumInput.css";


const PAGE_NUM_INPUT_FIT_EXTRA_WIDTH = 2;


/**
 * Renders a component for inputting page number.
 *
 * @return
 */
const PageNumInput = () => {
    const uiState = useUiStore((state) => state.uiState);
    const numPages = useViewStore((state) => state.numPages);
    const pageNum = useViewStore((state) => state.pageNum);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const disabled = isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR);

    const handleSubmit = useCallback((ev?: React.FormEvent<HTMLFormElement>) => {
        if ("undefined" !== typeof ev) {
            ev.preventDefault();
        }
        if (null === inputRef.current || false === isEditing) {
            return;
        }

        const {loadPageByAction} = useViewStore.getState();
        loadPageByAction({
            code: ACTION_NAME.SPECIFIC_PAGE,
            args: {pageNum: Number(inputRef.current.value)},
        });
        setIsEditing(false);
    }, [isEditing]);

    const handleBlur = useCallback(() => {
        handleSubmit();
    }, [handleSubmit]);

    const handleInputClick = useCallback(() => {
        inputRef.current?.select();
    }, []);

    const adjustInputWidth = useCallback(() => {
        if (null === inputRef.current) {
            return;
        }
        inputRef.current.style.width = "0";
        inputRef.current.style.width =
            `${inputRef.current.scrollWidth + PAGE_NUM_INPUT_FIT_EXTRA_WIDTH}px`;
    }, []);

    const handleInputChange = useCallback(() => {
        setIsEditing(true);
        adjustInputWidth();
    }, [adjustInputWidth]);

    useEffect(() => {
        if (null === inputRef.current) {
            return;
        }
        inputRef.current.value = pageNum.toString();
        adjustInputWidth();
    }, [
        pageNum,
        adjustInputWidth,
    ]);

    return (
        <form
            onSubmit={handleSubmit}
        >
            <Input
                className={`page-num-input ${ignorePointerIfFastLoading(uiState)}`}
                disabled={disabled}
                size={"sm"}
                slotProps={{input: {ref: inputRef}}}
                type={"number"}
                endDecorator={
                    <Typography
                        level={"body-md"}
                        className={`page-num-input-num-pages-text ${disabled ?
                            "page-num-input-num-pages-text-disabled" :
                            ""}`}
                    >
                        {"/ "}
                        {numPages}
                    </Typography>
                }
                onBlur={handleBlur}
                onChange={handleInputChange}
                onClick={handleInputClick}/>
        </form>
    );
};

export default PageNumInput;
