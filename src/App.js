import './App.css';
import MyTextField from './components/MyTextField';
import ScoresheetFrame from './components/Scoresheet/ScoresheetFrame';
import Title from './components/Title';
import { useState, useRef } from 'react';
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
  const [scoresheets, setScoresheets] = useState([]);
  const [newScoresheetName, setScoresheetNamee] = useState('');
  const scoresheetRef = useRef();

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

  const handleAddScoresheetClick = () => {
    if (newScoresheetName === ''){
      alert("Please enter a scoresheet name.");
      return;
    }
    const scoresheet = {scoresheetName: newScoresheetName};
    setScoresheets([...scoresheets, scoresheet]);
  }

  const handleScoresheetNameInput = (scoresheet) => {
    setScoresheetNamee(scoresheet);
  };
  
  const addScoresheets = () => {
    const divs = [];
    scoresheets.forEach((scoresheet) => {
      divs.push(
        <div className='vertical-list'>
          <ScoresheetFrame 
            isEditable={isEditable} 
            isCountback={isCountback}
            scoresheetName={scoresheet.scoresheetName}
          />
          <div className='thyckk-horizontal-line'></div>
        </div>
      );
    });
    return divs;
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
        <div className='vertical-line'></div>
        <MyTextField 
            placeholder="Enter Scoresheet Name..." 
            inputType='text' 
            ref={scoresheetRef} 
            onInputChange={handleScoresheetNameInput}
          />
        <button className='button-styling' onClick={handleAddScoresheetClick}>
          Add Scoresheet
        </button>
      </div>
      {addScoresheets()}
    </div>
  );
}

export default App;