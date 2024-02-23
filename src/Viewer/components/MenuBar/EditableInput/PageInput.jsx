import React from "react";

import {VSCodeTextField} from "@vscode/webview-ui-toolkit/react";
import PropTypes from "prop-types";

import "./PageInput.scss";


/**
 * This callback function accepts the validated value as an input.
 * @callback OnSubmitCallback
 * @param {number} page Passes the new value into the callback function.
 */

/**
 * FIXME: update
 * This component provides an input which is displayed
 * as plain text and becomes editable which clicked. The
 * component currently only supports numbers but can be
 * extended to support text as well.
 *
 * @param {number} value Value of the input
 * @param {number} minValue Minimum value of the input
 * @param {number} maxValue Maximum value of the input
 * @param {OnSubmitCallback} onSubmit Callback when new value is entered
 * @return {JSX.Element}
 */
const PageInput = ({value, minValue, maxValue, onSubmit}) => {
    // TODO: Make width of input element grow with inputted text. Currently in
    //  edit mode, the input has a fixed width.

    const handleTextFieldChange = (ev)=> {
        const value = parseInt(ev.target.value);
        if (value >= minValue && value <= maxValue) {
            onSubmit(value);
        }
    };

    return (
        <VSCodeTextField
            id={"page-input"}
            type={"text"}
            value={value.toString(10)}
            onChange={handleTextFieldChange}
            style={{"--page-input-control-width": `${maxValue.toString(10).length}ch`}}
        >
            <section
                slot="end"
            >
                / {maxValue}
            </section>
        </VSCodeTextField>
    );
};

PageInput.propTypes = {
    value: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    onSubmit: PropTypes.func,
};

export default PageInput;
