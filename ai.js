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
    const parsed_token_moved = Array.from({ length: n }, () => Array(k).fill(false));

    // Process each subsequent line to extract pairs
    for (let i = 0; i < n; i++) {
        const row = lines[i+1].trim().split(/\s+/);

        if (row.length !== k) {
            return null;
        }

        row.forEach((pair, j) => {
            const [a, b] = pair.split(':').map(Number);
            parsed_game_state[i][j] = a;
            parsed_token_moved[i][j] = (b !== 0);
        });
    }

    return { parsed_game_state, parsed_token_moved };
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
    // TODO AI should search for all possible moves and find one that results in losing states.
}

function ai_move() {
    if (player === 0) {
        ai_move_pusher();
    } else if (player === 1) {
        ai_move_remover();
    }
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
