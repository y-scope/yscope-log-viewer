import React from "react";

import {Box, Typography} from "@mui/joy";

import useQueryStore from "../../../../../stores/queryStore";

import "./QueryDisplayBar.css";


/**
 * Displays the current query parameter from the URL in a separate bar.
 *
 * @return
 */
const QueryDisplayBar = () => {
    const queryString = useQueryStore((state) => state.queryString);
    
    // Only show the bar if there's a query string
    if (!queryString || queryString.trim() === "") {
        return null;
    }

    return (
        <Box className={"query-display-bar"}>
            <Typography level="body-sm" color="primary">
                <strong>Query:</strong> {queryString}
            </Typography>
        </Box>
    );
};

export default QueryDisplayBar;
