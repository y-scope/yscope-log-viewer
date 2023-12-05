import React from "react";

import PropTypes from "prop-types";
import {Button, Modal, Table} from "react-bootstrap";

import "./HelpModal.scss";

HelpModal.propTypes = {
    handleClose: PropTypes.func,
};

/**
 * This component provides the body of the help modal.
 *
 * @param {function} handleClose Closes the modal
 * @return {JSX.Element}
 */
export function HelpModal ({handleClose}) {
    return (
        <>
            <Modal.Header className="modal-background" >
                <div className="float-left">
                    Keyboard Shortcuts
                </div>
            </Modal.Header>
            <Modal.Body className="modal-background p-3 pt-2" >
                <Table borderless style={{fontSize: "15px"}} >
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Windows</th>
                            <th>macOS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Focus on Editor</td>
                            <td>
                                <kbd>`</kbd>
                            </td>
                            <td>
                                <kbd>`</kbd>
                            </td>
                        </tr>
                        <tr>
                            <td>Next Page</td>
                            <td>
                                <kbd>CTRL</kbd>+<kbd>]</kbd>
                            </td>
                            <td>
                                <kbd>⌘</kbd>+<kbd>]</kbd>
                            </td>
                        </tr>
                        <tr>
                            <td>Prev Page</td>
                            <td>
                                <kbd>CTRL</kbd>+<kbd>[</kbd>
                            </td>
                            <td>
                                <kbd>⌘</kbd>+<kbd>[</kbd>
                            </td>
                        </tr>
                        <tr>
                            <td>First Page</td>
                            <td>
                                <kbd>CTRL</kbd>+<kbd>,</kbd>
                            </td>
                            <td>
                                <kbd>⌘</kbd>+<kbd>,</kbd>
                            </td>
                        </tr>
                        <tr>
                            <td>Last Page</td>
                            <td>
                                <kbd>CTRL</kbd>+<kbd>.</kbd>
                            </td>
                            <td>
                                <kbd>⌘</kbd>+<kbd>.</kbd>
                            </td>
                        </tr>
                        <tr>
                            <td>Top of Page</td>
                            <td>
                                <kbd>CTRL</kbd>+<kbd>U</kbd>
                            </td>
                            <td>
                                <kbd>⌘</kbd>+<kbd>U</kbd>
                            </td>
                        </tr>
                        <tr>
                            <td>End of Page</td>
                            <td>
                                <kbd>CTRL</kbd>+<kbd>I</kbd>
                            </td>
                            <td>
                                <kbd>⌘</kbd>+<kbd>I</kbd>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer className="modal-background" >
                <Button className="btn-sm" variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </>
    );
}
