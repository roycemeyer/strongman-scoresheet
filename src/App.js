import './App.css';
import ScoresheetFrame from './components/Scoresheet/ScoresheetFrame';
import Title from './components/Title';
import { useState } from 'react';
//-------------------------
function App() {
  const initialEditText = 'Disable Editing';
  const initialEditable = true;
  const initialcountbackText = 'Count-back';
  const initialIsCountback = true;
  const [editableText, setEditableText] = useState(initialEditText);
  const [isEditable, setIsEditable] = useState(initialEditable);
  const [tiebreakerText, setTiebreakerText] = useState(initialcountbackText);
  const [isCountback, setIsCountback] = useState(initialIsCountback);

  const handleEditableClick = () => {
      if (isEditable) setEditableText('Enable Editing');
      else setEditableText('Disable Editing');
      setIsEditable(!isEditable);
  }
  const handleTiebreakerClick = () => {
    if (isCountback) setTiebreakerText('Count-back');
    else setTiebreakerText('Last Event');
    setIsCountback(!isCountback);
}

  return (
    <div  className="App">
    <Title/>
      <div className='horizontal-list-dark'>
      <button className='button-styling' onClick={handleEditableClick}>
          {editableText}
        </button>
        <button className='button-styling' onClick={handleTiebreakerClick}>
          {tiebreakerText}
        </button>
      </div>
      <ScoresheetFrame 
        isEditable={isEditable} 
        isCountback={isCountback}
      />
    </div>
  );
}

export default App;