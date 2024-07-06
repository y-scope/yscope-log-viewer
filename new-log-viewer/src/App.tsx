import Layout from "./components/Layout";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider from "./contexts/UrlContextProvider";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <>
            <StateContextProvider>
                <UrlContextProvider>
                    <Layout/>
                </UrlContextProvider>
            </StateContextProvider>
        </>
    );
};

export default App;
