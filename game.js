/**
 * Number of columns
 */
var N = 3;
var N_min = 2;
var N_max = 7;

/**
 * Number of tokens per column
 */
var M = 2;
var M_min = 1;
var M_max = 8;

/**
 * Game state (dimension: (N, M))
 */
var game_state = [];
var token_moved = [];

/**
 * Game turn
 */
var turn = 0;
/**
 * Current player (0: pusher, 1: remover)
 */
var player = 0;

/**
 * UI elements in the HTML
 */
var ui_board_container = document.getElementById("board-container");
var ui_board = document.getElementById("board");
var ui_tokens = document.getElementById("tokens");

/**
 * UI variables
 */
var grid_size = 90;
var token_sep = 26;

/**
 * Reset the game state completely
 * @param {Number} n New N
 * @param {Number} m New M
 */
function init(n, m) {
    N = n;
    M = m;
    game_state = Array.from({ length: n }, () => Array(m).fill(0));
    token_moved = Array.from({ length: n }, () => Array(m).fill(false));
    turn = 0;
    player = 0;
    refresh_board();
    refresh_tokens();
}

/**
 * Refresh the board UI to match the game state
 */
function refresh_board() {
    ui_board.style.width = grid_size * N + "px";
    ui_board.style.height = grid_size * (N + 1) + "px";
    let column = `<div class="column">` + `<div class="cell"></div>`.repeat(N + 1) + `</div>`;
    ui_board.innerHTML = column.repeat(N);
}

/**
 * Refresh the tokens UI to match the game state
 */
function refresh_tokens() {
    ui_tokens.innerHTML = Array.from(
        { length: N * M },
        (v, i) => `<div class="token instant" onclick="token_onclick(${i});"></div>`
    ).join("");
    ui_token_arr = ui_tokens.querySelectorAll(".token");

    // Iterate through each column
    for (let col = 0; col < N; col++) {
        // Find the position offset of each token
        let offset = calc_token_offset(game_state[col])
        // Assign the position of each token
        for (let token_id = 0; token_id < M; token_id++) {
            let row = game_state[col][token_id];
            let ui_token = ui_token_arr[col * M + token_id];
            if (row === -1) {
                ui_token.style.display = "none";
            } else {
                // position
                ui_token.style.left = grid_size * (col + 0.5) + offset[token_id][0] - 10 + "px";
                ui_token.style.bottom = grid_size * (row + 0.5) + offset[token_id][1] - 10 + "px";
                // color
                ui_token.style.backgroundColor = "#bbb";
            }
        }
    }

    // Remove the instant class from all tokens
    ui_token_arr.forEach(ui_token => {
        ui_token.classList.remove("instant");
    });
}

/**
 * Tokens are updated instead of completely removed and regenerated
 */
function update_tokens() {
    ui_token_arr = ui_tokens.querySelectorAll(".token");
    // Iterate through each column
    for (let col = 0; col < N; col++) {
        // Find the position offset of each token
        let offset = calc_token_offset(game_state[col])
        // Assign the position of each token
        for (let token_id = 0; token_id < M; token_id++) {
            let row = game_state[col][token_id];
            let ui_token = ui_token_arr[col * M + token_id];
            if (row === -1) {
                ui_token.style.display = "none";
            } else {
                ui_token.style.display = "block";
                // position
                ui_token.style.left = grid_size * (col + 0.5) + offset[token_id][0] - 10 + "px";
                ui_token.style.bottom = grid_size * (row + 0.5) + offset[token_id][1] - 10 + "px";
                // color
                ui_token.style.backgroundColor = token_moved[col][token_id] ? "#a0a0f0" : "#bbb";
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
    let row_to_id = Array.from({ length: N + 1 }, () => []);
    column_state.forEach((row, token_id) => {
        if (row >= 0) row_to_id[row].push(token_id);
    });

    // Analyze each row to find offset
    for (let row = 0; row <= N; row++) {
        let count = row_to_id[row].length;
        if (count <= 1) continue;
        let per_row = Math.ceil(Math.sqrt(count));
        let per_col = Math.ceil(count / per_row);
        row_to_id[row].forEach((token_id, i) => {
            let x = i % per_row;
            let y = Math.floor(i / per_row);
            offset[token_id][0] = -0.5 * token_sep * (per_row - 1) + token_sep * x;
            offset[token_id][1] = -0.5 * token_sep * (per_col - 1) + token_sep * y;
        });
    }

    // Return the answer
    return offset;
}
