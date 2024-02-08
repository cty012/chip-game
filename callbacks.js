function token_onclick(index) {
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
