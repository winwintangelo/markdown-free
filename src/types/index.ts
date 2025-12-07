// Input modes
export type InputMode = "upload" | "paste";

// App status
export type AppStatus = "idle" | "ready" | "error";

// File state
export interface LoadedContent {
  source: "file" | "paste";
  filename: string | null;
  content: string;
  size: number;
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
  | { type: "LOAD_PASTE"; content: string }
  | { type: "CLEAR_CONTENT" }
  | { type: "SET_ERROR"; error: AppError }
  | { type: "CLEAR_ERROR" }
  | { type: "TOGGLE_PASTE_AREA" };

