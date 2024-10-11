import CentralContainer from "./CentralContainer";
import MenuBar from "./MenuBar";
import StatusBar from "./StatusBar";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    return (
        <>
            <MenuBar/>
            <CentralContainer/>
            <StatusBar/>
        </>
    );
};

export default Layout;
