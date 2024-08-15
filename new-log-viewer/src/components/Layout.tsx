import React, {useContext} from "react";

import {StateContext} from "../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    UrlContext,
} from "../contexts/UrlContextProvider";
import {CONFIG_CODE} from "../typings/config";
import {
    getConfig,
    setConfig,
} from "../utils/config";


const formFields = [
    {
        initialValue: getConfig(CONFIG_CODE.DECODER_OPTIONS).formatString,
        label: "decoderOptions/formatString",
        name: "formatString",
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_CODE.DECODER_OPTIONS).logLevelKey,
        label: "decoderOptions/logLevelKey",
        name: "logLevelKey",
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_CODE.DECODER_OPTIONS).timestampKey,
        label: "decoderOptions/timestampKey",
        name: "timestampKey",
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_CODE.THEME),
        label: "Theme",
        name: "theme",
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_CODE.PAGE_SIZE),
        label: "Page Size",
        name: "pageSize",
        type: "number",
    },
];

/**
 * Renders a form for testing config utilities.
 *
 * @return
 */
const ConfigForm = () => {
    const handleConfigFormReset = (ev: React.FormEvent) => {
        ev.preventDefault();
        window.localStorage.clear();
        window.location.reload();
    };

    const handleConfigFormSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);

        const formatString = formData.get("formatString");
        const logLevelKey = formData.get("logLevelKey");
        const timestampKey = formData.get("timestampKey");
        const theme = formData.get("theme");
        const pageSize = formData.get("pageSize");
        let error = null;
        if (
            "string" === typeof formatString &&
            "string" === typeof logLevelKey &&
            "string" === typeof timestampKey
        ) {
            error ||= setConfig({
                code: CONFIG_CODE.DECODER_OPTIONS,
                value: {formatString, logLevelKey, timestampKey},
            });
        }
        if ("string" === typeof theme) {
            error ||= setConfig({
                code: CONFIG_CODE.THEME,
                value: theme,
            });
        }
        if ("string" === typeof pageSize) {
            error ||= setConfig({
                code: CONFIG_CODE.PAGE_SIZE,
                value: Number(pageSize),
            });
        }
        if (null !== error) {
            // eslint-disable-next-line no-alert
            window.alert(error);
        } else {
            window.location.reload();
        }
    };

    return (
        <form
            onReset={handleConfigFormReset}
            onSubmit={handleConfigFormSubmit}
        >
            <table>
                <tbody>
                    {formFields.map((field, index) => (
                        <tr key={index}>
                            <td>
                                {field.label}
                            </td>
                            <td>
                                <input
                                    defaultValue={field.initialValue}
                                    name={field.name}
                                    size={100}
                                    type={field.type}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button type={"submit"}>Apply</button>
                <button type={"reset"}>Clear localStorage</button>
            </div>
        </form>
    );
};

/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {
        logData,
        pageNum,
        numEvents,
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const handleLogEventNumInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        updateWindowUrlHashParams({logEventNum: Number(ev.target.value)});
    };

    const handleCopyLinkButtonClick = () => {
        copyPermalinkToClipboard({}, {logEventNum: numEvents});
    };

    return (
        <>
            <div>
                <h3>
                    LogEventNum -
                    {" "}
                    <input
                        type={"number"}
                        value={null === logEventNum ?
                            1 :
                            logEventNum}
                        onChange={handleLogEventNumInputChange}/>
                    {" "}
                    |
                    PageNum -
                    {" "}
                    {pageNum}
                </h3>

                <button onClick={handleCopyLinkButtonClick}>
                    Copy link to last log
                </button>

                <ConfigForm/>

                {logData.split("\n").map((line, index) => (
                    <p key={index}>
                        {`<${index + 1}>`}
                        -
                        {line}
                    </p>
                ))}
            </div>
        </>
    );
};

export default Layout;
