import {useContext} from "react";

import {
    CircularProgress,
    Typography,
} from "@mui/joy";

import DownloadIcon from "@mui/icons-material/Download";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    EXPORT_LOG_PROGRESS_VALUE_MAX,
    EXPORT_LOG_PROGRESS_VALUE_MIN,
} from "../../services/LogExportManager";
import {UI_ELEMENT} from "../../typings/states";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../utils/states";
import SmallIconButton from "./SmallIconButton";


/**
 * Represents a button for triggering log exports and displays the progress.
 *
 * @return
 */
const ExportLogsButton = () => {
    const {exportLogs, exportProgress, uiState} = useContext(StateContext);

    return (
        <SmallIconButton
            className={ignorePointerIfFastLoading(uiState)}
            disabled={
                (null !== exportProgress && EXPORT_LOG_PROGRESS_VALUE_MAX !== exportProgress) ||
                isDisabled(uiState, UI_ELEMENT.EXPORT_LOGS_BUTTON)
            }
            onClick={exportLogs}
        >
            {null === exportProgress || EXPORT_LOG_PROGRESS_VALUE_MIN === exportProgress ?
                <DownloadIcon/> :
                <CircularProgress
                    determinate={true}
                    thickness={3}
                    value={exportProgress * 100}
                    variant={"solid"}
                    color={EXPORT_LOG_PROGRESS_VALUE_MAX === exportProgress ?
                        "success" :
                        "primary"}
                >
                    {EXPORT_LOG_PROGRESS_VALUE_MAX === exportProgress ?
                        <DownloadIcon
                            color={"success"}
                            sx={{fontSize: "14px"}}/> :
                        <Typography level={"body-xs"}>
                            {Math.ceil(exportProgress * 100)}
                        </Typography>}
                </CircularProgress>}
        </SmallIconButton>
    );
};

export default ExportLogsButton;
