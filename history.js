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
 * Reset not only the game state but also history completely
 * @param {Number} n New N
 * @param {Number} m New M
 */
function init(n, m) {
    init_game_state(n, m);
    turn = 0;
    player = 0;
    ui_board.className = `${player_names[player]}-move`;
    refresh_button_area();
}

/**
 * End the current turn and check for winner. Does not add snapshot to history.
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

    // Toggle board mode
    let winner = check_game_over();
    if (player === 0 && winner > 0) {
        player = 1 + winner;
        ui_board.className = `game_over`;
    } else {
        ui_board.className = `${player_names[player]}-move`;
    }

    // Refresh
    update_tokens();
    refresh_button_area();
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
}
