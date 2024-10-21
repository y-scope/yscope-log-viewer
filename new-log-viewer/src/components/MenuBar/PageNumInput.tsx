import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Input,
    Typography,
} from "@mui/joy";

import {StateContext} from "../../contexts/StateContextProvider";
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
    const {loadPageByAction, numPages, pageNum, uiState} = useContext(StateContext);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const disabled = isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR);

    const handleSubmit = (ev?: React.FormEvent<HTMLFormElement>) => {
        if ("undefined" !== typeof ev) {
            ev.preventDefault();
        }
        if (null === inputRef.current || false === isEditing) {
            return;
        }

        loadPageByAction({
            code: ACTION_NAME.SPECIFIC_PAGE,
            args: {pageNum: Number(inputRef.current.value)},
        });
        setIsEditing(false);
    };

    const handleBlur = () => {
        handleSubmit();
    };

    const handleInputClick = () => {
        inputRef.current?.select();
    };

    const adjustInputWidth = () => {
        if (null === inputRef.current) {
            return;
        }
        inputRef.current.style.width = "0";
        inputRef.current.style.width =
            `${inputRef.current.scrollWidth + PAGE_NUM_INPUT_FIT_EXTRA_WIDTH}px`;
    };

    const handleInputChange = () => {
        setIsEditing(true);
        adjustInputWidth();
    };

    useEffect(() => {
        if (null === inputRef.current) {
            return;
        }
        inputRef.current.value = pageNum.toString();
        adjustInputWidth();
    }, [pageNum]);

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
