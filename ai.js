"use strict";

var winning_states = [];
var losing_states = [];

function decode_game_state(str) {
    // Split input string by line breaks
    const lines = str.trim().split(/\r?\n/);

    // Parse the first line to extract N and K
    const [n, k, ...rest] = lines[0].split(',').map(Number);
    if (lines.length !== (n + 1)) {
        return null;
    }

    // Initialize the NxK array
    const parsed_game_state = Array.from({ length: n }, () => Array(k).fill(0));

    // Process each subsequent line to extract pairs
    for (let i = 0; i < n; i++) {
        const col = lines[i+1].trim().split(/\s+/);

        if (col.length !== k) {
            return null;
        }

        col.forEach((pair, j) => {
            const [r, _] = pair.split(':').map(Number);
            parsed_game_state[i][j] = r;
        });

        parsed_game_state[i].sort((a, b) => b - a);
    }

    return parsed_game_state;
}

function decode_file(file, callback) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const results = content.split('---').map(part => {
            if (part.trim()) {
                return decode_game_state(part.trim());
            }
            return null;
        }).filter(result => result !== null);
        callback(results);
    };

    reader.readAsText(file);
}

function ai_move_pusher() {
    // Count number of movable tokens
    let movable = game_state.reduce((acc, row) => acc + row.filter(num => num !== -1).length, 0);

    function sum_of_binary_digits(num) {
        return num.toString(2).split("").reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    // The move is binary encoded
    const possible_moves = get_pusher_moves(game_state);
    possible_moves.sort((a, b) => sum_of_binary_digits(b) - sum_of_binary_digits(a));

    // Check each move
    return possible_moves.some(move => {
        // Calculate the resulting board
        const result_game_state = JSON.parse(JSON.stringify(game_state));
        const result_token_moved = JSON.parse(JSON.stringify(token_moved));
        result_game_state.forEach((col_state, i) => {
            for (let j = 0; j < K; j++) {
                // Unpush tokens that are currently moved
                if (result_token_moved[i][j] && col_state[j] !== -1) {
                    col_state[j]--;
                    result_token_moved[i][j] = false;
                }
            }
        });
        apply_pusher_move(result_game_state, result_token_moved, move);

        // Check if the Remover must return to a winning state
        const still_winning = range(0, N).every(remover_move => {
            // Calculate the board after Remover's move
            let removed_at_least_one = false;
            const final_game_state = JSON.parse(JSON.stringify(result_game_state));
            for (let j = 0; j < K; j++) {
                if (result_token_moved[remover_move][j]) {
                    removed_at_least_one = true;
                    final_game_state[remover_move][j] = -1;
                }
            }

            // Filter out invalid moves
            if (!removed_at_least_one) return true;

            // Sort
            for (let i = 0; i < N; i++) {
                final_game_state[i].sort((a, b) => b - a);
            }

            return winning_states.some(winning_state => game_state_leq(winning_state, final_game_state, true));
        });

        if (still_winning) {
            // Then make this move
            game_state = result_game_state;
            token_moved = result_token_moved;
            update_tokens();
            refresh_button_area();
            return true;
        }

        return false;
    });
}

function ai_move_remover() {
    for (let move = 0; move < N; move++) {
        // Check that this move is valid
        if (token_moved[move].every(moved => !moved)) continue;

        // Calculate the resulting board
        const result_game_state = JSON.parse(JSON.stringify(game_state));
        for (let j = 0; j < K; j++) {
            if (token_moved[move][j]) {
                result_game_state[move][j] = -1;
            }
        }

        // Sort the columns
        for (let i = 0; i < N; i++) {
            result_game_state[i].sort((a, b) => b - a);
        }

        // Check if this is already lost
        if (check_game_over(result_game_state) === Player.REMOVER) {
            return true;
        }

        // Check if this is a losing state
        if (losing_states.some(losing_state => game_state_leq(result_game_state, losing_state, true))) {
            // Then make this move
            col_removed = move;
            update_tokens();
            refresh_button_area();
            return true;
        }
    }

    return false;
}

function ai_move() {
    const ai_move_btn = document.getElementById("ai-move");
    if (ai_move_btn.innerHTML === "AI making a move...") return;
    ai_move_btn.innerHTML = "AI making a move...";

    setTimeout(() => {
        let msg = "Invalid player";
        if (player === Player.PUSHER) {
            msg = ai_move_pusher() ? "AI make move" : "AI failed to find a move";
        } else if (player === Player.REMOVER) {
            msg = ai_move_remover() ? "AI make move" : "AI failed to find a move";
        }
        ai_move_btn.innerHTML = msg;
    });
}

document.getElementById("winning-file").addEventListener("change", function(event) {
    var file = event.target.files[0]; // Get the selected file
    if (file) {
        document.getElementById("wl-n4k3").classList.remove("selected");
        document.getElementById("wl-n5k3").classList.remove("selected");
        document.getElementById("wl-n6k3").classList.remove("selected");
        decode_file(file, results => {
            winning_states = results;
        });
    }
});

document.getElementById("losing-file").addEventListener("change", function(event) {
    var file = event.target.files[0]; // Get the selected file
    if (file) {
        document.getElementById("wl-n4k3").classList.remove("selected");
        document.getElementById("wl-n5k3").classList.remove("selected");
        document.getElementById("wl-n6k3").classList.remove("selected");
        decode_file(file, results => {
            losing_states = results;
        });
    }
});
