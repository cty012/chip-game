"use strict";

/**
 * Game constants
 */
const N_min = 2;
const N_max = 7;
const K_min = 1;
const K_max = 9;

/**
 * Players
 */
const Player = {
    PUSHER: 0,
    REMOVER: 1,
};

/**
 * Compare results
 */
const Compare = {
    LESS: -1,
    EQUAL: 0,
    GREATER: 1,
    NONE: null,
};

/**
 * Colors
 */
const pusher_color = "#a0a0f0";
const pusher_color_light = "#d0d0f0";
const pusher_color_dark = "#4040f0";
const remover_color = "#ff8e4d";
const remover_color_light = "#ffcab3";
const remover_color_dark = "#e65400";

/**
 * UI constants
 */
const grid_size = 90;
const token_diams = [40, 30, 30, 30, 20, 20, 20, 20, 20];
const token_seps = [52, 40, 40, 40, 28, 28, 28, 28, 28];
const token_labels = ["Hidden", "Letter", "Number"]

/**
 * UI elements in the HTML
 */
const ui_board_container = document.getElementById("board-container");
const ui_board = document.getElementById("board");
const ui_row_numbers = document.getElementById("row-numbers");
const ui_tokens = document.getElementById("tokens");

const ui_button_area = document.getElementById("button-area");
const ui_display_n_dec = document.getElementById("display-n-dec");
const ui_display_n = document.getElementById("display-n");
const ui_display_n_inc = document.getElementById("display-n-inc");
const ui_display_k_dec = document.getElementById("display-k-dec");
const ui_display_k = document.getElementById("display-k");
const ui_display_k_inc = document.getElementById("display-k-inc");

const ui_token_label = document.getElementById("token-label");

const ui_turn = document.getElementById("turn");
const ui_player = document.getElementById("player");
const ui_undo = document.getElementById("undo");
const ui_redo = document.getElementById("redo");
const ui_end_turn = document.getElementById("end-turn");

/**
 * Sections to display in each tab
 */
const sections_to_display = {
    "settings": ["sec-menu-bar", "sec-game-settings", "sec-display-settings", "sec-controls"],
    "ai": ["sec-menu-bar", "sec-ai", "sec-controls"],
};
