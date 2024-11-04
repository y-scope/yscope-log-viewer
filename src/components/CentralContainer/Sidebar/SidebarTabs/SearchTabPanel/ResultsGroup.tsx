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
 * Renders a group of results. Each group contains a list of results from a single page.
 *
 * @param props
 * @param props.isAllExpanded
 * @param props.queryResults
 * @return
 */
const ResultsGroup = ({
    isAllExpanded,
    queryResults,
}: ResultsGroupProps) => {
    const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});
    const handleAccordionChange = (
        pageNum: number
    ) => (_: React.SyntheticEvent, newValue: boolean) => {
        setExpandedMap((prev) => ({
            ...prev,
            [pageNum]: newValue,
        }));
    };

    // On `isAllExpanded` updates, sync current results group's expand status.
    useEffect(() => {
        const newExpandedMap = Object.fromEntries(
            Object.entries(expandedMap).map(([key]) => [key,
                isAllExpanded])
        );

        setExpandedMap(newExpandedMap);
    }, [isAllExpanded]);

    useEffect(() => {
        setExpandedMap((prevMap) => {
            const updatedMap = {...prevMap};
            queryResults.forEach((_, pageNum) => {
                // Only set for entries not already in expandedMap
                if (!(pageNum in updatedMap)) {
                    updatedMap[pageNum] = isAllExpanded;
                }
            });

            return updatedMap;
        });
    }, [
        isAllExpanded,
        queryResults,
    ]);

    return (
        <>
            {Array.from(queryResults.entries()).map(([pageNum, results]) => (
                <Accordion
                    expanded={expandedMap[pageNum] ?? isAllExpanded}
                    key={pageNum}
                    onChange={handleAccordionChange(pageNum)}
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
