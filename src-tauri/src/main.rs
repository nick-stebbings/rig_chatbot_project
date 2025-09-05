// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    init_logging();

    agent_conversation_lib::run()
}

#[cfg(target_os = "android")]
fn init_logging() {
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Debug)
            .with_filter(
                android_logger::FilterBuilder::new()
                    .parse("debug")
                    .build(),
            ),
    );
}

#[cfg(not(target_os = "android"))]
fn init_logging() {
    env_logger::init();
}