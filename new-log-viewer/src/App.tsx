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
        <UrlContextProvider>
            <StateContextProvider>
                <Layout/>
            </StateContextProvider>
        </UrlContextProvider>
    );
};

export default App;
