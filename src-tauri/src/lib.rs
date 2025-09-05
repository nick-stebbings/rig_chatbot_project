use rig::{
    client::{completion::CompletionClientDyn, ProviderClient}, completion::Prompt, providers::{self, openai},
};
use tauri::Emitter;
use serde::Serialize;
use log::{error, info};

mod tool;

#[derive(Clone, Serialize)]
struct AgentChunk {
    delta: Option<String>,
    tool_calls: Option<serde_json::Value>,
}

#[tauri::command]
async fn chat_with_agent(message: String, app_handle: tauri::AppHandle) -> Result<(), ()> {
    let openai_client = openai::Client::from_env();

    let agent = openai_client
            .agent(providers::openai::GPT_4O)
            .preamble("You are a helpful assistant. Use your tools when necessary.")
            .tool(tool::GetCurrentTime)
            .build();

    let result = match agent.prompt(&message).await {
        Ok(response) => {
            let agent_chunk = AgentChunk {
                delta: Some(response),
                tool_calls: None,
            };
            app_handle.emit("agent-chunk", agent_chunk).unwrap();
        },
        Err(e) => {
            error!("Agent chat error: {:?}", e);
            let error_chunk = AgentChunk {
                delta: Some(format!("Error: {}", e)),
                tool_calls: None,
            };
            
            if let Err(emit_err) = app_handle.emit("agent-chunk", error_chunk) {
                error!("Failed to emit error chunk: {:?}", emit_err);
            }
        }
    }; 

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    android_logger::init_once(
    android_logger::Config::default()
            .with_max_level(log::LevelFilter::Debug)
            .with_tag("AgentConversation")
    );

    // Load environment variables from embedded .env content
    const ENV_CONTENT: &str = include_str!("../.env");
    info!("Loading embedded .env content");
    
    for line in ENV_CONTENT.lines() {
        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim().trim_matches('"');
            if !key.is_empty() && !value.is_empty() {
                std::env::set_var(key, value);
                info!("Set env var: {}", key);
            }
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_with_agent])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
