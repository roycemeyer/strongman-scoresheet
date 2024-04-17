import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

const MyTextField = forwardRef(({ background, inputType, onInputChange, placeholder, width, initialValue }, ref) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (initialValue !== undefined) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  const handleInputChange = (event) => {
    let newValue = event.target.value;
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
        // we validate on blur whether this is valid input
        break;
      case 'reps-disttime':
        // Permissively allow digits, spaces, "in", period, and 's'
        newValue = newValue.replace(/[^\dsmrepft\s]/g, '');
        // we validate on blur whether this is valid input
        break;
    }
    setInputValue(newValue);
  };

  const validateResults = (newValue) => {
    let isValidInput = true;
    // Validation for simple event types is accomplished inside the MyTextField component.
    //  Reps In Time was too complex of Regex for me to validate there without restricting input. 
    console.log("blur: " + newValue + " " + inputType);
    switch (inputType) {
      case 'reps-time':
        const fullRegex = /^(\d{1,2} in \d{0,3}(\.\d{1,2})?s)$/;
        if (!fullRegex.test(newValue)) {
          isValidInput = false;
          console.log("Not valid: " + newValue);
        }
        break;
      case 'reps-disttime':
        const regex1 = /^\d+rep$/; // supporting '2rep'
        const regex2 = /^\d+(\.\d{1,2})?[smf](t)?$/; //supporting s, m, f, ft
        if (!(newValue === '0' || newValue === '1 rep' || /^\d+ reps$/.test(newValue) && parseInt(newValue) > 1)
          && !regex2.test(newValue)){
          isValidInput = false;
        }
    }
    return isValidInput;
  };

  const cleanResults = (newValue) => {
    let regex = '';
    switch (inputType) {
      case 'reps-time':
        regex = /^(\d{1,2} in \d{0,3}(\.\d{1,2})?)$/; // "4 in 34.32" if they forgot the s, I still want to accept it
        if(regex.test(newValue)) {
          return newValue + 's';
        }
        regex = /(\d+)\s+(\d+\.\d+)/; // "4 34.32" even if they have no 'in' I also want to accept it
        if(regex.test(newValue)) {
          return newValue.replace(regex, "$1 in $2s");
        }
        break;
      case 'reps-disttime':
        // Normalize accepted inputs
        const trimmedInput = newValue.trim(); // Trim whitespace
        
        if (trimmedInput === '0 reps') {
            return '0';
        } else if (trimmedInput === '1' || trimmedInput === '1 rep') {
            return '1 rep';
        } else {
            // Handle cases for other integers
            let match = trimmedInput.match(/^(\d+)\s*(rep|reps)?$/);
            if (match) {
                let number = parseInt(match[1]);
                if (number === 0) {
                    return '0';
                } else if (number === 1) {
                    return '1 rep';
                } else {
                    return `${number} reps`;
                }
            }
        }
        // Return original input if no patterns matched (optional: could handle errors differently)
        return newValue;
      default: return newValue;
    }
  };

  const submitInputChange = (event) => {
    let newValue = event.target.value;
    newValue = cleanResults(newValue);
    console.log(newValue);
    if (!validateResults(newValue)){
      newValue = "";
    }
    setInputValue(newValue);
    if (onInputChange) onInputChange(newValue);
  }

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
    <div className={background}>
      <input
        className='input'
        type={determineInputType(inputType)}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={submitInputChange}
        placeholder={placeholder}
        style={{ width }}
      />
    </div>
  );
});

export default MyTextField;