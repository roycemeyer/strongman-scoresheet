import React from 'react'
import { SlArrowDown, SLArrowUp } from "react-icons/sl";
import { useState, useRef } from 'react';
import ScoresheetEvents from './ScoresheetEvents'
import MyTextField from '../MyTextField';
import MyLabel from '../MyLabel';
//----------------------------
function ScoresheetFrame({isEditable, isCountback, scoresheetName}) {
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [newAthleteName, setNewAthleteName] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const [events, setEvents] = useState([])
  const [athletes, setAthletes] = useState([])
  const eventFieldRef = useRef();
  const athleteFieldRef = useRef();

  // This form of modifyEvent forces each update to use the most recent events. 
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
      newEventType !== "MTime" &&
      newEventType !== "MDist" &&
      newEventType !== "DistToTime" &&
      newEventType !== "RepsInTime" &&
      newEventType !== "RepsToDistTime"
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
    const newAthlete = {
      athleteName: newAthleteName, 
      totalPoints: 0, 
      place: 0};
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
    const scoredAthletes = [...athletes];

    // Step 1: Calculate Total Points for Each Athlete
    scoredAthletes.forEach(athlete => {
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
    
    const athletePlacings = assignAthletePlacings(scoredAthletes);

    const finalAthletes = [...athletePlacings]
      .sort((a, b) => athletes.findIndex(athlete => athlete.athleteName === a.athleteName) - athletes.findIndex(athlete => athlete.athleteName === b.athleteName));
      setAthletes(finalAthletes);
  }

  const assignAthletePlacings = (scoredAthletes) => {
    scoredAthletes.sort((a, b) => b.totalPoints - a.totalPoints);
    let tiesBuffer = [];
    let currentPlace = 1;
    const placedAthletes = [];

    scoredAthletes.forEach((athlete, index) => {
      // detect ties
      if(scoredAthletes.length > index+1 && athlete.totalPoints === scoredAthletes[index+1].totalPoints)
      {
        tiesBuffer.push(athlete);
        if((scoredAthletes.length === index+2 // to handle if the next is the last athlete in list
        || athlete.totalPoints !== scoredAthletes[index+2].totalPoints)){ // Is this the last tie pair in the group?
          // If it is the last tie pair in the group, add the next one since it won't tie with ITS next
          tiesBuffer.push(scoredAthletes[index+1]);
          // since last pair it's complete; calculate placing

          if (isCountback){ // countback will place athletes based on most 1st place finishes, then 2nd if tied on 1st, etc.
            tiesBuffer.forEach((tiedAthlete) => {
              console.log(tiedAthlete.athleteName + " tied with points: " + tiedAthlete.totalPoints)
            });
            const sortedBuffer = countback(tiesBuffer);
            sortedBuffer.forEach((athlete) => {
              placedAthletes.push(athlete);
            });
          }
        }
      }
      // Check if last tie in group
      else if (tiesBuffer.indexOf(athlete) !== -1){ // if the athlete exists in the tie buffer but is not tied with its next, it's the last of a tie group
        tiesBuffer = []; // clear out the buffer since this tie group is completed
        return;
      }
      else { // if we got here, it means there's no tie and no tie group to worry about\
        console.log("No tie with athlete "+ athlete.athleteName)
        placedAthletes.push({
          athleteName: athlete.athleteName,
          result: athlete.result,
          place: 0,
          totalPoints: athlete.totalPoints
        });
      }
    });
    console.log("Sorted Athlete Placings: ")
    placedAthletes.forEach((athlete) => {
      console.log(athlete.athleteName + " score: " + athlete.totalPoints)
      athlete.place = currentPlace;
      currentPlace++;
    });
    return placedAthletes;
  };

  const countback = (tiesBuffer) => {
    const sortedBuffer = [];
    // CountbackTotals will hold a set of integers for each tied athlete equal to the number of athletes
    // each integer will represent the number of placings. So 3 1st place, 1 2nd place, 2 3rd place is 3,1,2 for example
    const countbackTotals = []; 
    tiesBuffer.forEach(() => {
      // populate countbackTotals 2D array with initial 0s
      const total = [];
      athletes.forEach(() => {
        total.push(0);
      });
      countbackTotals.push(total);
    });
    tiesBuffer.forEach((tiedAthlete, athIdx) => {
      // iterate through each event, and each result and total those into countback totals for each athlete
      events.forEach((event) => {
        event.results.forEach((result) => {
          if(tiedAthlete.athleteName === result.athleteName){
            countbackTotals[athIdx][result.place-1] += 1;
          }
        });
      });
    });
    countbackTotals.forEach((athleteCounts) => {
      let countPrint = "";
      athleteCounts.forEach((place) => {
        countPrint += "[" + place + "]"
      });
      console.log(countPrint);
    });
    // now we have the countback data, we need to sort the tiesBuffer 
    const sortedTies = sortTiedAthletes(tiesBuffer, countbackTotals);
    sortedTies.forEach((tiedAthlete) => {
      sortedBuffer.push(tiedAthlete);
    });
    console.log("Tiebreaker results order: ")
    sortedTies.forEach((athlete) => {
      console.log("ties: " + athlete.athleteName)
    });
    return sortedBuffer;
  };

  const sortAthletes = () => {
    // Sort athletes by place in descending order
    const sortedAthletes = [...athletes].sort((b, a) => b.place - a.place);

    // Update the athletes state
    setAthletes(sortedAthletes);

    // For each event, sort its results array to match the sorted athletes order
    const sortedEvents = events.map(event => {
      const sortedResults = [...event.results].sort((b, a) => {
        // Find the athlete object corresponding to the athleteName in the result
        const athleteAPlace = sortedAthletes.find(athlete => athlete.athleteName === a.athleteName).place;
        const athleteBPlace = sortedAthletes.find(athlete => athlete.athleteName === b.athleteName).place;
        
        // Compare based on the athlete's place value in descending order
        return athleteBPlace - athleteAPlace;
      });

      // Return a new event object with the sorted results
      return { ...event, results: sortedResults };
    });

    // Update the events state
    setEvents(sortedEvents);
  }

  const sortTiedAthletes = (tiedAthletes, countbackTotals) => {
    // The index of each athlete in `tiedAthletes` corresponds to the index of their countbackTotals
    return tiedAthletes.sort((a, b) => {
      const indexA = tiedAthletes.findIndex(athlete => athlete.athleteName === a.athleteName);
      const indexB = tiedAthletes.findIndex(athlete => athlete.athleteName === b.athleteName);
  
      // Iterate through each placing, starting from 1st place finishes
      for (let i = 0; i < countbackTotals[indexA].length; i++) {
        // Compare the number of finishes at the current placing
        if (countbackTotals[indexA][i] !== countbackTotals[indexB][i]) {
          // Invert the comparison because a higher number of first place finishes takes precedence
          return countbackTotals[indexB][i] - countbackTotals[indexA][i];
        }
      }
      
      // If all placings are tied, sort by name or maintain the existing order
      return a.athleteName.localeCompare(b.athleteName);
    });
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
        <button className='button-styling' onClick={updateScoresheet}>Update</button>
        <button className='button-styling' onClick={sortAthletes}><SlArrowDown className='input-filler'/></button>
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
              <option className='input' value="MTime">Max Time</option>
              <option className='input' value="MReps">Max Reps</option>
              <option className='input' value="MDist">Max Distance</option>
              <option className='input' value="DistToTime">Distance in Time</option>
              <option className='input' value="RepsInTime">Reps in Time</option>
              <option className='input' value="RepsToDistTime">Reps to Dist/Time</option>
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
            <div className='vertical-list'><MyLabel text ={scoresheetName}/></div>
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