import React, {useContext, useState} from "react";

import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import {Moon, Sun} from "react-bootstrap-icons";

import {THEME_STATES} from "../../../../ThemeContext/THEME_STATES";
import {ThemeContext} from "../../../../ThemeContext/ThemeContext";

import "./SettingsModal.scss";

SettingsModal.propTypes = {
    handleClose: PropTypes.func,
    saveChangesCallback: PropTypes.func,
    initialEventsPerPage: PropTypes.number,
};

/**
 * This callback saves the changes executed in the modal.
 *
 * @callback SaveChangesCallback
 * @param {number} eventsPerPage Number of events to display per page
 */

/**
 * This component provides the body of the settings modal.
 *
 * @param {function} handleClose Closes the modal
 * @param {SaveChangesCallback} saveChangesCallback Callback to save the changes
 * @param {number} initialEventsPerPage Initial number of events per page
 * @return {JSX.Element}
 */
export function SettingsModal ({handleClose, saveChangesCallback, initialEventsPerPage}) {
    const {theme, switchTheme} = useContext(ThemeContext);

    const [eventsPerPage, setEventsPerPage] = useState(initialEventsPerPage);

    const getThemeIcon = () => {
        if (THEME_STATES.LIGHT === theme) {
            return (
                <Moon style={{cursor: "pointer"}} title="Set Light Mode"
                    onClick={() => switchTheme(THEME_STATES.DARK)}/>
            );
        } else if (THEME_STATES.DARK === theme) {
            return (
                <Sun style={{cursor: "pointer"}} title="Set Dark Mode"
                    onClick={() => switchTheme(THEME_STATES.LIGHT)}/>
            );
        }
    };

    const saveModalChanges = (e) => {
        // TODO Can't backspace 0 from the number input
        e.preventDefault();
        saveChangesCallback(eventsPerPage);
        handleClose();
    };

    return (
        <>
            <Modal.Header className="modal-background border-0" >
                <div className="float-left">
                    App Settings
                </div>
                <div className="float-right">
                    {getThemeIcon()}
                </div>
            </Modal.Header>
            <Modal.Body className="modal-background p-3 pt-1" >
                <label className="mb-2">Log Events per Page</label>
                <Form onSubmit={saveModalChanges}>
                    <Form.Control type="number"
                        value={eventsPerPage}
                        onChange={(e) => setEventsPerPage(Number(e.target.value))}
                        className="input-sm num-event-input" />
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-background border-0" >
                <Button className="btn-sm" variant="success" onClick={saveModalChanges}>
                    Save Changes
                </Button>
                <Button className="btn-sm" variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </>
    );
}
