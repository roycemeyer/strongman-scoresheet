import React, { forwardRef, useImperativeHandle, useState } from 'react';

const MyTextField = forwardRef (({ inputType, onInputChange, placeholder, width }, ref ) => {

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue); 
    onInputChange(newValue); 
    
  };

  const determineInputType  = (inputType) => {
    if (inputType === 'number') return 'number';
    if (inputType === 'integer') return 'number';
    return 'text';
  }

  const handlePaste = (event) => {
    const pasteContent = event.clipboardData.getData('text')
    if ((!/^-?\d*$/.test(pasteContent)) && inputType === 'integer') {
      event.preventDefault();
    }
  };

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