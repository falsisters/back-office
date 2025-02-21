import { Input } from "@/components/ui/input"

interface BasicProductInfoProps {
  product: {
    name: string
  }
  handleInputChange: (field: "name", value: string) => void
}

export function BasicProductInfo({ product, handleInputChange }: BasicProductInfoProps) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Product Name</label>
        <Input
          value={product.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter product name"
        />
      </div>
    </div>
  )
}

