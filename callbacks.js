"use strict";

function token_onclick(index) {
    // If not Pusher's turn, do nothing
    if (player !== 0) return;

    // Find which token is clicked
    let col = Math.floor(index / M);
    let token_id = index % M;

    // Skip invalid tokens
    if (game_state[col][token_id] < 0) return;

    // Move forward or backward
    if (token_moved[col][token_id]) {
        game_state[col][token_id]--;
        token_moved[col][token_id] = false;
    } else {
        game_state[col][token_id]++;
        token_moved[col][token_id] = true;
    }

    // Update token positions
    update_tokens();
}

function col_onclick(col) {
    // If not Remover's turn, do nothing
    if (player !== 1) return;
    col_removed = col;
    update_tokens();
}

function inc_N(delta) {
    let N_new = Math.min(Math.max(N + delta, N_min), N_max);
    if (N_new === N) return;
    init(N_new, M);
}

function inc_M(delta) {
    let M_new = Math.min(Math.max(M + delta, M_min), M_max);
    if (M_new === M) return;
    init(N, M_new);
}

function end_turn() {
    // Check if can end turn
    if (player === 0) {
        // Make sure at least one token is pushed
        let can_end_turn = false;
        for (let col = 0; col < N; col++) {
            for (let token_id = 0; token_id < M; token_id++) {
                if (token_moved[col][token_id]) can_end_turn = true;
            }
        }
        if (!can_end_turn) return;
    } else if (player === 1) {
        // Make sure at least one token is removed
        if (col_removed < 0) return;
        let can_end_turn = false;
        for (let token_id = 0; token_id < M; token_id++) {
            if (token_moved[col_removed][token_id]) {
                can_end_turn = true;
            }
        }
        if (!can_end_turn) return;
    } else {
        // Game already ended
        return;
    }

    // End turn
    commit();

    // Save current game state to history
    // TODO
}
