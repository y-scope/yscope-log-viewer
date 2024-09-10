import Modal from "@mui/joy/Modal";

import ConfigDialog from "./ConfigDialog";


/**
 *
 * @param isOpen.isOpen
 * @param isOpen
 * @param onClose
 * @param isOpen.onClose
 */
const ConfigModal = ({isOpen, onClose}: { isOpen: boolean, onClose: () => void }) => {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
        >
            <ConfigDialog/>
        </Modal>
    );
};

export default ConfigModal;
