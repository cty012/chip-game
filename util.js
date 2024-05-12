/**
 * @param {Number} start Beginning of the range.
 * @param {Number} end End of the range (exclusive).
 * @param {Number} step Difference between neighboring terms.
 * @returns A range from start (inclusive) to end (exclusive) with the given step.
 */
function range(start, end, step=1) {
    if (step === 0) return [];
    return Array.from(
        { length: Math.max(0, Math.ceil((end - start) / step)) },
        (_, i) => start + i * step
    );
}

/**
 * @param {Array} arr1 The first array.
 * @param {Array} arr2 The second array.
 * @param {Function} f The function to apply.
 * @returns The cartesian product of the two arrays, applying function f to each combination of elements.
 */
function cartesian_prod(arr1, arr2, f) {
    return arr1.flatMap(i => arr2.map(j => f(i, j)));
}
