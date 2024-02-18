import "./app.pcss";
import App from "./App.svelte";

// setup dayjs
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

const app = new App({
  target: document.getElementById("app"),
});

export default app;
