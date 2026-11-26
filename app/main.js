// DataNusa bootstrap: capture page errors for the screenshot driver, then
// start the hash router from views.js.
import { init } from "./views.js";

window.__pageErrors = [];
window.addEventListener("error", (e) => window.__pageErrors.push(String(e.message || e.error)));
window.addEventListener("unhandledrejection", (e) => window.__pageErrors.push("rejection: " + String(e.reason)));

init();
