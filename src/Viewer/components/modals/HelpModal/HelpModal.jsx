import PropTypes from "prop-types";
import React from "react";
import {
    Button, Modal,
} from "react-bootstrap";

import ShortcutsTable from "./ShortcutsTable";


/**
 * Renders a Help Modal.
 *
 * @param {boolean} isOpen
 * @param {string} modalClass
 * @param {string} theme
 * @param {function} onClose
 * @returns {JSX.Element}
 */
const HelpModal = ({
    theme,
    modalClass,
    isOpen,
    onClose,
}) => (
    <Modal
        className={"help-modal border-0"}
        contentClassName={modalClass}
        data-theme={theme}
        show={isOpen}
        onHide={onClose}
    >
        <Modal.Header className={"modal-background"}>
            <div className={"float-left"}>
                Keyboard Shortcuts
            </div>
        </Modal.Header>
        <Modal.Body className={"modal-background p-3 pt-2"}>
            <ShortcutsTable/>
        </Modal.Body>
        <Modal.Footer className={"modal-background"}>
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

HelpModal.propTypes = {
    modalClass: PropTypes.any,
    theme: PropTypes.any,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
};

export default HelpModal;
