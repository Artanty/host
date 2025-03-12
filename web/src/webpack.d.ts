export {}; // This makes the file a module

declare global {
  interface Window {
    __webpack_remotes__?: Record<string, any>;
  }
}