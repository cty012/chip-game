"use strict";

function apply_pusher_move(target_game_state, target_token_moved, move) {
    for (let i = 0; i < target_game_state.length; i++) {
        const total = 2 ** target_game_state[i].length;
        apply_pusher_move_to_col(
            target_game_state[i],
            target_token_moved === null ? null : target_token_moved[i],
            move % total);
        move = Math.floor(move / total);
    }
}

function apply_pusher_move_to_col(target_col_state, target_token_moved, move) {
    for (let j = 0; j < target_col_state.length; j++) {
        if (target_token_moved !== null) target_token_moved[j] = false;

        // Decode next bit
        const should_move = move % 2;
        move = Math.floor(move / 2);

        // Move token
        if (target_col_state[j] === -1) continue;
        if (should_move) {
            if (target_token_moved !== null) target_token_moved[j] = true;
            target_col_state[j]++;
        }
    }
}

function _get_eq_classes(target_game_state) {
    const eqcls = [];

    for (let i = 0; i < target_game_state.length; i++) {
        // Check if current item belongs to an existing equivalence class
        let found = false;
        for (let eqid = 0; eqid < eqcls.length; eqid++) {
            const j = eqcls[eqid][0];
            if (col_state_compare(target_game_state[i], target_game_state[j], true) === Compare.EQUAL) {
                // If found, join this class
                eqcls[eqid].push(i);
                found = true;
                break;
            }
        }

        // If not found, create a new class
        if (!found) {
            eqcls.push([i]);
        }
    }

    return eqcls;
}

function _get_pusher_moves_for_col(col_state) {
    const moves = [];
    const hashes = new Set();
    const total = 2 ** col_state.length;
    for (let move = 0; move < total; move++) {
        const result_col_state = JSON.parse(JSON.stringify(col_state));
        apply_pusher_move_to_col(result_col_state, null, move);
        result_col_state.sort((a, b) => b - a);
        const hash = JSON.stringify(result_col_state);

        // Add this move if the move yields new result
        if (!hashes.has(hash)) {
            moves.push(move);
            hashes.add(hash);
        }
    }

    return moves;
}

function _combine_moves_for_eqcls(col_state, moves, count) {
    const n_moves = moves.length;

    // Construct comparison matrix
    const comp_matrix = Array.from({ length: n_moves }, _ => Array(n_moves).fill(Compare.NONE));
    {
        const column_after_move = Array.from({ length: n_moves }, _ => JSON.parse(JSON.stringify(col_state)));
        for (let i = 0; i < n_moves; i++) {
            apply_pusher_move_to_col(column_after_move[i], null, moves[i]);
            column_after_move[i].sort((a, b) => b - a);
        }
        for (let i = 0; i < n_moves; i++) {
            comp_matrix[i][i] = Compare.EQUAL;
            for (let j = i + 1; j < n_moves; j++) {
                const comp_i_j = col_state_compare(column_after_move[i], column_after_move[j], true);
                comp_matrix[i][j] = comp_i_j;
                if (comp_i_j === Compare.LESS) {
                    comp_matrix[j][i] = Compare.GREATER;
                } else if (comp_i_j === Compare.EQUAL) {
                    comp_matrix[j][i] = Compare.EQUAL;
                } else if (comp_i_j === Compare.GREATER) {
                    comp_matrix[j][i] = Compare.LESS;
                } else {
                    comp_matrix[j][i] = Compare.NONE;
                }
            }
        }
    }

    // Iterate over each combination of moves
    const total = n_moves ** count;
    const combined_moves = [];
    for (let encoded_move_idx = 0; encoded_move_idx < total; encoded_move_idx++) {
        // Decode the move
        const decoded_move_idx = [];
        {
            let encoded_move_idx_ = encoded_move_idx;
            for (let i = 0; i < count; i++) {
                decoded_move_idx.push(encoded_move_idx_ % n_moves);
                encoded_move_idx_ = Math.floor(encoded_move_idx_ / n_moves);
            }
        }

        // Filter 1: Move id must be non-decreasing
        if (range(0, count - 1).some(i => decoded_move_idx[i] > decoded_move_idx[i+1])) {
            continue;
        }

        // Filter 2: No move can be strictly better than the other
        if (range(0, count).some(i => range(i+1, count).some(j => {
            const idx1 = decoded_move_idx[i];
            const idx2 = decoded_move_idx[j];
            return [Compare.GREATER, Compare.LESS].includes(comp_matrix[idx1][idx2]);
        }))) {
            continue;
        }

        // Otherwise: Record the move
        combined_moves.push(decoded_move_idx.map(idx => moves[idx]));
    }

    return combined_moves;
} 

/**
 * Returns all possible pusher moves. Prunes redundant moves.
 * @param {Array} target_game_state Game state to apply a move.
 * @returns All moves encoded.
 */
function get_pusher_moves(target_game_state) {
    const n = target_game_state.length;
    const k = target_game_state[0].length;

    // Step 1: Divide the columns into equivalence classes
    const eqcls = _get_eq_classes(target_game_state);

    // Step 2: Find the possible moves within each equiv class
    const eqcls_moves = [];
    for (let i = 0; i < eqcls.length; i++) {
        eqcls_moves.push(_get_pusher_moves_for_col(target_game_state[eqcls[i][0]]));
    }

    // Step 3: Combine moves for each equiv class
    const eqcls_combined_moves = [];
    for (let i = 0; i < eqcls.length; i++) {
        eqcls_combined_moves.push(_combine_moves_for_eqcls(
            target_game_state[eqcls[i][0]], eqcls_moves[i], eqcls[i].length));
    }

    // Step 4: Find the cartesian product of each equiv class's combined moves
    let moves = [0];
    let base = 2 ** k;
    for (let i = 0; i < eqcls.length; i++) {
        moves = cartesian_prod(
            moves, eqcls_combined_moves[i],
            (acc, encoded_move) => {
                for (let j = 0; j < eqcls[i].length; j++) {
                    acc += encoded_move[j] * (base ** eqcls[i][j])
                }
                return acc;
            }
        );
    }

    return moves.filter(move => move !== 0);
}
