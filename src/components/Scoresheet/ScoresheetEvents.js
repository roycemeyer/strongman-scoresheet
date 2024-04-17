import React, { useEffect, useRef, useState } from 'react'
import MyLabel from '../MyLabel'
import { SlArrowDown} from "react-icons/sl";
import MyTextField from '../MyTextField';

// this is used in the useEffect to get the previous value of event.result to see if a change was made
function usePrevious(value){
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function ScoresheetEvents({isEditable, isEditAthEvents, event, onModifyEvent, eventIndex, sortAthletesByEvent, isSortedBy, key, athletes}) {

  // for editing the event type
  const [selectedValue, setSelectedValue] = useState('');

  const handleEventTypeSelect = (event) => {
    setNewEventType(event.target.value);
    setSelectedValue(event.target.value);
  };

  // Update event results length when the athletes array changes
  useEffect(() => {
    if (prevAthleteCount && prevAthleteCount.length !== athletes.length){
      console.log("Athlete list change detected: " + athletes.length + " Last added: " + athletes[athletes.length - 1].athleteName );
      const newEventResults = [...event.results]; 
      newEventResults.push({
        athleteName: athletes[athletes.length-1].athleteName,
        result: '',
        place: athletes.length,
        points: 0
      });
      console.log ("Event Index: " + eventIndex);
      newEventResults.forEach((result, index) => {
        //console.log("1- result assignment: " + result.athleteName + " result: " + result.result + " points: " + result.points);
      });
      onModifyEvent(eventIndex, {eventName:event.eventName, eventType:event.eventType, results:[...newEventResults]});
    }
  }, [athletes]);

  const prevEventResults = usePrevious(event.results);
  const prevAthleteCount = usePrevious(athletes);

  useEffect(() => {
    let hasChanged = false;
    if (prevEventResults && prevEventResults.length === event.results.length) {
      for (let index = 0; index < event.results.length; index++) {
        const current = event.results[index];
        const prev = prevEventResults[index];
            
        // Check for meaningful changes
        if (!prev || current.athleteName !== prev.athleteName || current.result !== prev.result) {
          hasChanged = true;
          break; // Exit early on first change
        }
      }
    } else {
      // Length change is considered a meaningful change
      hasChanged = true;
    }
    
    if (hasChanged) {
      calculateResults(); // Ensure this function only updates state if there's an actual change
    }
  }, [event.results]); // Depend on prevEventResults via custom hook

  // this is where we handle different event types
  const sortPositiveResults = (athletes) => {
    // Handle max distance, weight, or reps by simply sorting by the numeric value of results
    switch (event.eventType)
    {
      case 'MDist':
      case 'MWeight':
      case 'MTime':
      case 'MReps':
        return athletes.sort((a, b) => parseFloat(b.result) - parseFloat(a.result));
      case 'DistToTime':
        return sortDistToTime(athletes);
      case 'RepsInTime':
        return sortRepsInTime(athletes);
      case 'RepsToDistTime':
        return sortRepsToDistTime(athletes);
    }
  
    // Return the original array if none of the conditions match
    return athletes;
  };

  const sortRepsToDistTime = (athletes) => {
    return athletes.sort((a, b) => {
      // Determine the type and value of each athlete's result
      const getTypeAndValue = (result) => {
        let type, value;
        if (result.endsWith('rep') || result.endsWith('reps')) {
          type = 'rep';
          value = parseInt(result, 10);
        } else if (result.endsWith('s')) {
          type = 'time';
          value = parseFloat(result);
        } else { // Assuming the result ends with 'f', 'ft', or 'm'
          type = 'distance';
          value = parseFloat(result);
        }
        return { type, value };
      };
  
      const aResult = getTypeAndValue(a.result);
      const bResult = getTypeAndValue(b.result);
  
      // Prioritize by result type
      const typeOrder = { 'time': 3, 'distance': 2, 'rep': 1 };
      if (typeOrder[aResult.type] !== typeOrder[bResult.type]) {
        return typeOrder[bResult.type] - typeOrder[aResult.type];
      }
  
      // If the type is the same, sort by value (note the special handling for time vs. others)
      if (aResult.type === 'time') {
        // For times, lower is better
        return aResult.value - bResult.value;
      } else {
        // For reps and distance, higher is better
        return bResult.value - aResult.value;
      }
    });
  };

  const sortRepsInTime = (athletes) => {
    console.log("number of Reps In Time: " + athletes.length);
    athletes.forEach((athlete) => {
      console.log("Reps In Time Result: " + athlete.result);
    });
    return athletes.sort((a, b) => {
      const [repsA, timeA] = a.result.match(/(\d{1,2}) in (\d{0,3}(\.\d{1,2})?)s/).slice(1, 3).map(Number);
      const [repsB, timeB] = b.result.match(/(\d{1,2}) in (\d{0,3}(\.\d{1,2})?)s/).slice(1, 3).map(Number);
  
      // First, sort by reps (higher is better)
      if (repsA !== repsB) return repsB - repsA;
  
      // If reps are equal, sort by time (lower is better)
      return timeA - timeB;
    });
  };

  const sortDistToTime = (athletes) => {
    // Sort such that all times (ending in 's') are above all distances (ending in 'd'),
    // and within each group, sort by the numeric value (lower times are better, shorter distances for those who didn't finish)
    return athletes.sort((a, b) => {
      const isATime = a.result.endsWith('s');
      const isBTime = b.result.endsWith('s');
      const numA = parseFloat(a.result);
      const numB = parseFloat(b.result);

      if (isATime && !isBTime) return -1; // A is time, B is distance, A goes first
      if (!isATime && isBTime) return 1;  // A is distance, B is time, B goes first

      // If both are times or both are distances, sort by numeric value
      // For times, lower is better. For distances (not finish), higher is better.
      return isATime ? numA - numB : numB - numA;
    });
  };

  const calculateResults = () => {
    // Step 1: Sort the results based on the 'result' property
    const athletesWithResult = sortPositiveResults(event.results.filter(a => parseFloat(a.result) > 0));
    const athletesWithZero = event.results.filter(a => parseFloat(a.result) === 0 || a.result === '');

    let currentPlace = 1;
    let tiesBuffer = [];
    const scoredResults = [];
  
    athletesWithResult.forEach((athlete, index) => {
      // Step 2: Check for tie with next
      if (athletesWithResult.length > index+1 
            && athlete.result === athletesWithResult[index+1].result ){ // check tie with next athlete
        tiesBuffer.push(athlete);
        if((athletesWithResult.length == index+2 // to handle if the next is the last positive result
          || athlete.result !== athletesWithResult[index+2].result) // Is this the last tie pair in the group?
        ){
          // If it is the last tie pair in the group, add the next one since it won't tie with ITS next
          tiesBuffer.push(athletesWithResult[index+1]);
          // since last pair it's complete; calculate place and points for them. 
          tiesBuffer.forEach((tiedAthlete) => {
            tiedAthlete.place = currentPlace;
            let tiedScore = event.results.length+1 - currentPlace - (0.5*(tiesBuffer.length - 1)); // calculate tied score
            tiedAthlete.points = tiedScore;
            scoredResults.push(tiedAthlete); 
          });
        }
      }
      // Step 3: check if last in tie group
      else if (tiesBuffer.indexOf(athlete) !== -1){ // if the athlete exists in the tie buffer but is not tied with its next, it's the last of a tie group
        currentPlace = currentPlace + tiesBuffer.length; 
        tiesBuffer = []; // clear out the buffer since this tie grtoup is completed
        return;
      }
      else { // if we got here, it means there's no tie and no tie group to worry about
        console.log("Pushing non-tie?")
        scoredResults.push({
          athleteName: athlete.athleteName,
          result: athlete.result,
          place: currentPlace,
          points: event.results.length+1 - currentPlace
        });
        currentPlace++;
      }
    });
    // Handle athletes with 0 result
    athletesWithZero.forEach(athlete => {
      athlete.place = event.results.length;
      athlete.points = 0;
    });

    // Combine and restore the original order
    const finalResults = [...scoredResults, ...athletesWithZero]
      .sort((a, b) => athletes.findIndex(athlete => athlete.athleteName === a.athleteName) - athletes.findIndex(athlete => athlete.athleteName === b.athleteName));
    finalResults.forEach((athlete) => {
      console.log(athlete.athleteName + " result: " + athlete.result + " place: " + athlete.place + " score: " + athlete.points);
    })
    // Update event results state with the new places and points
    finalResults.forEach((result, index) => {
      //console.log("3- result assignment: " + result.athleteName + " result: " + result.result + " points: " + result.points);
    });
    onModifyEvent(eventIndex, {eventName:event.eventName, eventType:event.eventType, results:[...finalResults]});
  };

  const handleScoreInput = (newResult, index) => {
    // Update the event.result array with the new value at the specified index
    const updatedResults = event.results.map((result, idx) => {
      if (idx === index) {
        return {...result, result: newResult};
      }
      return result;
    });
    onModifyEvent(eventIndex, {eventName:event.eventName, eventType:event.eventType, results:[...updatedResults]});
  };

  const handleTextLimit = (type) => {
    if (type === 'MReps')
    {
      return 'integer'
    }
    if (type === 'MWeight'
    || type === 'MTime'
    || type === 'MDist')
    {
      return 'number'
    }
    if (type === 'DistToTime')
    {
      return 'dist-time'
    }
    if (type === 'RepsInTime')
    {
      return 'reps-time'
    }
    if (type === 'RepsToDistTime')
    {
      return 'reps-disttime'
    }
    return 'text';
  }

  const handleEventNameChange = (value) => {
    const updatedEvent = {...event, eventName: value};
    onModifyEvent(eventIndex, {...updatedEvent});
  }
  const setNewEventType = (value) => {
    if(value !== ""){
      const results = [...event.results];
      results.forEach(result => {
        result.result = 0;
        result.place = 0;
        result.points = 0;
      });
      const updatedEvent = {...event, eventType: value, results: results };
      onModifyEvent(eventIndex, {...updatedEvent});
    }
  };

  // check to see if there exists a result to populate the input field with on creation
  const checkIfResult = (index) => {
    if(event.results[index])
      return event.results[index].result;
    return "";
  }

  const renderTips = () => {
    if(!isEditable){
      return;
    };
    let tipText = "";
    let tipText2 = "";
    let tipText3 = "";
    switch (event.eventType){
      case "MWeight":
        tipText = "Weight in any units";
        break;
      case "MTime":
        tipText = "Time in seconds";
        break;
      case "MReps":
        tipText = "Number of reps achieved";
        break;
      case "MDist":
        tipText = "Distance in any units";
        break;
      case "DistToTime":
        tipText = "Best Time - time in s";
        tipText2 = "or distance in m or ft";
        tipText3 = "eg: '42.3s' or '12.73m'";
        break;
      case "RepsInTime":
        tipText = "Reps in Time";
        tipText2 = "X in YY.YYs";
        tipText3 = "eg: '3 in 12.72s'";
        break;
      case "RepsToDistTime":
        tipText = "Reps to Dist/Time";
        tipText2 = "Time > Distance > Reps";
        tipText3 = "units: rep, m, f, ft, s";
        break;
    }

    const div = 
      <div>
        <div className='horizontal-line'></div>
        <MyLabel 
          text={tipText}
          fontSize="12px"
          labelType="text-label"
        />
        <MyLabel 
          text={tipText2}
          fontSize="12px"
          labelType="text-label"
        />
        <MyLabel 
          text={tipText3}
          fontSize="12px"
          labelType="text-label"
        />
      </div>
    return div;
  };

  const renderResults = () => {
    const resultDivs = [];
    //const placingDivs = [];
    const pointsDivs = [];

    if(isEditAthEvents)
    {
      resultDivs.push(
        <div className='header-label'>
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
        </div>
        
      );
    }
    else
    {
      if(event.eventType === "MWeight")
        resultDivs.push(<MyLabel text = "Weight" labelType="header-label"/>);
      else if(event.eventType === "MTime")
        resultDivs.push(<MyLabel text = "Time" labelType="header-label"/>);
      else if(event.eventType === "MReps")
        resultDivs.push(<MyLabel text = "Reps" labelType="header-label"/>);
      else if(event.eventType === "MDist")
        resultDivs.push(<MyLabel text = "Dist" labelType="header-label"/>);
      else
        resultDivs.push(<MyLabel text = "Result" labelType="header-label"/>);
    }
    resultDivs.push(<div className='horizontal-line'/>);

    //placingDivs.push(<MyLabel text = "Place"/>);
    //placingDivs.push(<div className='horizontal-line'/>);

    pointsDivs.push(<MyLabel text = "Pts" labelType="header-label"/>);
    pointsDivs.push(<div className='horizontal-line'/>);
    let width = "80px";
    if(event.eventType === "RepsInTime") width = "80px";
    athletes.forEach((athlete, index) => {
      let background = "list-label-2";
      if(index % 2) {
        background = "list-label-1";
      }
      if (isEditable) {
        resultDivs.push(
          <MyTextField 
            background={background}
            inputType={handleTextLimit(event.eventType)}
            onInputChange={(value) => handleScoreInput(value, index)} 
            width={width}
            initialValue={checkIfResult(index)}
          />
        );
      } else {
        // Show the result even when not editable
        resultDivs.push(<MyLabel text={event.results[index].result} labelType={background} />);
      }
      if(event.results.length === athletes.length)
      {
        //placingDivs.push(<MyLabel text={event.results[index].place}/>);
        pointsDivs.push(<MyLabel text={event.results[index].points} labelType={background} />);
      }
    });

    const div = 
      <div className='horizontal-list'>
        <div className='vertical-list'>{resultDivs}</div>
        <div className='soft-vertical-line'></div>
        {/* <div className='vertical-list'>{placingDivs}</div>
        <div className='soft-vertical-line'></div> */}
        <div className='vertical-list'>{pointsDivs}</div>
      </div>
    ;
    return div;
  }

  return (
        <div className='filler-foreground'>
          <div className='horizontal-list-clickable' onClick={() => sortAthletesByEvent(eventIndex)}>
            {isEditAthEvents ?
              <MyTextField 
                background="text-label"
                onInputChange={(value) => handleEventNameChange(value)}
                placeholder="Event Name"
                initialValue={event.eventName}
              />
              : <MyLabel text={event.eventName} labelType="text-label"/>
            }
            {isSortedBy ? <SlArrowDown className='filler-foreground'/> : null}
          </div>
          {renderResults()}
          {renderTips()}
        </div>
  )
}

export default ScoresheetEvents