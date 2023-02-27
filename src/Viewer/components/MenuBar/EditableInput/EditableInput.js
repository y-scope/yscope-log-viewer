import React, {useContext, useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";
import {Form} from "react-bootstrap";

import {ThemeContext} from "../../../../ThemeContext/ThemeContext";

import "./EditableInput.scss";

EditableInput.propTypes = {
    value: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    onChangeCallback: PropTypes.func,
};

/**
 * This callback function accepts the validated value as an input.
 * @callback OnChangeCallback
 * @param {number} page Passes the new value into the callback function.
 */

/**
 * This component provides an input which is displayed
 * as plain text and becomes editable which clicked. The
 * component currently only supports numbers but can be
 * extended to support text as well.
 *
 * @param {number} value Value of the input
 * @param {number} minValue Minimum value of the input
 * @param {number} maxValue Maximum value of the input
 * @param {OnChangeCallback} onChangeCallback Callback when new value is entered
 * @return {JSX.Element}
 */
export function EditableInput ({value, minValue, maxValue, onChangeCallback}) {
    const {theme} = useContext(ThemeContext);

    // TODO: Make width of input element grow with inputted text. Currently in
    //  edit mode, the input has a fixed width.

    const [localValue, setLocalValue] = useState(1);
    const [localValueInput, setLocalValueInput] = useState(1);
    const [editing, setEditing] = useState(false);

    const inputEl = useRef(null);

    useEffect(() => {
        // Local value mirrors the value from props
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (editing) {
            // Focus and select input when editing
            inputEl.current.focus();
            inputEl.current.select();
        }
    }, [editing]);

    const validate = () => {
        const val = Number(localValueInput);
        if (val >= minValue && val <= maxValue) {
            // Valid change, set local value
            // Call callback to pass update
            setLocalValue(val);
            setLocalValueInput(val);
            onChangeCallback(val);
        } else {
            // Invalid change, keep original value
            setLocalValue(localValue);
            setLocalValueInput(localValue);
        }
    };

    const onClick = () => {
        setLocalValueInput(localValue);
        setEditing(true);
    };

    const onSubmit = () => {
        validate();
        setEditing(false);
    };

    const onInputChange = (e) => {
        const isNumber = /^\d+$/.test(e.target.value);
        if (e.target.value === "") {
            setLocalValueInput("");
        } else if (isNumber) {
            setLocalValueInput(e.target.value);
        }
    };

    return (
        <div data-theme={theme}>
            {!editing &&
                <span className="editable-value" onClick={onClick}
                    title="Click to edit page number">
                    {localValue}
                </span>
            }
            {editing &&
                <Form onSubmit={onSubmit}>
                    <input ref={inputEl} className="editable-input" type={"text"}
                        value={localValueInput} onBlur={onSubmit} onChange={onInputChange}/>
                </Form>
            }
        </div>
    );
}
