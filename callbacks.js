"use strict";

function token_onclick(index) {
    // If not Pusher's turn, do nothing
    if (player !== 0) return;

    // Find which token is clicked
    let col = Math.floor(index / K);
    let token_id = index % K;

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
    refresh_button_area();
}

function col_onclick(col) {
    // If not Remover's turn, do nothing
    if (player !== 1) return;
    col_removed = col;
    update_tokens();
    refresh_button_area();
}

function menu_select(tabname) {
    // Update tabs
    Array.from(document.querySelectorAll(".section-line.menu div")).forEach(item => {
        if (item.id === "tab-" + tabname) {
            item.classList.add("selected");
        } else {
            item.classList.remove("selected");
        }
    });

    // Update sections
    Array.from(document.getElementsByClassName("section")).forEach(item => {
        item.classList.add("hidden");
    });
    sections_to_display[tabname].forEach(id => {
        document.getElementById(id).classList.remove("hidden");
    });
}

function inc_N(delta) {
    let N_new = Math.min(Math.max(N + delta, N_min), N_max);
    if (N_new === N) return;
    init(N_new, K);
}

function inc_K(delta) {
    let K_new = Math.min(Math.max(K + delta, K_min), K_max);
    if (K_new === K) return;
    init(N, K_new);
}

function toggle_token_label() {
    token_label = (token_label + 1) % token_labels.length;
    update_tokens();
    refresh_button_area();
}

function restart() {
    init(N, K);
}

function end_turn() {
    // Check if can end turn
    if (!can_end_turn()) return;

    // End turn
    commit();
}
