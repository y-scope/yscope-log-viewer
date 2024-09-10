import React from "react";

import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";


interface StatusBarProps {
    handleCopyLinkButtonClick: () => void;
    logEventNum: number | null;
    numEvents: number | null;
}

const StatusBar = ({handleCopyLinkButtonClick, logEventNum, numEvents}: StatusBarProps) => {
    return (
        <Sheet className={"status-bar"}>
            <Typography
                className={"status-message"}
                level={"body-sm"}
            >
                Status message
            </Typography>
            <Button
                className={"status-button"}
                size={"sm"}
                onClick={handleCopyLinkButtonClick}
            >
                Log Event
                {" "}
                {logEventNum}
                {" "}
                of
                {" "}
                {numEvents}
            </Button>
        </Sheet>
    );
};
