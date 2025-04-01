import {useContext} from "react";

import {
    CircularProgress,
    Typography,
} from "@mui/joy";

import DownloadIcon from "@mui/icons-material/Download";

import {StateContext} from "../../contexts/StateContextProvider";
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
    const {exportLogs, exportProgress, uiState} = useContext(StateContext);

    return (
        <MenuBarIconButton
            className={ignorePointerIfFastLoading(uiState)}
            title={"Export logs"}
            disabled={
                (0 !== exportProgress && EXPORT_LOGS_PROGRESS_VALUE_MAX !== exportProgress) ||
                isDisabled(uiState, UI_ELEMENT.EXPORT_LOGS_BUTTON)
            }
            onClick={exportLogs}
        >
            {0 === exportProgress || EXPORT_LOGS_PROGRESS_VALUE_MIN === exportProgress ?
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
