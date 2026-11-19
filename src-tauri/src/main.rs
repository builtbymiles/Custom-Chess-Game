// Prevents an extra console window on Windows in release builds. Harmless on macOS.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    miles_chess_game_lib::run();
}
