import {
    useContext,
    useEffect,
} from "react";

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
        loadFile,
        logEventNum,
    } = useContext(StateContext);

    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const filePath = urlSearchParams.get("filePath");
        if (null !== filePath) {
            loadFile(filePath);
        }
    }, [loadFile]);

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
