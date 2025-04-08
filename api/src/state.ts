export type StateType = {
	simulateError: number;
	simulateSlow: number;
};

export class State {
	private static instance: State;

	public simulateError = 0;
	public simulateSlow = 0;

	private constructor() {}

	static getInstance(): State {
		if (!State.instance) {
			State.instance = new State();
		}
		return State.instance;
	}
}
