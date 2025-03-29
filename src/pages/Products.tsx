
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Download, Plus, Search, SlidersHorizontal, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Mock product data
const products = [
  {
    id: 1,
    name: "Hydrate replenish(body oil)",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 12,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 2,
    name: "Hydrate replenish",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 65,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 3,
    name: "Illumination (mask)",
    image: "https://via.placeholder.com/40",
    status: "Quoting",
    inventoryCount: "45 in stock",
    incomingCount: 35,
    outOfStock: 11,
    grade: "B"
  },
  {
    id: 4,
    name: "Act+ acne hair mask",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 24,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 5,
    name: "Mecca cosmetica",
    image: "https://via.placeholder.com/40",
    status: "Production",
    inventoryCount: "0 in stock",
    incomingCount: 22,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 6,
    name: "Hylamide (Glow)",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 86,
    outOfStock: 11,
    grade: "B"
  },
  {
    id: 7,
    name: "Mecca cosmetica(body oil)",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 68,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 8,
    name: "Hydrate replenish(body oil)",
    image: "https://via.placeholder.com/40",
    status: "Production",
    inventoryCount: "0 in stock",
    incomingCount: 70,
    outOfStock: 11,
    grade: "C"
  },
  {
    id: 9,
    name: "Illumination (mask)",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 56,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 10,
    name: "Mecca cosmetica(body oil)",
    image: "https://via.placeholder.com/40",
    status: "Shipped",
    inventoryCount: "0 in stock",
    incomingCount: 72,
    outOfStock: 11,
    grade: "A"
  },
  {
    id: 11,
    name: "Hylamide (Glow)",
    image: "https://via.placeholder.com/40",
    status: "Scoping",
    inventoryCount: "45 in stock",
    incomingCount: 80,
    outOfStock: 11,
    grade: "B"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Scoping":
      return "bg-blue-100 text-blue-800";
    case "Quoting":
      return "bg-green-100 text-green-800";
    case "Production":
      return "bg-orange-100 text-orange-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Products = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(products.map(product => product.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-2xl font-semibold">My products</h2>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={16} />
              Import
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload size={16} />
              Export
            </Button>
            <Button size="sm" className="bg-black text-white gap-2 hover:bg-gray-800">
              <Plus size={16} />
              Add product
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
              <TabsList className="grid w-auto inline-grid grid-cols-4 max-w-md bg-transparent gap-2">
                <TabsTrigger
                  value="all"
                  className={`rounded-sm px-3 py-1.5 h-8 font-normal ${
                    selectedTab === "all" ? "border-b-2 border-black bg-transparent" : "bg-transparent text-gray-500"
                  }`}
                >
                  <Check size={16} className="mr-2 text-gray-400" />
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className={`rounded-sm px-3 py-1.5 h-8 font-normal ${
                    selectedTab === "active" ? "border-b-2 border-black bg-transparent" : "bg-transparent text-gray-500"
                  }`}
                >
                  <Check size={16} className="mr-2 text-gray-400" />
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className={`rounded-sm px-3 py-1.5 h-8 font-normal ${
                    selectedTab === "draft" ? "border-b-2 border-black bg-transparent" : "bg-transparent text-gray-500"
                  }`}
                >
                  <Check size={16} className="mr-2 text-gray-400" />
                  Draft
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className={`rounded-sm px-3 py-1.5 h-8 font-normal ${
                    selectedTab === "archived" ? "border-b-2 border-black bg-transparent" : "bg-transparent text-gray-500"
                  }`}
                >
                  <Check size={16} className="mr-2 text-gray-400" />
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="p-4 flex items-center justify-between border-b">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 h-9 w-full focus-visible:ring-1 focus-visible:ring-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal size={16} className="mr-2" />
                Sort
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectAll} 
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[250px]">Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inventory (count)</TableHead>
                  <TableHead>Incoming (count)</TableHead>
                  <TableHead>Out of Stock</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(product.id)} 
                        onCheckedChange={() => handleSelectItem(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 rounded-md object-cover" 
                      />
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{product.inventoryCount}</TableCell>
                    <TableCell className="text-gray-700">{product.incomingCount}</TableCell>
                    <TableCell className="text-gray-700">{product.outOfStock}</TableCell>
                    <TableCell>
                      <Badge className={`${
                        product.grade === "A" ? "bg-emerald-100 text-emerald-800" :
                        product.grade === "B" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {product.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
