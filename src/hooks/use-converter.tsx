"use client";

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
  type Dispatch,
  type MutableRefObject,
} from "react";
import type { AppState, AppAction } from "@/types";

// Initial state
const initialState: AppState = {
  inputMode: "upload",
  content: null,
  status: "idle",
  error: null,
  isPasteAreaVisible: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_INPUT_MODE":
      return {
        ...state,
        inputMode: action.mode,
      };

    case "LOAD_FILE":
      return {
        ...state,
        inputMode: "upload",
        content: {
          source: "file",
          filename: action.filename,
          content: action.content,
          size: action.size,
        },
        status: "ready",
        error: null,
        isPasteAreaVisible: false, // Collapse paste area when file is uploaded
      };

    case "LOAD_PASTE":
      if (!action.content.trim()) {
        return {
          ...state,
          content: null,
          status: "idle",
        };
      }
      return {
        ...state,
        inputMode: "paste",
        content: {
          source: "paste",
          filename: null,
          content: action.content,
          size: new Blob([action.content]).size,
        },
        status: "ready",
        error: null,
      };

    case "LOAD_SAMPLE":
      return {
        ...state,
        inputMode: "upload",
        content: {
          source: "sample",
          filename: "sample.md",
          content: action.content,
          size: action.size,
        },
        status: "ready",
        error: null,
        isPasteAreaVisible: false, // Collapse paste area when sample is loaded
      };

    case "CLEAR_CONTENT":
      return {
        ...state,
        content: null,
        status: "idle",
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        status: state.content ? "ready" : "idle",
        error: null,
      };

    case "TOGGLE_PASTE_AREA":
      return {
        ...state,
        isPasteAreaVisible: !state.isPasteAreaVisible,
      };

    default:
      return state;
  }
}

// Context
interface ConverterContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  // File upload trigger for "active export buttons" UX
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  triggerFileUpload: () => void;
}

const ConverterContext = createContext<ConverterContextType | null>(null);

// Provider
export function ConverterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Ref for file input element (registered by UploadCard)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Trigger file upload from anywhere (used by ExportRow when no content)
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <ConverterContext.Provider value={{ state, dispatch, fileInputRef, triggerFileUpload }}>
      {children}
    </ConverterContext.Provider>
  );
}

// Hook
export function useConverter() {
  const context = useContext(ConverterContext);
  if (!context) {
    throw new Error("useConverter must be used within a ConverterProvider");
  }
  return context;
}

