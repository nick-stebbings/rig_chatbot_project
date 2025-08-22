import { useEffect, useRef, useState } from "preact/hooks";
import preactLogo from "./assets/preact.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { listen } from "@tauri-apps/api/event";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolCalls?: any;
}

interface AgentChunk {
  delta?: string;
  tool_calls?: any;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages, currentAssistantMessage]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen<AgentChunk>("agent-chunk", (event) => {
        const chunk = event.payload;
        console.log("Received chunk:", chunk);

        if (chunk.delta) {
          setCurrentAssistantMessage((prev) => prev + chunk.delta);
        }

        if (chunk.tool_calls) {
          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              content: `Tool called: ${JSON.stringify(chunk.tool_calls, null, 2)}`,
              timestamp: new Date(),
              toolCalls: chunk.tool_calls,
            },
          ]);
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (currentAssistantMessage && !isLoading) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: currentAssistantMessage,
          timestamp: new Date(),
        },
      ]);
      setCurrentAssistantMessage("");
    }
  }, [isLoading, currentAssistantMessage]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputText;
    setInputText("");
    setIsLoading(true);
    setCurrentAssistantMessage("");

    try {
      await invoke("chat_with_agent", { message: messageText });
    } catch (error) {
      console.error("Error invoking chat_with_agent:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  const autoResizeTextarea = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <main class="container">
      <div class="bg-gray-50 h-screen flex flex-col overflow-hidden mb-12 pt-12">
        {/* Header */}
        <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div class="flex items-center space-x-3">
            <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">AI Agent Chat</h1>
              <p class="text-xs text-gray-500">Powered by Rig Framework</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center">
              <span class="text-white text-xs font-bold">AI</span>
            </div>
          </div>
        </header>

        {/* Conversation Area */}
        <main class="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} class={`flex items-start space-x-2 message-animate ${message.role === "user" ? "flex-row-reverse" : ""
              }`}>
              <div class={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${message.role === "user"
                  ? "bg-gradient-to-br from-green-400 to-green-600"
                  : message.role === "assistant"
                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                    : "bg-gradient-to-br from-yellow-400 to-yellow-600"
                }`}>
                <span class="text-white text-xs font-bold">
                  {message.role === "user" ? "U" : message.role === "assistant" ? "AI" : "S"}
                </span>
              </div>
              <div class="flex flex-col max-w-[75%]">
                <span class={`text-xs text-gray-500 mb-1 ${message.role === "user" ? "mr-2 text-right" : "ml-2"
                  }`}>
                  {message.role === "user" ? "You" : message.role === "assistant" ? "Assistant" : "System"} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div class={`rounded-2xl px-4 py-3 shadow-sm relative ${message.role === "user"
                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm bubble-tail-right user-message"
                    : message.role === "assistant"
                      ? "bg-white text-gray-800 border border-gray-100 rounded-tl-sm bubble-tail-left"
                      : "bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-mono"
                  }`}>
                  {message.role === "system" && (
                    <div class="text-xs font-semibold mb-1">System</div>
                  )}
                  <p class="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Current streaming assistant message */}
          {isLoading && currentAssistantMessage && (
            <div class="flex items-start space-x-2 message-animate">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-md">
                <span class="text-white text-xs font-bold">AI</span>
              </div>
              <div class="flex flex-col max-w-[75%]">
                <span class="text-xs text-gray-500 mb-1 ml-2">Assistant • streaming...</span>
                <div class="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 relative bubble-tail-left">
                  <p class="text-sm leading-relaxed whitespace-pre-wrap">{currentAssistantMessage}</p>
                  <span class="animate-pulse text-blue-500">▊</span>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isLoading && !currentAssistantMessage && (
            <div class="flex items-start space-x-2 message-animate">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-md">
                <span class="text-white text-xs font-bold">AI</span>
              </div>
              <div class="flex flex-col max-w-[75%]">
                <span class="text-xs text-gray-500 mb-1 ml-2">Assistant • thinking...</span>
                <div class="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 relative bubble-tail-left">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <div class="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          {/* Quick Actions */}
          <div class="flex space-x-2 mb-3 overflow-x-auto pb-2">
            <button
              onClick={() => setInputText("What's the current time?")}
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition-colors"
            >
              Ask Time
            </button>
            <button
              onClick={() => setInputText("Tell me about yourself")}
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition-colors"
            >
              About You
            </button>
            <button
              onClick={() => setInputText("Help me with something")}
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition-colors"
            >
              Get Help
            </button>
          </div>

          {/* Input Field */}
          <div class="flex items-start space-x-2">
            <textarea
              value={inputText}
              onInput={(e) => {
                setInputText(e.currentTarget.value);
                autoResizeTextarea(e);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Message your AI agent..."
              class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
              rows={1}
              style="min-height: 44px; max-height: 120px;"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              class="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
