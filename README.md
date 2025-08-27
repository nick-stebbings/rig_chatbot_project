# Rust AI Chatbot Tutorial: Part 1

Welcome to the repository for Part 1 of my YouTube tutorial series on building a simple AI chatbot using Rust, Rig, and Tauri for Android.

This project is the starting point for our journey into creating a powerful, cross-platform AI application. In this first part, we focus on the fundamentals of interacting with an AI model using the `rig` crate in a Rust environment.

## Part 1: Introduction to Rig

In this initial part of the tutorial, we cover the following:

* **Setting up a new Rust project.**
* **Integrating the `rig` crate** to connect to OpenAI's GPT-4o model.
* **Creating a custom tool** for our AI agent to get the current time.
* **Sending a prompt** to the agent and receiving a response.
* **Basic project structure** and dependencies using Cargo.

## Getting Started

To get this project running on your local machine, follow these steps:

### Prerequisites

* Make sure you have **Rust installed**. If not, you can install it from [rust-lang.org](https://www.rust-lang.org/).
* You will need an **OpenAI API key**. You can get one from the [OpenAI Platform](https://platform.openai.com/).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Set up your environment variables:**
    You'll need to set the `OPENAI_API_KEY` environment variable. Open your terminal and use one of the following commands, depending on your operating system.

    **For macOS and Linux:**
    ```sh
    export OPENAI_API_KEY='your-api-key-goes-here'
    ```

    **For Windows:**
    ```sh
    set OPENAI_API_KEY=your-api-key-goes-here
    ```
    Remember to replace `your-api-key-goes-here` with your actual OpenAI API key.

3.  **Run the project:**
    ```sh
    cargo run
    ```

You should see the chatbot's response printed to the console.

## Code Overview

Here's a quick look at the key files in this project:

* `src/main.rs`: This is the main entry point of our application. It sets up the OpenAI client, creates an agent, adds our custom tool, and sends a prompt to the model.
* `src/tool.rs`: This file defines our custom `GetCurrentTime` tool. This tool allows the AI agent to get the current local time and use it in its responses.
* `Cargo.toml`: This file contains the project's dependencies, including `rig-core`, `tokio`, and `chrono`.

## What's Next?

This is just the beginning! In the next parts of this series, we will:

* **Part 2:** Integrate this chatbot into a **Tauri application**, create a user interface, and run it on Android.
* **Part 3:** Implement more advanced **tool use with a simple MCP server**, allowing our chatbot to perform more complex tasks.

Stay tuned for the next videos in the series!