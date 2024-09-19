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
import SmallIconButton from "./SmallIconButton";


/**
 * Represents a button for triggering log exports and displays the progress.
 *
 * @return
 */
const ExportLogsButton = () => {
    const {exportLogs, exportProgress, fileName} = useContext(StateContext);

    return (
        <SmallIconButton
            disabled={
                // eslint-disable-next-line no-warning-comments
                // TODO: Replace `"" === fileName` with a more specific context variable that
                // indicates whether the file has been loaded.
                (null !== exportProgress && EXPORT_LOG_PROGRESS_VALUE_MAX !== exportProgress) ||
                    "" === fileName
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
