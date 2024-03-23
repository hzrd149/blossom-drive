import { CompletionContext } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { type TreeFolder } from "blossom-drive-sdk";

export function createAutocompleteFromDrivePath(getFolder: (path: string) => TreeFolder) {
  return function autocomplete(context: CompletionContext) {
    let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (nodeBefore.name != "URL") return null;
    let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
    let fullPathBefore = /^\.?\/(.*\/)?/.exec(textBefore)?.[0];
    let pathBefore = /(\.?\/)[\w%]*$/.exec(textBefore);

    if (!pathBefore && !context.explicit) return null;
    if (!fullPathBefore) return null;

    try {
      let options: string[] = [];

      const folder = getFolder(fullPathBefore.replaceAll("%20", " "));
      for (const child of folder) options.push(child.name);

      return {
        from: pathBefore ? nodeBefore.from + pathBefore.index : context.pos,
        options: options.map((p) => {
          const path = ((pathBefore?.[1] ?? "/") + p).replaceAll(" ", "%20");
          return { label: path };
        }),
        validFor: /^(\/.*)?$/,
      };
    } catch (e) {
      return null;
    }
  };
}
