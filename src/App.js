import './App.css';
import ScoresheetFrame from './components/Scoresheet/ScoresheetFrame';
import Title from './components/Title';
import { useState } from 'react';
//-------------------------
function App() {
  const initialText = 'Disable Editing';
  const initialEditable = true;
  const [buttonText, setButtonText] = useState(initialText);
  const [isEditable, setIsEditable] = useState(initialEditable);

  const handleEditableClick = () => {
      if (isEditable) setButtonText('Enable Editing');
      else setButtonText('Disable Editing');
      setIsEditable(!isEditable);
  }

  return (
    <div  className="App">
      <Title/>
      <button className='button-styling' onClick={handleEditableClick}>
        {buttonText}
      </button>
      <ScoresheetFrame 
        isEditable={isEditable} 
      />
    </div>
  );
}

export default App;