import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {Typography} from "@mui/joy";
import Input from "@mui/joy/Input";

import {StateContext} from "../../contexts/StateContextProvider";

import "./PageNumInput.css";


const PAGE_NUM_INPUT_FIT_EXTRA_WIDTH = 2;


/**
 * Renders a component for inputting page number.
 *
 * @return
 */
const PageNumInput = () => {
    const {loadPage, numPages, pageNum} = useContext(StateContext);
    const adjustedPageNum = (null === pageNum) ?
        0 :
        pageNum;

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (ev?: React.FormEvent<HTMLFormElement>) => {
        if ("undefined" !== typeof ev) {
            ev.preventDefault();
        }
        if (null === inputRef.current || false === isEditing) {
            return;
        }

        loadPage(Number(inputRef.current.value));
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
        inputRef.current.style.width = `${inputRef.current.scrollWidth + PAGE_NUM_INPUT_FIT_EXTRA_WIDTH}px`;
    };

    const handleInputChange = () => {
        setIsEditing(true);
        adjustInputWidth();
    };

    useEffect(() => {
        if (null === inputRef.current) {
            return;
        }
        inputRef.current.value = adjustedPageNum.toString();
        adjustInputWidth();
    }, [adjustedPageNum]);

    return (
        <form
            onSubmit={handleSubmit}
        >
            <Input
                className={"page-num-input"}
                size={"sm"}
                slotProps={{input: {ref: inputRef}}}
                type={"number"}
                endDecorator={
                    <Typography
                        className={"page-num-input-num-pages-text"}
                        level={"body-md"}
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
