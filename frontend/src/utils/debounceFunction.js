/**
 * Debounces a function by delaying its execution until a certain amount of time has passed without any further calls.
 * @param {Function} func - The function to be debounced.
 * @param {number} delay - The delay in milliseconds before the function is executed.
 * @returns {Function} - The debounced function.
 */
export default function debounce(func, delay) {
    let timeoutId;

    return function () {
        const context = this;
        const args = arguments;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
