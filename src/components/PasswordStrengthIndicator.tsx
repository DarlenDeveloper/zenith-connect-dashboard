import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  regex: RegExp;
  text: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{8,}/, text: 'At least 8 characters long' },
  { regex: /[A-Z]/, text: 'Contains uppercase letter' },
  { regex: /[a-z]/, text: 'Contains lowercase letter' },
  { regex: /[0-9]/, text: 'Contains number' },
  { regex: /[^A-Za-z0-9]/, text: 'Contains special character' },
];

interface Props {
  password: string;
}

const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  const getStrengthPercentage = () => {
    if (!password) return 0;
    return (passwordRequirements.filter(req => req.regex.test(password)).length / passwordRequirements.length) * 100;
  };

  const getStrengthColor = () => {
    const strength = getStrengthPercentage();
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-3">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getStrengthColor()} transition-all duration-300`}
          style={{ width: `${getStrengthPercentage()}%` }}
        />
      </div>
      
      <div className="space-y-2">
        {passwordRequirements.map((requirement, index) => (
          <div key={index} className="flex items-center text-sm">
            {requirement.regex.test(password) ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-gray-300 mr-2" />
            )}
            <span className={requirement.regex.test(password) ? 'text-gray-700' : 'text-gray-500'}>
              {requirement.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator; 