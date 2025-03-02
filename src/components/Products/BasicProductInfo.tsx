// BasicProductInfo.tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BasicProductInfoProps {
  product: { name: string }
  handleInputChange: (field: "name", value: string) => void
}

export function BasicProductInfo({ product, handleInputChange }: BasicProductInfoProps) {
  return (
    <div>
      <Label htmlFor="product-name">Product Name</Label>
      <Input
        id="product-name"
        value={product.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        placeholder="Enter product name"
        required
      />
    </div>
  )
}