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
    // TODO AI should search for all possible moves and find one that results in winning states.
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

        // Sort the affected column
        result_game_state[move].sort((a, b) => b - a);

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
        decode_file(file, results => {
            winning_states = results;
        });
    }
});

document.getElementById("losing-file").addEventListener("change", function(event) {
    var file = event.target.files[0]; // Get the selected file
    if (file) {
        decode_file(file, results => {
            losing_states = results;
        });
    }
});
