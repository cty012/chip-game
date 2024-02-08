"use strict";

/**
 * Game constants
 */
const N_min = 2;
const N_max = 7;
const M_min = 1;
const M_max = 8;

/**
 * Colors
 */
const pusher_color = "#a0a0f0";
const pusher_color_light = "#d0d0f0";
const pusher_color_dark = "#4040f0";
const remover_color = "#f0a0a0";
const remover_color_light = "#f0d0d0";
const remover_color_dark = "#f04040";

/**
 * UI constants
 */
const grid_size = 90;
const token_sep = 26;

/**
 * UI elements in the HTML
 */
const ui_board_container = document.getElementById("board-container");
const ui_board = document.getElementById("board");
const ui_tokens = document.getElementById("tokens");
