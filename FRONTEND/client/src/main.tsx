import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import App from "./App";

/** safe empty theme */
const theme = extendTheme({});

/** render normal (no weird casting) */
const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root in index.html");

const root = ReactDOM.createRoot(rootEl);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
);