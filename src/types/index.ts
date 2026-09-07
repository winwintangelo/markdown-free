// Input modes
export type InputMode = "upload" | "paste";

// App status
export type AppStatus = "idle" | "ready" | "error";

// Closed vocabulary of chatbots the paste cleanup can recognise (analytics-safe)
export type ChatbotSource =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "deepseek"
  | "kimi"
  | "doubao"
  | "copilot"
  | "other";

// File state
export interface LoadedContent {
  source: "file" | "paste" | "sample";
  filename: string | null;
  content: string;
  size: number;
  /** Chatbot the pasted text appears to come from (paste cleanup), if any */
  sourceChatbot?: ChatbotSource | null;
  /** Lines of chat-UI residue removed by the paste cleanup */
  cleanedLines?: number;
}

// Error state
export interface AppError {
  code: string;
  message: string;
}

// App state
export interface AppState {
  inputMode: InputMode;
  content: LoadedContent | null;
  status: AppStatus;
  error: AppError | null;
  isPasteAreaVisible: boolean;
}

// App actions
export type AppAction =
  | { type: "SET_INPUT_MODE"; mode: InputMode }
  | { type: "LOAD_FILE"; filename: string; content: string; size: number }
  | { type: "LOAD_PASTE"; content: string; sourceChatbot?: ChatbotSource | null; cleanedLines?: number }
  | { type: "LOAD_SAMPLE"; content: string; size: number }
  | { type: "CLEAR_CONTENT" }
  | { type: "SET_ERROR"; error: AppError }
  | { type: "CLEAR_ERROR" }
  | { type: "TOGGLE_PASTE_AREA" };

