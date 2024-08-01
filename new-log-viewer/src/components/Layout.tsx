import {useContext} from "react";

import {
    PAGE_SIZE,
    StateContext,
} from "../contexts/StateContextProvider";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {
        logData,
        logEventNum,
    } = useContext(StateContext);

    return (
        <>
            <div>
                <h3>
                    LogEventNum -
                    {" "}
                    {logEventNum}
                    {" "}
                    |
                    PageNum -
                    {" "}
                    {Math.ceil(logEventNum / PAGE_SIZE)}
                </h3>
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
