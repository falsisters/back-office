import { Input } from "@/components/ui/input"

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

export function SearchBar({ searchTerm, setSearchTerm, placeholder = "Search items..." }: SearchBarProps) {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-md"
    />
  )
}

