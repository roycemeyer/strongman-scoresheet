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
    console.log(newValue);
    if (newValue === ''){
      onInputChange(newValue);
      return;
    }
    console.log("didn't return");
    switch(inputType)
    {
      case 'number':
        if(newValue < 0)
          newValue = 0;
        break;
      case 'integer':
        newValue = newValue.replace(/[^0-9]/g, '');
        break;
      case 'dist-time':
        // Allow positive numbers with up to two decimal places followed by 's', 'm', 'f', or 'ft'
        // Remove invalid characters
        newValue = newValue.replace(/[^\d.sfmft]/g, '');
        // Check and enforce the format for time or distance
        const regex = /^(\d+(\.\d{0,2})?)((s)|(m)|(f|ft))?$/;
        if (!regex.test(newValue) && newValue !== '') {
          // If newValue doesn't match the pattern, revert to the last valid value
          newValue = inputValue;
        }
        break;
      case 'reps-time':
        // Permissively allow digits, spaces, "in", period, and 's'
        newValue = newValue.replace(/[^\d\s.ins]/g, '');
        // we validate during score calculations whether this is valid input
        break;
      case 'reps-disttime':
        // Permissively allow digits, spaces, "in", period, and 's'
        newValue = newValue.replace(/[^\dsmrepft]/g, '');
        // we validate during score calculations whether this is valid input
      default:
        setInputValue(newValue);
    }
    if (onInputChange) onInputChange(newValue);
};

  const determineInputType = (inputType) => {
    if (inputType === "number"
    || inputType === "integer")
      return 'number';
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