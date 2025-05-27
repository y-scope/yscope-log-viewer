import AppController from "./components/AppController";
import Layout from "./components/Layout";
import UrlContextProvider from "./contexts/UrlContextProvider";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <UrlContextProvider>
            <AppController>
                <Layout/>
            </AppController>
        </UrlContextProvider>
    );
};

export default App;
