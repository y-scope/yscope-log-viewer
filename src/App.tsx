import AppController from "./components/AppController";
import Layout from "./components/Layout";
import NotificationContextProvider from "./contexts/NotificationContextProvider";

/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <NotificationContextProvider>
            <AppController>
                <Layout/>
            </AppController>
        </NotificationContextProvider>
    );
};

export default App;
