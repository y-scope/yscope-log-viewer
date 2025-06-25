import {useCallback} from "react";

import {
    CircularProgress,
    Typography,
} from "@mui/joy";

import DownloadIcon from "@mui/icons-material/Download";

import {EXPORT_LOGS_PROGRESS_VALUE_MAX} from "../../services/LogExportManager";
import useLogExportStore, {LOG_EXPORT_STORE_DEFAULT} from "../../stores/logExportStore";
import useUiStore from "../../stores/uiStore";
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
    const uiState = useUiStore((state) => state.uiState);

    const handleExportButtonClick = useCallback(() => {
        const {exportLogs} = useLogExportStore.getState();
        exportLogs();
    }, []);

    return (
        <MenuBarIconButton
            className={ignorePointerIfFastLoading(uiState)}
            tooltipTitle={"Export logs"}
            disabled={
                (
                    LOG_EXPORT_STORE_DEFAULT.exportProgress !== exportProgress &&
                    EXPORT_LOGS_PROGRESS_VALUE_MAX !== exportProgress
                ) ||
                isDisabled(uiState, UI_ELEMENT.EXPORT_LOGS_BUTTON)
            }
            onClick={handleExportButtonClick}
        >
            {null === exportProgress ?
                <DownloadIcon/> :
                <CircularProgress
                    determinate={true}
                    thickness={3}
                    value={exportProgress * 100}
                    variant={"solid"}
                    color={EXPORT_LOGS_PROGRESS_VALUE_MAX === exportProgress ?
                        "success" :
                        "primary"}
                >
                    {EXPORT_LOGS_PROGRESS_VALUE_MAX === exportProgress ?
                        <DownloadIcon
                            color={"success"}
                            sx={{fontSize: "14px"}}/> :
                        <Typography level={"body-xs"}>
                            {Math.ceil(exportProgress * 100)}
                        </Typography>}
                </CircularProgress>}
        </MenuBarIconButton>
    );
};

export default ExportLogsButton;
