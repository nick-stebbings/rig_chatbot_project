use rig::{
    client::{completion::CompletionClientDyn, ProviderClient}, completion::Prompt, providers::{self, openai}
};

mod tool;

#[tauri::command]
async fn chat_with_agent(message: String) -> Result<String, ()> {
    let openai_client = openai::Client::from_env();

    let agent = openai_client
            .agent(providers::openai::GPT_4O)
            .preamble("You are a helpful assistant. Use your tools when necessary.")
            .tool(tool::GetCurrentTime)
            .build();

    let result = match agent.prompt(&message).await {
        Ok(response) => response,
        Err(e) => {
            eprintln!("Error during chat: {}", e);
            return Err(());
        }
    }; 

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_with_agent])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
