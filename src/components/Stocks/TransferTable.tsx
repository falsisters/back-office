import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TransferResponse } from "../../../utils/types/getAllTransfers.type"
import { format } from "date-fns"

interface TransferTableProps {
  transfers: TransferResponse[]
}

const formatTransferType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

export default function TransferTable({ transfers }: TransferTableProps) {
  if (transfers.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/20">
        <p className="text-muted-foreground mb-2 text-lg">No transfers found</p>
        <p className="text-muted-foreground">No transfer history available</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="font-semibold text-base">Date</TableHead>
            <TableHead className="font-semibold text-base">Name</TableHead>
            <TableHead className="font-semibold text-base">Type</TableHead>
            <TableHead className="font-semibold text-base">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer) => (
            <TableRow key={transfer.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">
                {format(new Date(transfer.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{transfer.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  transfer.type === 'OWN_CONSUMPTION' ? 'bg-blue-100 text-blue-800' :
                  transfer.type === 'RETURN_TO_WAREHOUSE' ? 'bg-green-100 text-green-800' :
                  transfer.type === 'KAHON' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {formatTransferType(transfer.type)}
                </span>
              </TableCell>
              <TableCell>{transfer.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
