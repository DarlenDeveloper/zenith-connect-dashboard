
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Download, Upload, Plus, Search,
  SlidersHorizontal, Check 
} from "lucide-react";

// Product type definition
interface Product {
  id: number;
  image: string;
  name: string;
  status: "Scoping" | "Quoting" | "Production" | "Shipped";
  inventory: string;
  incoming: number;
  outOfStock: number;
  grade: "A" | "B" | "C";
}

// Sample product data matching the image
const sampleProducts: Product[] = [
  { id: 1, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Hydrate replenish(body oil)", status: "Scoping", inventory: "45 in stock", incoming: 12, outOfStock: 11, grade: "A" },
  { id: 2, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Hydrate replenish", status: "Scoping", inventory: "45 in stock", incoming: 65, outOfStock: 11, grade: "A" },
  { id: 3, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Illumination (mask)", status: "Quoting", inventory: "45 in stock", incoming: 35, outOfStock: 11, grade: "B" },
  { id: 4, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Act+ acne hair mask", status: "Scoping", inventory: "45 in stock", incoming: 24, outOfStock: 11, grade: "A" },
  { id: 5, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Mecca cosmetica", status: "Production", inventory: "0 in stock", incoming: 22, outOfStock: 11, grade: "A" },
  { id: 6, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Hylamide (Glow)", status: "Scoping", inventory: "45 in stock", incoming: 86, outOfStock: 11, grade: "B" },
  { id: 7, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Mecca cosmetica(body oil)", status: "Scoping", inventory: "45 in stock", incoming: 68, outOfStock: 11, grade: "A" },
  { id: 8, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Hydrate replenish(body oil)", status: "Production", inventory: "0 in stock", incoming: 70, outOfStock: 11, grade: "C" },
  { id: 9, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Illumination (mask)", status: "Scoping", inventory: "45 in stock", incoming: 56, outOfStock: 11, grade: "A" },
  { id: 10, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Mecca cosmetica(body oil)", status: "Shipped", inventory: "0 in stock", incoming: 72, outOfStock: 11, grade: "A" },
  { id: 11, image: "/lovable-uploads/903ab07b-515c-4c88-96be-d793314dfd5f.png", name: "Hylamide (Glow)", status: "Scoping", inventory: "45 in stock", incoming: 80, outOfStock: 11, grade: "B" },
];

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Scoping":
      return "bg-blue-100 text-blue-600";
    case "Quoting":
      return "bg-green-100 text-green-600";
    case "Production":
      return "bg-orange-100 text-orange-600";
    case "Shipped":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const Products = () => {
  const [filter, setFilter] = useState("All");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedProducts(selectAll ? [] : sampleProducts.map(p => p.id));
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <h1 className="text-xl font-medium">Products</h1>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Upload size={16} className="mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
              <Plus size={16} className="mr-2" />
              Add product
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Products header */}
            <div className="p-5">
              <h2 className="text-lg font-semibold">My products</h2>
              
              {/* Tabs */}
              <div className="flex mt-4 border-b border-gray-200">
                <button 
                  className={`px-4 py-2 text-sm font-medium ${filter === 'All' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                  onClick={() => setFilter('All')}
                >
                  <span className="flex items-center">
                    <Check size={16} className="mr-1" />
                    All
                  </span>
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${filter === 'Active' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                  onClick={() => setFilter('Active')}
                >
                  <span className="flex items-center">Active</span>
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${filter === 'Draft' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                  onClick={() => setFilter('Draft')}
                >
                  <span className="flex items-center">Draft</span>
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${filter === 'Archived' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                  onClick={() => setFilter('Archived')}
                >
                  <span className="flex items-center">Archived</span>
                </button>
              </div>
            </div>

            {/* Search and filter */}
            <div className="px-5 py-3 flex justify-between border-b border-gray-200">
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                  placeholder="Search"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-gray-200">
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200">
                  Sort
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200">
                  Add
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Inventory (count)</th>
                    <th scope="col" className="px-4 py-3">Incoming (count)</th>
                    <th scope="col" className="px-4 py-3">Out of Stock</th>
                    <th scope="col" className="px-4 py-3">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleProducts.map((product) => (
                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <span>{product.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{product.inventory}</td>
                      <td className="px-4 py-3">{product.incoming}</td>
                      <td className="px-4 py-3">{product.outOfStock}</td>
                      <td className="px-4 py-3">{product.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Products;
