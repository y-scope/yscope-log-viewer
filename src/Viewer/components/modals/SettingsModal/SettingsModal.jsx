import PropTypes from "prop-types";
import React, {useContext} from "react";
import {
    Button, Form, Modal,
} from "react-bootstrap";
import {
    Moon, Sun,
} from "react-bootstrap-icons";

import {THEME_NAMES} from "../../../../ThemeContext/constants";
import {ThemeContext} from "../../../../ThemeContext/ThemeContext";


/**
 * Represents a settings modal component.
 *
 * @param {boolean} isOpen
 * @param {string} modalClass
 * @param {string} value
 * @param {function} onChange
 * @param {function} onClose
 * @param {function} onSubmit
 * @returns {JSX.Element}
 */
const SettingsModal = ({
    isOpen,
    modalClass,
    value,
    onChange,
    onClose,
    onSubmit,
}) => {
    const {theme, changeTheme} = useContext(ThemeContext);

    return (
        <Modal
            className={"border-0"}
            contentClassName={modalClass}
            show={isOpen}
            onHide={onClose}
        >
            <Modal.Header className={"modal-background border-0"}>
                <div className={"float-left"}>
                    App Settings
                </div>
                <div className={"float-right"}>
                    {THEME_NAMES.LIGHT === theme ?
                        <Moon
                            className={"cursor-pointer"}
                            title={"Set Light Mode"}
                            onClick={() => changeTheme(THEME_NAMES.DARK)}/> :
                        <Sun
                            className={"cursor-pointer"}
                            title={"Set Dark Mode"}
                            onClick={() => changeTheme(THEME_NAMES.LIGHT)}/>}
                </div>
            </Modal.Header>
            <Modal.Body className={"modal-background p-3 pt-1"}>
                <label className={"mb-2"}>Log Events per Page</label>
                <Form onSubmit={onSubmit}>
                    <Form.Control
                        className={"input-sm num-event-input"}
                        type={"number"}
                        value={value}
                        onChange={onChange}/>
                </Form>
            </Modal.Body>
            <Modal.Footer className={"modal-background border-0"}>
                <Button
                    className={"btn-sm"}
                    variant={"success"}
                    onClick={onSubmit}
                >
                    Save Changes
                </Button>
                <Button
                    className={"btn-sm"}
                    variant={"secondary"}
                    onClick={onClose}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

SettingsModal.propTypes = {
    isOpen: PropTypes.bool,
    modalClass: PropTypes.any,
    value: PropTypes.any,

    onChange: PropTypes.func,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
};


export default SettingsModal;
