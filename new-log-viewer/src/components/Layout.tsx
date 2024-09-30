import DropFileContainer from "./DropFileContainer";
import Editor from "./Editor";
import MenuBar from "./MenuBar";
import StatusBar from "./StatusBar";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    return (
        <div className={"layout"}>
            <MenuBar/>
            <DropFileContainer>
                <Editor/>
            </DropFileContainer>
            <StatusBar/>
        </div>
    );
};

export default Layout;
