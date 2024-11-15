import React, {
    memo,
    useEffect,
    useState,
} from "react";

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

import {QueryResultsType} from "../../../../../typings/worker";
import Result from "./Result";

import "./ResultsGroup.css";


interface ResultsGroupProps {
    isAllExpanded: boolean,
    pageNum: number,
    results: QueryResultsType[],
}

/**
 * Renders a group of results, where each group represents a list of results from a single page.
 *
 * @param props
 * @param props.isAllExpanded
 * @param props.pageNum
 * @param props.results
 * @return
 */
const ResultsGroup = memo(({
    isAllExpanded,
    pageNum,
    results,
}: ResultsGroupProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(isAllExpanded);

    const handleAccordionChange = (
        _: React.SyntheticEvent,
        newValue: boolean
    ) => {
        setIsExpanded(newValue);
    };

    // On `isAllExpanded` update, sync current results group's expand status.
    useEffect(() => {
        setIsExpanded(isAllExpanded);
    }, [isAllExpanded]);

    return (
        <Accordion
            expanded={isExpanded}
            onChange={handleAccordionChange}
        >
            <AccordionSummary
                slotProps={{
                    button: {className: "results-group-summary-button"},
                }}
            >
                <Box className={"results-group-summary-container"}>
                    <Stack
                        className={"results-group-summary-text-container"}
                        direction={"row"}
                    >
                        <DescriptionOutlinedIcon fontSize={"inherit"}/>
                        <Typography
                            fontFamily={"Inter"}
                            level={"title-sm"}
                        >
                            {"Page "}
                            {pageNum}
                        </Typography>
                    </Stack>
                    <Chip
                        className={"results-group-summary-count"}
                        size={"sm"}
                        variant={"solid"}
                    >
                        {results.length}
                    </Chip>
                </Box>
            </AccordionSummary>
            <AccordionDetails
                className={"results-group-details"}
                slotProps={{content: {className: "results-group-details-content"}}}
            >
                <List size={"sm"}>
                    {results.map((r, index) => (
                        <Result
                            key={index}
                            logEventNum={r.logEventNum}
                            matchRange={r.matchRange}
                            message={r.message}/>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    );
});

ResultsGroup.displayName = "ResultsGroup";


export default ResultsGroup;
