import React from "react";
import './App.css'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { buffer, debounceTime, filter, map, Observable, Subject, takeUntil } from 'rxjs'


function App() {

  const [time, setTime] = useState(0);
  const [start, setStart] = useState('stop')
  const stop$ = useMemo(() => new Subject(), []);
  const click$ = useMemo(() => new Subject(), []);

  useEffect(()=> {
    const doubleClick$ = click$.pipe(
      buffer(click$.pipe(debounceTime(299))),
      map((list) => list.length),
      filter((value) => value >= 2),
    );
    const timer$ = new Observable(observer => {
      let intervalId = null
      let count = 0

      if (start === 'start') {
         intervalId = setInterval(() => {
          observer.next(count += 1);
        }, 1000);
      }
      else {
        clearInterval(intervalId)
      }

      return () => {
        clearInterval(intervalId);
      };
    });

    const subscribtion$ = timer$
      .pipe(takeUntil(doubleClick$))
      .pipe(takeUntil(stop$))
      .subscribe({
        next: () => {
            setTime((prevTime) => prevTime + 1);
            // console.log(time)
        },
      });

    return (() => {
      subscribtion$.unsubscribe();
    });
  }, [start, time]);

 
  const run = useCallback(() => {
    setStart('start');
  }, []);
 
  const stop = useCallback(() => {
    setStart('stop');
    setTime(0);
  }, []);
 
  const reset = useCallback(() => {
    setTime(0);
    setStart('start')
  }, []);
 
  const wait = useCallback(() => {
    click$.next()
    setStart('wait');
    click$.next()
  }, [click$]);


  const setTimeFormat = (totalSecs) => {
    const seconds = (totalSecs % 60);
    const minutes = Math.floor(totalSecs / 60);
    const hours = Math.floor(totalSecs / 3600);
    const hoursFormat = (hours < 1 || hours > 23)
      ? '00'
      : (hours >= 1 && hours <= 9) ? `0${hours}` : `${hours}`;
    const minutesFormat = (minutes < 10)
      ? ((minutes === 0) ? '00' : `0${minutes}`)
      : `${minutes}`;
    const secondsFormant = (seconds < 10) ? `0${seconds}` : `${seconds}`;
  
    return `${hoursFormat} : ${minutesFormat} : ${secondsFormant}`;
  };
 
  return (
    <div className="App">
      <h1> Timer </h1>
      <h1>
        <span>{setTimeFormat(time)}</span>  
      </h1>
      <div>
        <button onClick={run}> Start </button> 
        <button onClick={stop}> Stop </button> 
        <button onClick={wait}> Wait </button> 
        <button onClick={reset}> Reset </button> 
      </div>
    </div>
  );
}

export default App;
