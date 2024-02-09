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
 * @param {Number} m New M
 */
function init(n, m) {
    init_game_state(n, m);
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
    return JSON.stringify({ turn, player, game_state, token_moved, col_removed });
}

/**
 * Load a snapshot and refreshes everything but the board
 * @param {Object} snapshot 
 */
function load_snapshot(snapshot) {
    snapshot = JSON.parse(snapshot);
    turn = snapshot.turn;
    player = snapshot.player;
    game_state = snapshot.game_state;
    token_moved = snapshot.token_moved;
    col_removed = snapshot.col_removed;
    refresh_all(true);
}

/**
 * Completely refreshes the UI given the loaded snapshot
 */
function refresh_all(instant) {
    // Toggle board mode
    let winner = check_game_over();
    if (player === 0 && winner > 0) {
        player = 1 + winner;
        ui_board.className = `game_over`;
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
            for (let token_id = 0; token_id < M; token_id++) {
                if (token_moved[col_removed][token_id]) {
                    game_state[col_removed][token_id] = -1;
                }
            }
            token_moved = Array.from({ length: N }, () => Array(M).fill(false));
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

    // Refresh
    refresh_all(false);

    // Discard future & add snapshot
    hist.splice(hist_ptr + 1);
    hist.push(take_snapshot());
    hist_ptr++;
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

    // Display N and M
    ui_display_n.innerHTML = N;
    ui_display_m.innerHTML = M;

    // Display token label
    ui_token_label.innerHTML = token_labels[token_label];
}
