import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

const MyTextField = forwardRef(({ inputType, onInputChange, placeholder, width, initialValue }, ref) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (initialValue !== undefined) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  const handleInputChange = (event) => {
    let newValue = event.target.value;

    if (inputType === 'integer') {
      // Allow only positive integers
      newValue = newValue.replace(/[^0-9]/g, '');
    } else if (inputType === 'dist-time') {
      // Allow positive numbers with up to two decimal places followed by 's', 'm', 'f', or 'ft'
      // Remove invalid characters
      newValue = newValue.replace(/[^\d.sfmft]/g, '');
      // Check and enforce the format for time or distance
      const regex = /^(\d+(\.\d{0,2})?)((s)|(m)|(f|ft))?$/;
      if (!regex.test(newValue) && newValue !== '') {
        // If newValue doesn't match the pattern, revert to the last valid value
        newValue = inputValue;
      }
    } else if (inputType === 'reps-time') {
      // Permissively allow digits, spaces, "in", period, and 's'
      newValue = newValue.replace(/[^\d\s.ins]/g, '');
      // we will need to velidate during score calculations whether this is valid input
    }

    setInputValue(newValue);
    if (onInputChange) onInputChange(newValue);
};

  const determineInputType = (inputType) => {
    return 'text'; // Use 'text' type for all custom validations
  }

  useImperativeHandle(ref, () => ({
    clearText() {
      setInputValue("");
    },
  }));

  return (
    <div className='my-textfield'>
      <input
        type={determineInputType(inputType)}
        className='input'
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        style={{ width }}
      />
    </div>
  );
});

export default MyTextField;