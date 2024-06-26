"use strict";

/**
 * Game turn
 */
var turn = 0;

/**
 * Current player (0: pusher, 1: remover, 2: pusher wins, 3: remover wins)
 */
var player = 0;
var player_names = ["pusher", "remover"];

/**
 * Hist
 * [
 *   {
 *     "turn": Current turn (starting from 0),
 *     "player": Current player (or winner),
 *     "game_state", "token_moved", "col_removed": All necessary data to store to replicate the same game state
 *   },
 *   ...
 * ]
 */
var hist = []
var hist_ptr = 0;

/**
 * Reset not only the game state but also history completely
 * @param {Number} n New N
 * @param {Number} k New K
 */
function init(n, k) {
    init_game_state(n, k);
    turn = 0;
    player = 0;
    hist = [take_snapshot()];
    hist_ptr = 0;
    refresh_all(true);
}

/**
 * @returns Snapshot of the current game state to save in history
 */
function take_snapshot() {
    return JSON.stringify({ turn, player, game_state, token_moved, col_removed, num_rows: NUM_ROWS });
}

/**
 * Load a snapshot and refreshes everything but the board
 * @param {Object} snapshot The snapshot to load
 */
function load_snapshot(snapshot) {
    snapshot = JSON.parse(snapshot);
    turn = snapshot.turn;
    player = snapshot.player;
    game_state = snapshot.game_state;
    token_moved = snapshot.token_moved;
    col_removed = snapshot.col_removed;

    // Update board size
    refresh_board_with_rows(snapshot.num_rows);
    // In all cases refresh everything else
    refresh_all(true);
}

/**
 * Completely refreshes the UI (except for the board) given the loaded snapshot
 */
function refresh_all(instant) {
    // Toggle board mode
    let winner = check_game_over();
    if (player === Player.PUSHER && winner !== Player.NONE) {
        player = (winner === Player.PUSHER ? Player.PUSHER_WIN : Player.REMOVER_WIN);
        ui_board_container.className = `game-over`;
    } else {
        ui_board_container.className = `${player_names[player]}-move`;
    }

    // Refresh everything except the board
    if (instant) {
        refresh_tokens();
    } else {
        update_tokens();
    }
    refresh_button_area();
}

function can_end_turn() {
    if (player === 0) {
        // Make sure at least one token is pushed
        for (let col = 0; col < N; col++) {
            for (let token_id = 0; token_id < K; token_id++) {
                if (token_moved[col][token_id]) {
                    return true;
                }
            }
        }
    } else if (player === 1) {
        // Make sure at least one token is removed
        if (col_removed < 0) return false;
        for (let token_id = 0; token_id < K; token_id++) {
            if (token_moved[col_removed][token_id]) {
                return true;
            }
        }
    }
    return false;
}

/**
 * End the current turn and check for winner. Also add snapshot to history.
 */
function commit() {
    switch (player) {
        case 0: {
            // If it is Pusher's turn, do nothing
            // Switch to Remover's turn
            player = 1;
            break;
        }
        case 1: {
            // If it is Remover's turn, execute col_removed and clear token_moved & col_removed
            for (let token_id = 0; token_id < K; token_id++) {
                if (token_moved[col_removed][token_id]) {
                    game_state[col_removed][token_id] = -1;
                }
            }
            token_moved = Array.from({ length: N }, () => Array(K).fill(false));
            col_removed = -1;
            // Switch to Pusher's turn
            player = 0;
            turn++;
            break;
        }
        default:
            // Otherwise the game ended, do nothing
            return;
    }

    // Update board size on pusher's turn
    if (player === 0) refresh_board();

    // Discard future & add snapshot
    hist.splice(hist_ptr + 1);
    hist.push(take_snapshot());
    hist_ptr++;

    // In all cases refresh everything else
    refresh_all(false);
}

/**
 * Undo or redo if possible.
 * @param {Number} delta -1: Undo, 1: Redo
 */
function traverse_history(delta) {
    let hist_ptr_new = Math.min(Math.max(hist_ptr + delta, 0), hist.length - 1);
    if (hist_ptr_new === hist_ptr) return;
    hist_ptr = hist_ptr_new;
    load_snapshot(hist[hist_ptr]);
}

/**
 * Helper function. Disables buttons under certain conditions
 * @param {*} ui_button Button to disable/enable
 * @param {bool} condition Condition value
 */
function disable_on(ui_button, condition) {
    if (condition) {
        ui_button.classList.add("disabled");
    } else {
        ui_button.classList.remove("disabled");
    }
}

/**
 * Refresh the button area to match the game state and history
 */
function refresh_button_area() {
    // Turn and player
    if (player < 2) {
        let player_name = player_names[player];
        let player_name_cap = player_name.charAt(0).toUpperCase() + player_name.slice(1);
        ui_turn.innerHTML = `Turn ${turn + 1}`;
        ui_player.innerHTML = `${player_name_cap}'s move`;
        ui_player.style.color = [pusher_color_dark, remover_color_dark][player];
    } else {
        let player_name = player_names[player - 2];
        let player_name_cap = player_name.charAt(0).toUpperCase() + player_name.slice(1);
        ui_turn.innerHTML = `Turn ${turn + 1}`;
        ui_player.innerHTML = `${player_name_cap} wins`;
        ui_player.style.color = [pusher_color_dark, remover_color_dark][player - 2];
    }

    // Display N and K
    ui_display_n.innerHTML = N;
    ui_display_k.innerHTML = K;
    disable_on(ui_display_n_dec, N === N_min);
    disable_on(ui_display_n_inc, N === N_max);
    disable_on(ui_display_k_dec, K === K_min);
    disable_on(ui_display_k_inc, K === K_max);

    // Display token label
    ui_token_label.innerHTML = token_labels[token_label];

    // Display undo & redo
    disable_on(ui_undo, hist_ptr === 0);
    disable_on(ui_redo, hist_ptr === hist.length - 1);

    // Display end turn
    disable_on(ui_end_turn, !can_end_turn());
}
