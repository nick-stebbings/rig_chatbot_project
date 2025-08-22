use rig::{
    client::{completion::CompletionClientDyn, ProviderClient}, completion::Prompt, providers::{self, openai}
};

mod tool;

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

#[tokio::main]
async fn main() {
    // Prompt the model and print its response
    let response = chat_with_agent("What is the current time?".to_string()).await.unwrap_or_else(|_| "Error occurred".to_string());

    println!("GPT-4: {response}");
}
