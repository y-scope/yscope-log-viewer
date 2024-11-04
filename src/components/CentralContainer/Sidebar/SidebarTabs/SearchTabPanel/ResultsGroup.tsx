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

import {QueryResultsType} from "../../../../../typings/worker";
import Result from "./Result";

import "./ResultsGroup.css";


interface ResultsGroupProps {
    isAllExpanded: boolean,
    pageNum: number,
    results: QueryResultsType[],
}

/**
 * Renders a group of results. Each group contains a list of results from a single page.
 *
 * @param props
 * @param props.isAllExpanded
 * @param props.pageNum
 * @param props.results
 * @return
 */
const ResultsGroup = ({
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

    // On `isAllExpanded` updates, sync current results group's expand status.
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
                    {results.map((r, index) => (
                        <Result
                            key={index}
                            matchRange={r.matchRange}
                            message={r.message}/>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    );
};

export default ResultsGroup;
