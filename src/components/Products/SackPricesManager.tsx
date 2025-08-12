import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { CurrencyCalculator } from "../../../utils/currencyCalculator";
import {
  type SackType,
  type SackPrice,
  type SpecialPrice,
  SackTypeEnum,
} from "../../../utils/types/schema.type";
import { useToast } from "@/hooks/use-toast";

type EditableSackPrice = Partial<SackPrice> & {
  profit?: number;
  specialPrice?: (Partial<SpecialPrice> & { profit?: number }) | null;
};

interface SackPricesManagerProps {
  sackPrices: EditableSackPrice[];
  setSackPrices: React.Dispatch<React.SetStateAction<EditableSackPrice[]>>;
  errors: Record<string, string>;
  deletedSackPriceIds: string[];
  setDeletedSackPriceIds: React.Dispatch<React.SetStateAction<string[]>>;
  deletedSpecialPriceIds: string[];
  setDeletedSpecialPriceIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function SackPricesManager({
  sackPrices,
  setSackPrices,
  errors,
  deletedSackPriceIds,
  setDeletedSackPriceIds,
  deletedSpecialPriceIds,
  setDeletedSpecialPriceIds,
}: SackPricesManagerProps) {
  const { toast } = useToast();

  const addSackPrice = () => {
    const availableTypes = Object.values(SackTypeEnum.enum).filter(
      (type) => !sackPrices.some((sp) => sp.type === type)
    );

    if (availableTypes.length === 0) {
      toast({ title: "All sack types already added", variant: "destructive" });
      return;
    }

    setSackPrices([
      ...sackPrices,
      {
        type: availableTypes[0],
        price: 0,
        stock: 0,
      },
    ]);
  };

  const removeSackPrice = (index: number) => {
    // Simply remove from the array - backend will detect missing IDs and delete them
    setSackPrices((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSpecialPrice = (index: number) => {
    // Simply remove special price - backend will detect missing ID and delete it
    setSackPrices((prev) => {
      const newPrices = [...prev];
      newPrices[index] = {
        ...newPrices[index],
        specialPrice: null,
      };
      return newPrices;
    });
  };

  // Utility function to prevent wheel events on number inputs
  const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Helper function to safely parse decimal values
  const parseDecimalValue = (value: string): number => {
    if (!value || value === "") return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to format decimal values for input display
  const formatDecimalForInput = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "";
    return value.toString();
  };

  const updateSackPrice = (
    index: number,
    field: keyof EditableSackPrice,
    value: any
  ) => {
    setSackPrices((prev) => {
      const newPrices = [...prev];

      // Handle decimal conversion for price and stock fields
      if (field === "price" || field === "stock") {
        const decimalValue = parseDecimalValue(value);
        newPrices[index] = {
          ...newPrices[index],
          [field]: decimalValue,
        };
      } else if (field === "profit") {
        const decimalValue =
          value === "" ? undefined : parseDecimalValue(value);
        newPrices[index] = {
          ...newPrices[index],
          [field]:
            decimalValue !== undefined
              ? CurrencyCalculator.round(decimalValue)
              : undefined,
        };
      } else {
        newPrices[index] = {
          ...newPrices[index],
          [field]: value,
        };
      }
      return newPrices;
    });
  };

  const updateSpecialPrice = (index: number, field: string, value: any) => {
    setSackPrices((prev) => {
      const newPrices = [...prev];
      if (!newPrices[index].specialPrice) {
        newPrices[index].specialPrice = {
          price: 0,
          minimumQty: 0,
        };
      }

      // Handle decimal conversion for special price fields
      if (field === "price") {
        const decimalValue = parseDecimalValue(value);
        newPrices[index].specialPrice = {
          ...newPrices[index].specialPrice!,
          [field]: decimalValue,
        };
      } else if (field === "minimumQty") {
        const intValue = parseInt(value) || 0;
        newPrices[index].specialPrice = {
          ...newPrices[index].specialPrice!,
          [field]: intValue,
        };
      } else if (field === "profit") {
        const decimalValue =
          value === "" ? undefined : parseDecimalValue(value);
        newPrices[index].specialPrice = {
          ...newPrices[index].specialPrice!,
          [field]:
            decimalValue !== undefined
              ? CurrencyCalculator.round(decimalValue)
              : undefined,
        };
      } else {
        newPrices[index].specialPrice = {
          ...newPrices[index].specialPrice!,
          [field]: value,
        };
      }
      return newPrices;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Sack Prices</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSackPrice}
          className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Plus size={14} />
          Add
        </Button>
      </div>

      {errors.pricing && (
        <p className="text-xs text-destructive">{errors.pricing}</p>
      )}

      {errors.sackPrices && (
        <p className="text-xs text-destructive">{errors.sackPrices}</p>
      )}

      {sackPrices.length === 0 ? (
        <div className="text-center py-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            No sack prices added yet
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addSackPrice}
            className="mt-2 text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            Add Sack Price
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sackPrices.map((sack, index) => (
            <div
              key={sack.id || `new-${index}`}
              className="space-y-3 border p-4 rounded-lg relative hover:shadow-sm transition-shadow"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSackPrice(index)}
                className="h-6 w-6 absolute top-2 right-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={sack.type as string}
                    onValueChange={(value) =>
                      updateSackPrice(index, "type", value as SackType)
                    }
                  >
                    <SelectTrigger className="focus:ring-primary">
                      <SelectValue placeholder="Sack Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SackTypeEnum.enum).map((type) => {
                        const isUsed = sackPrices.some(
                          (sp, i) => i !== index && sp.type === type
                        );
                        return (
                          <SelectItem key={type} value={type} disabled={isUsed}>
                            {type === "FIFTY_KG"
                              ? "50 KG"
                              : type === "TWENTY_FIVE_KG"
                              ? "25 KG"
                              : "5 KG"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Price (₱)</Label>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={formatDecimalForInput(sack.price)}
                    onChange={(e) =>
                      updateSackPrice(index, "price", e.target.value)
                    }
                    onWheel={preventWheelChange}
                    min="0"
                    step="0.01"
                    className={
                      errors[`sackPrice_${index}_price`]
                        ? "border-destructive"
                        : "focus-visible:ring-primary"
                    }
                  />
                  {errors[`sackPrice_${index}_price`] && (
                    <p className="text-xs text-destructive">
                      {errors[`sackPrice_${index}_price`]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={formatDecimalForInput(sack.stock)}
                    onChange={(e) =>
                      updateSackPrice(index, "stock", e.target.value)
                    }
                    onWheel={preventWheelChange}
                    min="0"
                    className={
                      errors[`sackPrice_${index}_stock`]
                        ? "border-destructive"
                        : "focus-visible:ring-primary"
                    }
                  />
                  {errors[`sackPrice_${index}_stock`] && (
                    <p className="text-xs text-destructive">
                      {errors[`sackPrice_${index}_stock`]}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Profit (₱)</Label>
                  <Input
                    type="number"
                    placeholder="Profit (optional)"
                    value={formatDecimalForInput(sack.profit)}
                    onChange={(e) =>
                      updateSackPrice(index, "profit", e.target.value)
                    }
                    onWheel={preventWheelChange}
                    min="0"
                    step="1"
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Special Price (Optional)
                  </Label>
                  {sack.specialPrice && (sack.specialPrice.price ?? 0) > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecialPrice(index)}
                      className="h-6 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Remove Special Price
                    </Button>
                  )}
                </div>
                {sack.specialPrice ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Special Price (₱)</Label>
                      <Input
                        type="number"
                        placeholder="Special Price"
                        value={formatDecimalForInput(sack.specialPrice?.price)}
                        onChange={(e) =>
                          updateSpecialPrice(index, "price", e.target.value)
                        }
                        onWheel={preventWheelChange}
                        min="0"
                        step="0.01"
                        className="focus-visible:ring-secondary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Minimum Quantity</Label>
                        <Input
                          type="number"
                          placeholder="Min Qty"
                          value={formatDecimalForInput(
                            sack.specialPrice?.minimumQty
                          )}
                          onChange={(e) =>
                            updateSpecialPrice(
                              index,
                              "minimumQty",
                              e.target.value
                            )
                          }
                          onWheel={preventWheelChange}
                          min="0"
                          className={
                            errors[`sackPrice_${index}_specialPrice_minimumQty`]
                              ? "border-destructive"
                              : "focus-visible:ring-secondary"
                          }
                        />
                        {errors[
                          `sackPrice_${index}_specialPrice_minimumQty`
                        ] && (
                          <p className="text-xs text-destructive">
                            {
                              errors[
                                `sackPrice_${index}_specialPrice_minimumQty`
                              ]
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Profit (₱)</Label>
                        <Input
                          type="number"
                          placeholder="Profit (optional)"
                          value={formatDecimalForInput(
                            sack.specialPrice?.profit
                          )}
                          onChange={(e) =>
                            updateSpecialPrice(index, "profit", e.target.value)
                          }
                          onWheel={preventWheelChange}
                          min="0"
                          step="1"
                          className="focus-visible:ring-secondary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateSpecialPrice(index, "price", "0");
                      updateSpecialPrice(index, "minimumQty", "0");
                    }}
                    className="w-full h-8 text-xs text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                  >
                    Add Special Price
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
