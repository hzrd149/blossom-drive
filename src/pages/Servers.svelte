<script>
  import {
    Button,
    Input,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
</script>

<Table>
  <TableHead>
    <TableHeadCell>Server URL</TableHeadCell>
    <TableHeadCell>Color</TableHeadCell>
    <TableHeadCell>Category</TableHeadCell>
    <TableHeadCell>Price</TableHeadCell>
  </TableHead>
  <TableBody>
    <TableBodyRow>
      <TableBodyCell>https://cdn.satellite.earth</TableBodyCell>
      <TableBodyCell>Sliver</TableBodyCell>
      <TableBodyCell>Laptop</TableBodyCell>
      <TableBodyCell>$2999</TableBodyCell>
    </TableBodyRow>
    <TableBodyRow>
      <TableBodyCell>Microsoft Surface Pro</TableBodyCell>
      <TableBodyCell>White</TableBodyCell>
      <TableBodyCell>Laptop PC</TableBodyCell>
      <TableBodyCell>$1999</TableBodyCell>
    </TableBodyRow>
    <TableBodyRow>
      <TableBodyCell>Magic Mouse 2</TableBodyCell>
      <TableBodyCell>Black</TableBodyCell>
      <TableBodyCell>Accessories</TableBodyCell>
      <TableBodyCell>
        <a href="#" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Remove</a>
      </TableBodyCell>
    </TableBodyRow>
  </TableBody>
</Table>

<form class="flex gap-2 px-2">
  <Input placeholder="https://cdn.example.com" /><Button class="shrink-0">Add Server</Button>
</form>
