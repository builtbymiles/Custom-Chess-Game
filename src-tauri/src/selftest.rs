//! A way to check the BUILT app from the command line. Test builds only.
//!
//! There is no browser automation for a macOS Tauri app, so this lets a test
//! ask the running window a question:
//!
//!   MCG_SELFTEST='return document.title' ./MilesChessGame
//!
//! waits a few seconds (MCG_SELFTEST_WAIT, default 6), runs that JavaScript
//! in the game's window, prints `SELFTEST <result>` and quits.
//!
//! It is behind the `selftest` cargo feature, so the app you install does not
//! contain it: running JavaScript from an environment variable has no place
//! in a finished app.

use std::{thread, time::Duration};
use tauri::{Builder, Manager, Wry};

/// Runs in the page before the game does: remembers every error, so a test can ask for them.
const COLLECT_ERRORS: &str = r#"
window.__errs = [];
window.addEventListener('error', e => window.__errs.push('error: ' + (e.message || (e.target && e.target.src) || e.type)), true);
window.addEventListener('unhandledrejection', e => window.__errs.push('rejection: ' + ((e.reason && e.reason.message) || e.reason)));
"#;

/// Called by the page with the answer. Prints it and quits the app.
#[tauri::command]
fn selftest_report(report: String) {
    println!("SELFTEST {report}");
    std::process::exit(0);
}

pub fn install(builder: Builder<Wry>) -> Builder<Wry> {
    builder
        .plugin(
            tauri::plugin::Builder::<Wry>::new("selftest-errors")
                .js_init_script(COLLECT_ERRORS.to_string())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![selftest_report])
        .setup(|app| {
            let Ok(script) = std::env::var("MCG_SELFTEST") else {
                return Ok(()); // not asked to test: behave like the normal app
            };
            let wait = std::env::var("MCG_SELFTEST_WAIT").ok().and_then(|s| s.parse().ok()).unwrap_or(6);
            let window = app.get_webview_window("main").expect("the main window exists");

            thread::spawn(move || {
                thread::sleep(Duration::from_secs(wait));
                let js = format!(
                    "(async () => {{ let r; try {{ r = await (async () => {{ {script} }})() }} catch (e) {{ r = 'JS ERROR: ' + e.message }} \
                     window.__TAURI_INTERNALS__.invoke('selftest_report', {{ report: typeof r === 'string' ? r : JSON.stringify(r) }}) }})()"
                );
                window.eval(&js).expect("could not run the self-test script");
                // If the page never answers, do not hang forever.
                thread::sleep(Duration::from_secs(20));
                println!("SELFTEST TIMEOUT: the page did not answer");
                std::process::exit(1);
            });
            Ok(())
        })
}
