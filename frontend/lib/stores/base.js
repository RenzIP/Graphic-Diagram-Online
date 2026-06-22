export function createStore(initialValue) {
	let value = initialValue;
	const subscribers = new Set();

	function emit() {
		for (const subscriber of subscribers) subscriber(value);
	}

	return {
		subscribe(subscriber) {
			subscribers.add(subscriber);
			subscriber(value);
			return () => subscribers.delete(subscriber);
		},
		get() {
			return value;
		},
		set(nextValue) {
			value = nextValue;
			emit();
		},
		update(updater) {
			value = updater(value);
			emit();
		}
	};
}
