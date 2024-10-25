import {
    useEffect,
    useState,
} from "react";
import * as React from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    List,
    Stack,
    Typography,
} from "@mui/joy";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import {QueryResults} from "../../../../../typings/worker";
import Result from "./Result";

import "./ResultsGroup.css";


interface ResultsGroupProps {
    isAllExpanded: boolean,
    queryResults: QueryResults,
}

/**
 *
 * @param props
 * @param props.isAllExpanded
 * @param props.queryResults
 */
const ResultsGroup = ({
    isAllExpanded,
    queryResults,
}: ResultsGroupProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(isAllExpanded);

    const handleAccordionChange = (
        _: React.SyntheticEvent,
        newValue: boolean
    ) => {
        setIsExpanded(newValue);
    };

    // On `isAllExpanded` updates, sync current results group's expand status.
    useEffect(() => {
        setIsExpanded(isAllExpanded);
    }, [isAllExpanded]);

    return (
        <>
            {Array.from(queryResults.entries()).map(([pageNum, results]) => (
                <Accordion
                    expanded={isExpanded}
                    key={pageNum}
                    onChange={handleAccordionChange}
                >
                    <AccordionSummary
                        slotProps={{
                            button: {className: "results-group-title-button"},
                        }}
                    >
                        <Box className={"results-group-title-container"}>
                            <Stack
                                className={"results-group-title-text-container"}
                                direction={"row"}
                            >
                                <DescriptionOutlinedIcon fontSize={"inherit"}/>
                                <Typography
                                    level={"title-sm"}
                                >
                                    Page
                                    {" "}
                                    {pageNum}
                                </Typography>
                            </Stack>
                            <Chip size={"sm"}>
                                {results.length}
                            </Chip>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails className={"results-group-content"}>
                        <List size={"sm"}>
                            {results.map((r) => (
                                <Result
                                    key={r.logEventNum}
                                    matchRange={r.matchRange}
                                    message={r.message}/>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    );
};

export default ResultsGroup;
