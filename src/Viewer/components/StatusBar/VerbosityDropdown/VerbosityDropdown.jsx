import React from "react";

import {VSCodeDropdown, VSCodeOption} from "@vscode/webview-ui-toolkit/react";
import PropTypes from "prop-types";

import FourByteClpIrStreamReader
    from "../../../services/decoder/FourByteClpIrStreamReader";

import "./VerbosityDropdown.scss";

const VerbosityDropdown = ({onVerbosityChange}) => {
    return <VSCodeDropdown
        id={"verbosity-dropdown"}
        onChange={onVerbosityChange}
        position={"above"}>
        <span slot="start" className={"codicon codicon-list-filter"}/>
        <span slot="indicator"/>
        <VSCodeOption value={"-1"}>
            ALL
        </VSCodeOption>
        {FourByteClpIrStreamReader.VERBOSITIES.map(
            (value, index) =>
                <VSCodeOption
                    value={index.toString()}
                    key={index}
                >
                    {value.label}
                </VSCodeOption>
        )}
    </VSCodeDropdown>;
};
VerbosityDropdown.propTypes = {
    onVerbosityChange: PropTypes.func,
};

export default VerbosityDropdown;
