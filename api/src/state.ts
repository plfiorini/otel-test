export type StateType = {
    simulateError: number;
    simulateSlow: number;
};

export class State {
    private static instance: State;

    public simulateError: number = 0;
    public simulateSlow: number = 0;

    private constructor() {}

    static getInstance(): State {
        if (!State.instance) {
            State.instance = new State();
        }
        return State.instance;
    }
}
