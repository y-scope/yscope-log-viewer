import {
    CircularProgress,
    Typography,
} from "@mui/joy";

import DownloadIcon from "@mui/icons-material/Download";

import useLogExportStore, {LOG_EXPORT_STORE_DEFAULT} from "../../contexts/states/logExportStore";
import useUiStore from "../../contexts/states/uiStore";
import {
    EXPORT_LOGS_PROGRESS_VALUE_MAX,
    EXPORT_LOGS_PROGRESS_VALUE_MIN,
} from "../../services/LogExportManager";
import {UI_ELEMENT} from "../../typings/states";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../utils/states";
import MenuBarIconButton from "./MenuBarIconButton";


/**
 * Represents a button for triggering log exports and displays the progress.
 *
 * @return
 */
const ExportLogsButton = () => {
    const exportProgress = useLogExportStore((state) => state.exportProgress);
    const exportLogs = useLogExportStore((state) => state.exportLogs);
    const uiState = useUiStore((state) => state.uiState);

    return (
        <MenuBarIconButton
            className={ignorePointerIfFastLoading(uiState)}
            tooltipTitle={"Export logs"}
            disabled={
                (0 !== exportProgress && EXPORT_LOGS_PROGRESS_VALUE_MAX !== exportProgress) ||
                isDisabled(uiState, UI_ELEMENT.EXPORT_LOGS_BUTTON)
            }
            onClick={exportLogs}
        >
            {LOG_EXPORT_STORE_DEFAULT.exportProgress !== exportProgress &&
            EXPORT_LOGS_PROGRESS_VALUE_MIN === exportProgress ?
                <DownloadIcon/> :
                <CircularProgress
                    determinate={true}
                    thickness={3}
                    variant={"solid"}
                    color={EXPORT_LOGS_PROGRESS_VALUE_MAX === exportProgress ?
                        "success" :
                        "primary"}
                    value={null === exportProgress ?
                        0 :
                        exportProgress * 100}
                >
                    {EXPORT_LOGS_PROGRESS_VALUE_MAX === exportProgress ?
                        <DownloadIcon
                            color={"success"}
                            sx={{fontSize: "14px"}}/> :
                        <Typography level={"body-xs"}>
                            {Math.ceil(null === exportProgress ?
                                0 :
                                exportProgress * 100)}
                        </Typography>}
                </CircularProgress>}
        </MenuBarIconButton>
    );
};

export default ExportLogsButton;
