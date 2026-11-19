//! MilesChessGame: the native shell around the web game.
//!
//! The game itself is the HTML/CSS/JS in the project root. Tauri opens a
//! window, shows those files in the system web view (the Safari engine) and
//! serves them from inside the app, so no web server is needed.

#[cfg(feature = "selftest")]
mod selftest;

pub fn run() {
    let builder = tauri::Builder::default();

    // Only compiled into test builds (`--features selftest`).
    #[cfg(feature = "selftest")]
    let builder = selftest::install(builder);

    builder
        .run(tauri::generate_context!())
        .expect("error while running MilesChessGame");
}
