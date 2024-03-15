import type { Plugin } from "svelte-exmarkdown";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github.css";
import rehypeHighlight from "rehype-highlight";

export const highlightPlugin: Plugin = {
  rehypePlugin: [
    rehypeHighlight,
    {
      ignoreMissing: true,
      languages: {
        json,
        css,
        javascript,
        typescript,
        python,
      },
    },
  ],
};
