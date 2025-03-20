import {useContext} from "react";

import {List} from "@mui/joy";

import {StateContext} from "../../../../contexts/StateContextProvider";
import {LLM_REQUEST_STATUS} from "../../../../typings/llm";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../typings/tab";
import {formatPromptWithLog} from "../../../../utils/llm";
import CustomTabPanel from "./CustomTabPanel";
import LlmMessageListItem from "./LlmMessageListItem";


const NOT_YET_INITIATED_TEXT = "You haven't asked LLM yet.";

/**
 * Displays a panel containing LLM's response.
 *
 * @return
 */
const AskLlmTabPanel = () => {
    const {llmState} = useContext(StateContext);
    const promptWithLog: string = formatPromptWithLog(llmState.log, llmState.prompt);

    let content;
    switch (llmState.status) {
        case LLM_REQUEST_STATUS.NOT_YET_INITIATED:
            content = (
                <List>
                    {NOT_YET_INITIATED_TEXT}
                </List>
            );
            break;
        case LLM_REQUEST_STATUS.COMPLETED:
            content = (
                <List>
                    <LlmMessageListItem
                        content={promptWithLog}
                        isRequest={true}
                        isStreaming={false}/>
                    <LlmMessageListItem
                        content={llmState.response.join("")}
                        isRequest={false}
                        isStreaming={false}/>
                </List>
            );
            break;
        case LLM_REQUEST_STATUS.STREAMING:
            content = (
                <List>
                    <LlmMessageListItem
                        content={promptWithLog}
                        isRequest={true}
                        isStreaming={false}/>
                    <LlmMessageListItem
                        content={llmState.response.join("")}
                        isRequest={false}
                        isStreaming={true}/>
                </List>
            );
            break;
        case LLM_REQUEST_STATUS.ERROR:
            content = (
                <List>
                    <LlmMessageListItem
                        content={promptWithLog}
                        isRequest={true}
                        isStreaming={false}/>
                    <LlmMessageListItem
                        content={"An error occurred when connecting to the LLM."}
                        isRequest={false}
                        isStreaming={false}/>
                </List>
            );
            break;
        default:
            // unreachable
            break;
    }

    return (
        <CustomTabPanel
            tabName={TAB_NAME.ASK_LLM}
            title={TAB_DISPLAY_NAMES[TAB_NAME.ASK_LLM]}
        >
            {content}
        </CustomTabPanel>
    );
};

export default AskLlmTabPanel;
