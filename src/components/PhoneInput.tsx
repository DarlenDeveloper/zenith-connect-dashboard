
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
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, required }) => {
  // Extract country code and phone number from the value
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Remove the country code part if it exists
    const match = value.match(/^\+(\d+)\s*(.*)$/);
    return match ? match[2] : value;
  });

  const [countryCode, setCountryCode] = useState(() => {
    // Extract the country code if it exists, default to +1 (US)
    const match = value.match(/^\+(\d+)/);
    return match ? match[1] : "1";
  });

  // List of common country codes
  const countryCodes: CountryCode[] = [
    { code: "1", dial: "+1", name: "United States" },
    { code: "44", dial: "+44", name: "United Kingdom" },
    { code: "91", dial: "+91", name: "India" },
    { code: "61", dial: "+61", name: "Australia" },
    { code: "86", dial: "+86", name: "China" },
    { code: "49", dial: "+49", name: "Germany" },
    { code: "33", dial: "+33", name: "France" },
    { code: "81", dial: "+81", name: "Japan" },
    { code: "7", dial: "+7", name: "Russia" },
    { code: "55", dial: "+55", name: "Brazil" },
    { code: "234", dial: "+234", name: "Nigeria" },
    { code: "27", dial: "+27", name: "South Africa" },
  ];

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
        <SelectTrigger className="w-[100px] rounded-r-none border-r-0">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
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
