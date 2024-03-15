import { CompletionContext } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import type TreeFolder from "../../../../blossom-drive-client/FileTree/TreeFolder";

export function createAutocompleteFromDrivePath(getFolder: (path: string) => TreeFolder) {
  return function autocomplete(context: CompletionContext) {
    let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (nodeBefore.name != "URL") return null;
    let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
    let fullPathBefore = /^\.?\/(.*\/)?/.exec(textBefore)?.[0];
    let pathBefore = /(\.?\/)\w*$/.exec(textBefore);

    console.log(textBefore, fullPathBefore, pathBefore);

    if (!pathBefore && !context.explicit) return null;
    if (!fullPathBefore) return null;

    try {
      let options: string[] = [];

      const folder = getFolder(fullPathBefore);
      for (const child of folder) options.push(child.name);

      return {
        from: pathBefore ? nodeBefore.from + pathBefore.index : context.pos,
        options: options.map((p) => ({ label: (pathBefore?.[1] ?? "/") + p })),
        validFor: /^(\/.*)?$/,
      };
    } catch (e) {
      return null;
    }
  };
}
