'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { parse, isValid, format } from 'date-fns';

interface DateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
}

export function DateInput({ value, onChange, error }: DateInputProps) {
  const [inputValue, setInputValue] = useState(value ? format(value, 'dd/MM/yyyy') : '');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (value) {
      setInputValue(format(value, 'dd/MM/yyyy'));
    }
  }, [value]);

  const validateAndUpdateDate = (input: string) => {
    // Clear errors
    setLocalError('');

    // If empty, clear the date
    if (!input.trim()) {
      onChange(undefined);
      return;
    }

    // Check format (DD/MM/YYYY)
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
      setLocalError('Format invalide. Utilisez DD/MM/YYYY');
      return;
    }

    // Parse the date
    const parsedDate = parse(input, 'dd/MM/yyyy', new Date());

    // Check if date is valid
    if (!isValid(parsedDate)) {
      setLocalError('Date invalide');
      return;
    }

    // Check if date is not in the future
    if (parsedDate > new Date()) {
      setLocalError('La date ne peut pas être dans le futur');
      return;
    }

    // Check if year is reasonable (between 1900 and current year)
    const year = parsedDate.getFullYear();
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      setLocalError('Année invalide (doit être entre 1900 et maintenant)');
      return;
    }

    // If all validations pass, update the date
    onChange(parsedDate);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow only numbers and /
    const cleaned = newValue.replace(/[^\d/]/g, '');
    
    // Auto-format as user types
    let formatted = cleaned;
    if (cleaned.length >= 2 && !cleaned.includes('/')) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && formatted.split('/').length < 3) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    
    // Limit the total length
    formatted = formatted.slice(0, 10);
    
    setInputValue(formatted);

    // Only validate if we have a complete date
    if (formatted.length === 10) {
      validateAndUpdateDate(formatted);
    }
  };

  const handleBlur = () => {
    if (inputValue.length > 0 && inputValue.length < 10) {
      setLocalError('Format invalide. Utilisez DD/MM/YYYY');
    }
  };

  return (
    <div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="JJ/MM/AAAA"
        className={localError || error ? 'border-red-500' : ''}
      />
      {(localError || error) && (
        <p className="text-sm text-red-500 mt-1">
          {localError || error}
        </p>
      )}
      <p className="text-sm text-gray-500 mt-1">
        Format: JJ/MM/AAAA (exemple: 01/01/1990)
      </p>
    </div>
  );
}