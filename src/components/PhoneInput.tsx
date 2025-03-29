import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  region: string;
  priority?: number;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, required }) => {
  // Extract country code and phone number from the value
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Remove the country code part if it exists
    const match = value.match(/^\+(\d+)\s*(.*)$/);
    return match ? match[2] : value;
  });

  const [countryCode, setCountryCode] = useState(() => {
    // Extract the country code if it exists, default to "254" (Kenya)
    const match = value.match(/^\+(\d+)/);
    return match ? match[1] : "254";
  });

  // List of African country codes, with East African countries prioritized
  const countryCodes: CountryCode[] = [
    // East African countries (prioritized)
    { code: "254", dial: "+254", name: "Kenya", region: "East Africa", priority: 1 },
    { code: "256", dial: "+256", name: "Uganda", region: "East Africa", priority: 1 },
    { code: "255", dial: "+255", name: "Tanzania", region: "East Africa", priority: 1 },
    { code: "250", dial: "+250", name: "Rwanda", region: "East Africa", priority: 1 },
    { code: "257", dial: "+257", name: "Burundi", region: "East Africa", priority: 1 },
    { code: "211", dial: "+211", name: "South Sudan", region: "East Africa", priority: 1 },
    { code: "251", dial: "+251", name: "Ethiopia", region: "East Africa", priority: 1 },
    
    // Other African countries
    { code: "234", dial: "+234", name: "Nigeria", region: "West Africa", priority: 2 },
    { code: "233", dial: "+233", name: "Ghana", region: "West Africa", priority: 2 },
    { code: "237", dial: "+237", name: "Cameroon", region: "Central Africa", priority: 2 },
    { code: "27", dial: "+27", name: "South Africa", region: "Southern Africa", priority: 2 },
    { code: "20", dial: "+20", name: "Egypt", region: "North Africa", priority: 2 },
    { code: "212", dial: "+212", name: "Morocco", region: "North Africa", priority: 2 },
    { code: "213", dial: "+213", name: "Algeria", region: "North Africa", priority: 2 },
    { code: "260", dial: "+260", name: "Zambia", region: "Southern Africa", priority: 2 },
    { code: "263", dial: "+263", name: "Zimbabwe", region: "Southern Africa", priority: 2 },
    { code: "264", dial: "+264", name: "Namibia", region: "Southern Africa", priority: 2 },
    { code: "267", dial: "+267", name: "Botswana", region: "Southern Africa", priority: 2 },
    { code: "221", dial: "+221", name: "Senegal", region: "West Africa", priority: 2 },
    { code: "225", dial: "+225", name: "Côte d'Ivoire", region: "West Africa", priority: 2 },
    { code: "258", dial: "+258", name: "Mozambique", region: "Southern Africa", priority: 2 },
  ];

  // Sort countries by priority and then by name
  const sortedCountryCodes = [...countryCodes].sort((a, b) => {
    // First sort by priority (lower number comes first)
    if ((a.priority || 3) !== (b.priority || 3)) {
      return (a.priority || 3) - (b.priority || 3);
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    onChange(`+${newCode} ${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    onChange(`+${countryCode} ${newNumber}`);
  };

  return (
    <div className="flex">
      <Select
        value={countryCode}
        onValueChange={handleCountryCodeChange}
      >
        <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {sortedCountryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center">
                {country.dial} <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">({country.name})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="rounded-l-none flex-1"
        placeholder="Phone number"
        required={required}
      />
    </div>
  );
};

export default PhoneInput;
