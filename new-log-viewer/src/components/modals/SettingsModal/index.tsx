import Modal from "@mui/joy/Modal";

import SettingsDialog from "./SettingsDialog";

import "./index.css";


/**
 * ConfigModal component.
 *
 * @param props The component props.
 * @param props.isOpen Determines if the modal is open.
 * @param props.onClose Function to call when the modal is closed.
 * @return The rendered ConfigModal component.
 */
const ConfigModal = ({isOpen, onClose}: { isOpen: boolean, onClose: () => void }) => {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
        >
            <SettingsDialog/>
        </Modal>
    );
};

export default ConfigModal;
