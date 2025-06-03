import {create} from "zustand";


interface ResultsStoreValues {
    buttonClicked: boolean;
}

interface ResultsStoreActions {
    setButtonClicked: (clickState: boolean) => void;
}

type ResultsStoreState = ResultsStoreValues & ResultsStoreActions;

const RESULTS_STORE_DEFAULT: ResultsStoreValues = {
    buttonClicked: false,
};

const useResultsStore = create<ResultsStoreState>((set) => ({
    ...RESULTS_STORE_DEFAULT,
    setButtonClicked: (clickState: boolean) => {
        set({buttonClicked: clickState});
    },
}));

export default useResultsStore;
