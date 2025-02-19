import { Input } from "@/components/ui/input"

interface BasicProductInfoProps {
  newProduct: {
    name: string
    minimumQty: number
  }
  handleInputChange: (field: "name" | "minimumQty", value: string | number) => void
}

export function BasicProductInfo({ newProduct, handleInputChange }: BasicProductInfoProps) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Product Name</label>
        <Input
          value={newProduct.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter product name"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Minimum Quantity</label>
        <Input
          type="number"
          value={newProduct.minimumQty}
          onChange={(e) => handleInputChange("minimumQty", e.target.value)}
          min="1"
          placeholder="Enter minimum quantity"
        />
      </div>
    </div>
  )
}

