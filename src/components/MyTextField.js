import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

const MyTextField = forwardRef (({ inputType, onInputChange, placeholder, width, initialValue }, ref ) => {

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (initialValue !== undefined) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue); 
    if(onInputChange) onInputChange(newValue); 
  };

  const determineInputType  = (inputType) => {
    if (inputType === 'number') return 'number';
    if (inputType === 'integer') return 'number';
    return 'text';
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
        style={{width}}
      />
    </div>
  );
});

export default MyTextField;