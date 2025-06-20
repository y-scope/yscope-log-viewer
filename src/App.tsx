import AppController from "./components/AppController";
import Layout from "./components/Layout";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <AppController>
            <Layout/>
        </AppController>
    );
};

export default App;
