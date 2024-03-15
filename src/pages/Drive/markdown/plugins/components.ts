import type { Plugin } from "svelte-exmarkdown";
import { TableBody, TableBodyCell, TableBodyRow, TableHeadCell } from "flowbite-svelte";

import H1 from "./components/H1.svelte";
import H2 from "./components/H2.svelte";
import H3 from "./components/H3.svelte";
import H4 from "./components/H4.svelte";
import H5 from "./components/H5.svelte";
import H6 from "./components/H6.svelte";
import A from "./components/A.svelte";
import P from "./components/P.svelte";
import Img from "./components/Img.svelte";
import Blockquote from "./components/Blockquote.svelte";
import Table from "./components/Table.svelte";
import THead from "./components/THead.svelte";

export const componentPlugin: Plugin = {
  renderer: {
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: P,
    a: A,
    img: Img,
    blockquote: Blockquote,
    table: Table,
    thead: THead,
    tbody: TableBody,
    row: TableBodyRow,
    th: TableHeadCell,
    td: TableBodyCell,
  },
};
