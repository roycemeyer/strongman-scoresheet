import React, { useEffect, useRef } from 'react'
import MyLabel from '../MyLabel'
import MyTextField from '../MyTextField';

// this is used in the useEffect to get the previous value of event.result to see if a change was made
function usePrevious(value){
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function ScoresheetEvents({isEditable, event, onModifyEvent, eventIndex, key, athletes}) {

  // Update event results length when the athletes array changes
  useEffect(() => {
    if (prevAthleteCount && prevAthleteCount.length !== athletes.length){
      console.log("Athlete list change detected: " + athletes.length + " Last added: " + athletes[athletes.length - 1].athleteName );
      const newEventResults = [...event.results]; 
      newEventResults.push({
        athleteName: athletes[athletes.length-1].athleteName,
        result: 0,
        place: athletes.length,
        points: 0
      });
      console.log ("Event Index: " + eventIndex);
      newEventResults.forEach((result, index) => {
        console.log("1- result assignment: " + result.athleteName + " result: " + result.result + " points: " + result.points);
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

  const calculateResults = () => {
    // Step 1: Sort the results based on the 'result' property
    const athletesWithResult = event.results.filter(a => parseFloat(a.result) > 0)
    .sort((a, b) => parseFloat(b.result) - parseFloat(a.result));
    const athletesWithZero = event.results.filter(a => parseFloat(a.result) === 0);

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
      console.log("3- result assignment: " + result.athleteName + " result: " + result.result + " points: " + result.points);
    });
    onModifyEvent(eventIndex, {eventName:event.eventName, eventType:event.eventType, results:[...finalResults]});
  };

  const handleScoreInput = (newResult, index) => {
    if (newResult === "" || newResult < 0){
      return;
    }
    // Update the event.result array with the new value at the specified index
    const updatedResults = event.results.map((result, idx) => {
      //console.log("index: " + index + " idx: " + idx);
      if (idx === index) {
        return {...result, result: newResult};
      }
      return result;
    });
    updatedResults.forEach((result, index) => {
      console.log("4- result assignment: " + result.athleteName + " result: " + result.result + " points: " + result.points);
    });
    onModifyEvent(eventIndex, {eventName:event.eventName, eventType:event.eventType, results:[...updatedResults]});
  };

  const handleTextLimit = (type) => {
    if (type === 'MWeight'
      || type === 'MReps')
    {
      return 'integer'
    }
    if (type === 'MDist')
    {
      return 'number'
    }
    return 'text';
  }

  const checkIfResult = (index) => {
    if(event.results[index])
      return event.results[index].result;
    return "";
  }

  const renderTips = () => {
    let tipText = "";
    let tipText2 = "";
    if(event.eventType === "MWeight")
      tipText = "Weight in any units";
    else if(event.eventType === "MReps")
      tipText = "Number of reps achieved";
    else if(event.eventType === "MDist")
      tipText = "Distance in any units";
    else
      tipText = "";
    const div = 
      <div className='filler'>
        <div className='horizontal-line'></div>
        <MyLabel 
          text={tipText}
          fontSize="12px"
        ></MyLabel>
        <MyLabel 
          text={tipText2}
          fontSize="12px"
        ></MyLabel>
      </div>
    return div;
  };

  const renderResults = () => {
    const resultDivs = [];
    const placingDivs = [];
    const pointsDivs = [];

    if(event.eventType === "MWeight")
      resultDivs.push(<MyLabel text = "Wht"/>);
    else if(event.eventType === "MReps")
      resultDivs.push(<MyLabel text = "Reps"/>);
    else if(event.eventType === "MDist")
      resultDivs.push(<MyLabel text = "Dist"/>);
    else
      resultDivs.push(<MyLabel text = "Result"/>);

    resultDivs.push(<div className='horizontal-line'/>);

    placingDivs.push(<MyLabel text = "Place"/>);
    placingDivs.push(<div className='horizontal-line'/>);

    pointsDivs.push(<MyLabel text = "Pts"/>);
    pointsDivs.push(<div className='horizontal-line'/>);

    athletes.forEach((athlete, index) => {
      if (isEditable) {
        resultDivs.push(
          <MyTextField 
            inputType={handleTextLimit(event.eventType)}
            onInputChange={(value) => handleScoreInput(value, index)} 
            width="50px"
            initialValue={checkIfResult(index)}
          />
        );
      } else {
        // Assuming you want to show the result even when not editable
        resultDivs.push(<MyLabel text={event.results[index].result} />);
      }
      // For placingDivs and pointsDivs, if you plan to also make them dynamic, ensure correct access
      if(event.results.length === athletes.length)
      {
        placingDivs.push(<MyLabel text={event.results[index].place} />);
        pointsDivs.push(<MyLabel text={event.results[index].points} />);
      }
    });

    const div = 
      <div className='horizontal-list'>
        <div className='vertical-list'>{resultDivs}</div>
        <div className='soft-vertical-line'></div>
        <div className='vertical-list'>{placingDivs}</div>
        <div className='soft-vertical-line'></div>
        <div className='vertical-list'>{pointsDivs}</div>
      </div>
    ;
    return div;
  }


  return (
        <div className='filler'>
          <MyLabel text={event.eventName}/>
          {renderResults()}
          {renderTips()}
        </div>
  )
}

export default ScoresheetEvents