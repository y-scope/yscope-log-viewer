import {Modal} from "@mui/joy";

import SettingsDialog from "./SettingsDialog";

import "./index.css";


interface SettingsModalProps {
    isOpen: boolean,
    onClose: () => void
}

/**
 * Renders a modal for setting configurations.
 *
 * @param props
 * @param props.isOpen
 * @param props.onClose
 * @return
 */
const SettingsModal = ({isOpen, onClose}: SettingsModalProps) => {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
        >
            <SettingsDialog/>
        </Modal>
    );
};

export default SettingsModal;
