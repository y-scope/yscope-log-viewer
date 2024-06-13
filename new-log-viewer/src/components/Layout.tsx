import {
    useContext,
    useEffect,
} from "react";

import {StateContext} from "../contexts/StateContextProvider";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {
        logData,
        loadFile,
    } = useContext(StateContext);

    useEffect(() => {
        loadFile("");
    }, [loadFile]);

    return (
        <>
            <div>
                {logData}
            </div>
        </>
    );
};

export default Layout;
