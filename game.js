"use strict";

/**
 * Number of columns
 */
var N;

/**
 * Number of tokens per column
 */
var K;

/**
 * Number of rows
 */
var NUM_ROWS;

/**
 * Game state (dimension: (N, K))
 */
var game_state = [];
var token_moved = [];
var col_removed = -1;

/**
 * Token label
 */
var token_label = 0;

/**
 * @returns The diameter of the tokens
 */
function get_token_diam() {
    return token_diams[K - K_min];
}

/**
 * @returns The separation of the tokens
 */
function get_token_sep() {
    return token_seps[K - K_min];
}

/**
 * Reset the game state completely
 * @param {Number} n New N
 * @param {Number} k New K
 */
function init_game_state(n, k) {
    N = n;
    K = k;
    game_state = Array.from({ length: n }, () => Array(k).fill(0));
    token_moved = Array.from({ length: n }, () => Array(k).fill(false));
    col_removed = -1;
    refresh_board();
    refresh_tokens();
}

/**
 * WARNING: This function is only intended to be used after a complete turn (i.e. after Remover's move)
 * Returns:
 *   - 0: Game is not over
 *   - 1: Pusher wins
 *   - 2: Remover wins
 */
function check_game_over() {
    let winner = 2;
    game_state.forEach(col_state => {
        col_state.forEach(row => {
            if (row === -1) {
                return;
            } else if (false /* row >= N */) {  // Pusher never wins
                winner = 1;
            } else {
                if (winner === 2) winner = 0;
            }
        });
    });
    return winner;
}

/**
 * Refresh the board UI to match the game state
 */
function refresh_board() {
    refresh_board_with_rows(Math.max(N + 1, Math.max(...game_state.flat()) + 2));
}

/**
 * Refresh the board UI with the given number of rows
 */
function refresh_board_with_rows(num_rows) {
    NUM_ROWS = num_rows;
    ui_board.style.width = grid_size * N + "px";
    ui_board.style.height = grid_size * num_rows + "px";
    ui_board.innerHTML = Array.from(
        { length: N },
        (v, i) => `
            <div class="column" onclick="col_onclick(${i})">
                ${`<div class="cell"></div>`.repeat(num_rows)}
            </div>
        `
    ).join("");
    ui_row_numbers.innerHTML = Array.from(
        { length: num_rows },
        (v, i) => `
            <div class="row-number" style="bottom:${grid_size * (i + 0.5) - 15}px;">
                ${i}
            </div>
        `
    ).join("");
}

/**
 * Refresh the tokens UI to match the game state
 */
function refresh_tokens() {
    // Generate tokens with instant movement
    ui_tokens.innerHTML = Array.from(
        { length: N * K },
        (v, i) => `<div class="token instant" onclick="token_onclick(${i});"></div>`
    ).join("");

    // Update tokens
    update_tokens();

    // Remove instant movement from all tokens
    ui_tokens.querySelectorAll(".token").forEach(ui_token => {
        ui_token.style.width = get_token_diam() + "px";
        ui_token.style.height = get_token_diam() + "px";
        ui_token.style.lineHeight = get_token_diam() + "px";
        ui_token.classList.remove("instant");
    });
}

/**
 * Tokens are updated instead of completely removed and regenerated
 */
function update_tokens() {
    let ui_token_arr = ui_tokens.querySelectorAll(".token");
    // Iterate through each column
    for (let col = 0; col < N; col++) {
        // Find the position offset of each token
        let offset = calc_token_offset(game_state[col])
        // Assign the position of each token
        for (let token_id = 0; token_id < K; token_id++) {
            let row = game_state[col][token_id];
            let ui_token = ui_token_arr[col * K + token_id];
            // display
            ui_token.style.display = row === -1 ? "none" : "block";
            // position
            ui_token.style.left = grid_size * (col + 0.5) + offset[token_id][0] - get_token_diam() * 0.5 + "px";
            ui_token.style.bottom = grid_size * (row + 0.5) - offset[token_id][1] - get_token_diam() * 0.5 + "px";
            // label
            switch(token_label) {
                case 0:
                    ui_token.innerHTML = "";
                    break;
                case 1:
                    ui_token.innerHTML = String.fromCharCode(65 + token_id);
                    break;
                case 2:
                    ui_token.innerHTML = 1 + token_id + "";
                    break;
                default:
            }
            // color
            if (token_moved[col][token_id]) {
                ui_token.classList.add("moved");
            } else {
                ui_token.classList.remove("moved");
            }
            if (col_removed === col) {
                ui_token.classList.add("removed");
            } else {
                ui_token.classList.remove("removed");
            }
        }
    }
}

/**
 * Takes a column state and output each token's offset from center of grid
 * @param {Array} column_state 
 */
function calc_token_offset(column_state) {
    let offset = Array.from({ length: column_state.length }, () => [0, 0]);

    // Construct row_to_id
    let num_rows = Math.max(...column_state) + 1;
    let row_to_id = Array.from({ length: num_rows }, () => []);
    column_state.forEach((row, token_id) => {
        if (row >= 0) row_to_id[row].push(token_id);
    });

    // Analyze each row to find offset
    for (let row = 0; row < num_rows; row++) {
        let count = row_to_id[row].length;
        if (count <= 1) continue;
        let per_row = Math.ceil(Math.sqrt(count));
        let per_col = Math.ceil(count / per_row);
        let last_row = count - per_row * (per_col - 1);
        row_to_id[row].forEach((token_id, i) => {
            let x = i % per_row;
            let y = Math.floor(i / per_row);
            let cur_row = y === (per_col - 1) ? last_row : per_row;
            offset[token_id][0] = -0.5 * get_token_sep() * (cur_row - 1) + get_token_sep() * x;
            offset[token_id][1] = -0.5 * get_token_sep() * (per_col - 1) + get_token_sep() * y;
        });
    }

    // Return the answer
    return offset;
}
