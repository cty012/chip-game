"use strict";

function col_state_leq(col1, col2, sorted=false) {
    let col1_sorted = null;
    let col2_sorted = null;

    if (sorted) {
        col1_sorted = col1;
        col2_sorted = col2;
    } else {
        col1_sorted = JSON.parse(JSON.stringify(col1));
        col2_sorted = JSON.parse(JSON.stringify(col2));
        col1_sorted.sort((a, b) => b - a);
        col2_sorted.sort((a, b) => b - a);
    }

    const len = Math.max(col1_sorted.length, col2_sorted.length);
    for (let i = 0; i < len; i++) {
        if (col1_sorted[i] > col2_sorted[i]) return false;
    }
    return true;
}

function col_state_compare(col1, col2, sorted=false) {
    const col1_leq_col2 = col_state_leq(col1, col2, sorted);
    const col2_leq_col1 = col_state_leq(col2, col1, sorted);
    if (col1_leq_col2 && col2_leq_col1) {
        return Compare.EQUAL;
    } else if (col1_leq_col2) {
        return Compare.LESS;
    } else if (col2_leq_col1) {
        return Compare.GREATER;
    } else {
        return Compare.NONE;
    }
}

function generate_permutations(n) {
    let results = [];
    let array = range(0, n); // Create an array [0, 1, 2, ..., n-1]

    function permute(arr, m = []) {
        if (arr.length === 0) {
            results.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice(); // Create a copy of the array
                let next = curr.splice(i, 1); // Remove one element from the array
                permute(curr.slice(), m.concat(next));
            }
        }
    }

    permute(array);
    return results;
}

function game_state_leq(game_state1, game_state2, sorted=false) {
    const n = game_state1.length;
    if (n !== game_state2.length) return Compare.NONE;

    // Find the permutations
    return generate_permutations(n).some(pi => {
        for (let i = 0; i < n; i++) {
            if (!col_state_leq(game_state1[i], game_state2[pi[i]], sorted)) {
                return false;
            }
        }
        return true;
    });
}

function game_state_compare(game_state1, game_state2, sorted=false) {
    const gs1_leq_gs2 = game_state_leq(game_state1, game_state2, sorted);
    const gs2_leq_gs1 = game_state_leq(game_state2, game_state1, sorted);
    if (gs1_leq_gs2 && gs2_leq_gs1) {
        return Compare.EQUAL;
    } else if (gs1_leq_gs2) {
        return Compare.LESS;
    } else if (gs2_leq_gs1) {
        return Compare.GREATER;
    } else {
        return Compare.NONE;
    }
}
