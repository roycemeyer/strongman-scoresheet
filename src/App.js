import './App.css';
import MyLabel from './components/MyLabel';
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
    // this seems backwards to me, but setting it to 'count-back' when !isCountback produces the correct result somehow. 
    if (!isCountback) setTiebreakerText('Count-back');
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
      <div className='thyckk-horizontal-line'/>
      <div className='horizontal-list'>
        <div className='filler-foreground'>
          <MyLabel text="Options:" labelType={"text-label"}/>
        </div>
        <div className='vertical-space'/>
        <div className='filler-foreground'>
          <MyLabel text="Enable/disable editing" labelType={"simple-text-label"}/>
          <button className='button-styling' onClick={handleEditableClick}>
            {editableText}
          </button>
        </div>
        <div className='vertical-space'/>
        <div className='filler-foreground'>
          <MyLabel text="Tiebreaker rules:" labelType={"simple-text-label"}/>
          <button className='button-styling' onClick={handleTiebreakerClick}>
            {tiebreakerText}
          </button>
        </div>
      </div>
      <div className='thyckk-horizontal-line'/>
      <div className='vertical-list'>
        <MyLabel text="Add New Scoresheet: " labelType={"text-label"}/>
        <div className='horizontal-list'>
          <div className='vertical-space'/>
          <MyTextField 
            placeholder="Enter Scoresheet Name..." 
            inputType='text' 
            ref={scoresheetRef} 
            onInputChange={handleScoresheetNameInput}
            background='filler-foreground'
          />
          <button className='button-styling' onClick={handleAddScoresheetClick}>
            Add Scoresheet
          </button>
        </div>
      </div>
      <div className='thyckk-horizontal-line'/>
      {addScoresheets()}
    </div>
  );
}

export default App;