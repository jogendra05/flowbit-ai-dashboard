import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const invoices = [
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
  { vendor: "Phunix GmbH", invoices: "19.08.2025", value: "€ 736.78,44,00" },
];

export function InvoicesByVendor() {
  return (
    <Card className="p-6 w-full flex flex-col h-full">
      <div className="mb-6">
        <h3 className="mb-1 font-semibold">Invoices by Vendor</h3>
        <p className="text-sm text-gray-500">Top vendors by invoice count and net value.</p>
      </div>

      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#E4E4E7] ">
              <TableHead className="text-xs font-semibold">Vendor</TableHead>
              <TableHead className="text-xs font-semibold"># Invoices</TableHead>
              <TableHead className="text-xs text-right font-semibold">Net Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm">{invoice.vendor}</TableCell>
                <TableCell className="text-sm">{invoice.invoices}</TableCell>
                <TableCell className="text-sm text-right">{invoice.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
