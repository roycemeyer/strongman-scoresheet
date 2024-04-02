import React from 'react'
import { useState, useRef } from 'react';
import ScoresheetEvents from './ScoresheetEvents'
import MyTextField from '../MyTextField';
import MyLabel from '../MyLabel';
//----------------------------
function ScoresheetFrame({isEditable}) {
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [newAthleteName, setNewAthleteName] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [events, setEvents] = useState([])
  const [athletes, setAthletes] = useState([])
  const eventFieldRef = useRef();
  const athleteFieldRef = useRef();

  // This form of modifyEvent is designed to force each update to use the most recent events. 
  const modifyEvent = (eventIndex, newEventData) => {
    setEvents(currentEvents => {
      const updatedEvents = [...currentEvents];
      if (eventIndex === currentEvents.length) {
        updatedEvents.push(newEventData);
      } else {
        updatedEvents[eventIndex] = newEventData;
      }
      return updatedEvents; // Return the modified array to update the state
    });
  };

  const addEvent = () => {
    if(!newEventName || newEventName === '')
    {
      alert("Please include an event name");
      return;
    }
    if(
      newEventType !== "MWeight" &&
      newEventType !== "MReps" &&
      newEventType !== "MDist"
      )
    {
      alert("Please include an event type");
      return;
    }
    const event = {eventName: newEventName, eventType: newEventType, results: []};
    athletes.forEach((athlete) => {
      event.results.push({
        athleteName: athlete.athleteName,
        result: 0,
        place: athletes.length,
        points: 0
      })
    });
    setEvents([...events, event]);
    clearEventNameInputText("");
    setNewEventName('');
    setNewEventType('');
    resetSelect();
  };

  const addAthlete = () => {
    if(!newAthleteName || newAthleteName === '')
    {
      alert("Please include an Athlete name");
      return;
    }
    // ensure athlete is unique
    let athleteUnique = true;
    athletes.forEach((athlete) => {
      if (athlete.athleteName === newAthleteName) athleteUnique = false
    });
    if (!athleteUnique){
      alert("Athlete already present. Cannot add duplicate athlete.");
      return;
    }
    // add athlete to list. 
    const newAthlete = {athleteName: newAthleteName, totalPoints: 0, place: 0};
    setAthletes([...athletes, newAthlete]);
    clearAthleteNameInputText("");
    setNewAthleteName('');
  };

  const handleEventNameInput = (event) => {
    setNewEventName(event);
  };

  const handleEventTypeSelect = (event) => {
    setNewEventType(event.target.value);
    setSelectedValue(event.target.value);
  }

  const resetSelect = () => {
    setSelectedValue('')
  }

  const handleAthleteNameInput = (value) => {
    setNewAthleteName(value);
  };

  const clearEventNameInputText = () =>{
    eventFieldRef.current.clearText();
  }

  const clearAthleteNameInputText = () =>{
    athleteFieldRef.current.clearText();
  }

  const updateScoresheet = () => {
    const updatedAthletes = [...athletes];

    // Step 1: Calculate Total Points for Each Athlete
    updatedAthletes.forEach(athlete => {
      let totalPoints = 0;
      events.forEach(event => {
        //console.log("Events results List length: " + events.results.length)
        event.results.forEach(result => {
          if (result.athleteName === athlete.athleteName) {
            console.log("Athlete: " + athlete.athleteName + " points: " + result.points)
            totalPoints += result.points;
          }
        });
      });
      console.log("Athlete: " + athlete.athleteName + " points: " + totalPoints)
      console.log("---------------------")
      athlete.totalPoints = totalPoints;
    });

    // Step 2: Sort Athletes Based on Total Points and Assign Placings
    updatedAthletes.sort((a, b) => b.totalPoints - a.totalPoints);
    updatedAthletes.forEach((athlete, index) => {
      athlete.place = index + 1; // Assign placings based on sorted order
    });

    const finalAthletes = [...updatedAthletes]
      .sort((a, b) => athletes.findIndex(athlete => athlete.athleteName === a.athleteName) - athletes.findIndex(athlete => athlete.athleteName === b.athleteName));
      setAthletes(finalAthletes);
  }

  const renderEvents = () => {
    const divs = [];
    events.forEach((event, index) => {
      //console.log("index generated: " + index);
      divs.push(
        <ScoresheetEvents 
          isEditable={isEditable} 
          event={event} 
          key={index} 
          onModifyEvent={modifyEvent} 
          eventIndex={index}
          athletes={athletes}
        />)
      divs.push(<div className='vertical-line'></div>)
    });
    return divs;
  }

  const renderAthletes = () => {
    const divs = [];
    athletes.forEach((athlete, index) => {
      divs.push(<MyLabel text={athlete.athleteName} key={index}/>)
    });
    return divs;
  }

  const renderScoresPlacings = () => {
    const placings = [];
    const scores = [];

    placings.push(<MyLabel text = "Place"/>);
    placings.push(<div className='horizontal-line'/>);

    scores.push(<MyLabel text = "Total"/>);
    scores.push(<div className='horizontal-line'/>);

    athletes.forEach((athlete, index) => {
      placings.push(<MyLabel text={athlete.place}/>)
      scores.push(<MyLabel text={athlete.totalPoints}/>)
    });
    const div = 
      <div className='filler'>
        <div className='vertical-list'><MyLabel text ="-"/></div>
        <div className='horizontal-list'>
          <div className='vertical-list'>{placings}</div>
          <div className='soft-vertical-line'></div>
          <div className='vertical-list'>{scores}</div>
        </div>
      </div>
    ;
    return div;
  }

  const renderAddEvents = () => {
    return (
      <div className='filler'>
          <MyTextField 
            placeholder="Enter Event Name..." 
            inputType='text' 
            ref={eventFieldRef} 
            onInputChange={handleEventNameInput}
          />
          <div className='scoresheet-events'>
            <select className='input' value={selectedValue} onChange={handleEventTypeSelect}>
              <option value="">Event Type</option>
              <option className='input' value="MWeight">Max Weight</option>
              <option className='input' value="MReps">Max Reps</option>
              <option className='input' value="MDist">Max Distance</option>
            </select>
            <button className='button-styling' onClick={addEvent}>Add Event</button>
          </div>
      </div>
    )
  }

  const renderAddAthletes = () => {
    return (
      <div className='filler'>
          <MyTextField 
            placeholder="Enter Athlete Name..." 
            inputType='text' 
            ref={athleteFieldRef} 
            onInputChange={handleAthleteNameInput}
          />
          <div className='scoresheet-athletes'>
            <button className='button-styling' onClick={addAthlete}>Add Athlete</button>
          </div>
      </div>
    )
  }

  return (
    <div className='add-section'>
      <div className='scoresheet-events'>
        <div className='athletes-list'>
          <div className='right-justify'>
            <button className='button-styling' onClick={updateScoresheet}>Update</button>
          </div>
            <MyLabel text={'Athletes'}/>
          <div className='horizontal-line'/>
          {renderAthletes()}
          {isEditable ? renderAddAthletes() : <div/> }
        </div>
        <div className='vertical-line'></div>
          {renderScoresPlacings()}
        <div className='vertical-line'></div>
        <div className='add-event-wrapper'>
          {renderEvents()}
          {isEditable ? renderAddEvents() : <div/> }
        </div>
      </div>
    </div>
  );
}

export default ScoresheetFrame