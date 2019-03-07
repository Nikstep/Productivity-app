/* eslint-disable no-lonely-if */ // Because of bug
// General
let countDown; // Preset variable for countdown interval
let breakDown; // Preset variable for break countdown interval
let hook = 0; // Hook for pause - after resume its used to count interval thats left to countdown by subtracting hook from initial interval
const display = document.querySelector("#timer"); // Big clock
const header = document.querySelector("title"); // Browser tab header
let status; // Preset variable that is updated with every countdown start (Work/Break) and displayed in browser header
// Input of seconds transformed into minutes:seconds format and inserted into main counter and header.
function timeLeft(interval) {
  const minutes = Math.floor(interval / 60);
  const seconds = interval % 60;
  const combiner = `${minutes < 10 ? "0" : ""}${Math.floor(minutes)}:${
    seconds < 10 ? "0" : ""
  }${Math.floor(seconds)}`;

  display.textContent = combiner; // Inserts result into main clock
  header.textContent = combiner + status; // Inserts result into browser tab header and ads status
}
// Activities
const overlaySingle = document.querySelector(".overlay2"); // Pop up window of single activity
const overlayWhole = document.querySelector(".overlay"); // Pop up overlay with 100% viewport cover. With 12 different activities
const overlayGrid = document.getElementsByClassName("grid"); // Grid of activities on overlay - group selector of all activities
const overlayArray = Array.from(overlayGrid); // Conversion to array
// Classic
let pomoCount = 0; // Counter of work intervals completed
const pomoCounter = "Pomodoro counter:";
// Audio tones
const audioBreak = new Audio("sounds/jobs_done.mp3");
const audioWork = new Audio("sounds/doIt.mp3");
// Countdown - Work function. It takes work interval and break duration.
function time(interval, breakDuration) {
  status = " Work!"; // Change tab header to time + "Work!"
  breakIn.textContent = "Break in:"; // Displays h4 above counter
  breakIn.style.visibility = "visible";
  start.textContent = "Pause"; // Start button becomes pause
  startBtn.style.visibility = "visible"; // This button is hidden while break countdown is on.
  clearInterval(countDown); // Resets countdown from previous instance
  const then = Date.now() + interval * 1000; // Current time when function was called + input of interval. Working with real-time could solve issue when window or tab is not focused and also be more precise
  timeLeft(interval); // Displaying function
  overlaySingle.style.visibility = "hidden"; // If its second interaction of timer, it will automatically hide pop up window

  countDown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    hook++;

    // When countdown reaches 0 = stops countdown, plays sound and launches break countdown
    if (secondsLeft <= 0) {
      clearInterval(countDown);
      audioBreak.play();
      breakTime(breakDuration, interval);
      pomoCount++;
      document.querySelector(".heading h1").textContent =
        pomoCounter + pomoCount;
      const activity = Math.floor(Math.random() * 12) + 1; // Random selection of one out of all activities
      const overlayMulti = document.querySelector(
        `.grid:nth-of-type(${activity})`
      );
      overlaySingle.insertAdjacentHTML("afterbegin", overlayMulti.innerHTML);
    }
    timeLeft(secondsLeft);
  }, 1000);
}

// Countdown - Break function. It takes pause interval and work duration.
function breakTime(pauseTime, workTime) {
  status = " Break!"; // Change tab header to time + "Break"
  startBtn.style.visibility = "hidden"; // Start or pause button invisible during break time
  breakIn.style.visibility = "hidden";
  clearInterval(breakDown); // Clears any unfinished break intervals
  const then2 = Date.now() + pauseTime * 1000;
  overlaySingle.style.visibility = "visible"; // Shows pop up with activity

  breakDown = setInterval(() => {
    const breakLeft = Math.round((then2 - Date.now()) / 1000);

    // When countdown reaches 0 = stops countdown, plays sound and launches work countdown
    if (breakLeft <= 0) {
      // In case, that selection screen is active when break time reaches 0, close it.
      if (overlayWhole.style.visibility === "visible") {
        clearInterval(breakDown);
        audioWork.play();
        hook = 0; // Resets hook, as it would still continue growing in second work countdown and would disrupt pause/continue process
        time(workTime, pauseTime);
        overlayWhole.style.visibility = "hidden";
      } else {
        clearInterval(breakDown);
        audioWork.play();
        hook = 0; // Resets hook, as it would still continue growing in second work countdown and would disrupt pause/continue process
        time(workTime, pauseTime);
        overlaySingle.removeChild(overlaySingle.children[3]);
        overlaySingle.removeChild(overlaySingle.children[2]);
        overlaySingle.removeChild(overlaySingle.children[1]);
        overlaySingle.removeChild(overlaySingle.children[0]);
      }
    }
    timeLeft(breakLeft);
  }, 1000);
}

const workInput = document.querySelector(".work");
const breakInput = document.querySelector(".break");
let work;
let hold;
// Variation of input value between classic pomodoro counter (fixed 25 min work time and 5 min break) and custom one, which is taking entered inputs.
if (document.body.classList.contains("custom")) {
  // Custom timer

  work = workInput.valueAsNumber * 60;
  hold = breakInput.valueAsNumber * 60;

  workInput.addEventListener("input", () => {
    if (
      Number.isNaN(workInput.value) ||
      workInput.value === "" ||
      workInput.value < 1
    ) {
      work = 0; // If entered value is invalid, changes counter input to 0.
    } else {
      work = workInput.valueAsNumber * 60;
    }

    timeLeft(work);
  });

  breakInput.addEventListener("input", () => {
    if (
      Number.isNaN(workInput.value) ||
      breakInput.value === "" ||
      breakInput.value < 1
    ) {
      hold = 0;
    } else {
      hold = breakInput.valueAsNumber * 60;
    }
  });
} else {
  // Classic timer

  work = 1500;
  hold = 300;
}

const startBtn = document.querySelector(".start");
const start = document.getElementById("start");
const breakIn = document.getElementById("info");
let startClicks = 0;

let minutes = Math.floor(work / 60); // For display purposes this breaks interval into minutes
const seconds = work % 60;
let combiner = `${minutes < 10 ? "0" : ""}${Math.floor(minutes)}:${
  seconds < 10 ? "0" : ""
}${Math.floor(seconds)}`;
display.textContent = combiner;

// Function fired after click on start button
start.addEventListener("click", e => {
  e.preventDefault();
  // Check if Custom timer has correct inputs
  if (document.body.classList.contains("custom")) {
    if (work === 0) {
      alert(
        "Thats not what we call work enthusiasm. \n\nWork input has invalid value"
      );
    } else if (hold === 0) {
      alert(
        "You are not a robot, you need to rest... \n\nBreak input has invalid value"
      );
    } else {
      startClicks++; // Click counter - ads 1 per every click

      if (start.textContent === "Lets get things done!") {
        time(work, hold);
        start.textContent = "Pause";
      } else {
        // Every second click stops countdown and change button text to "Continue"
        if (startClicks % 2 === 0) {
          start.textContent = "Continue";
          header.textContent = "Paused";
          clearInterval(countDown);
        }
        // First click starts function with preset interval and changes button text to "Pause"
        else if (startClicks === 1) {
          time(work, hold);
          start.textContent = "Pause";
        }

        // Any other(every odd except first) click will restart countdown with updated interval
        else {
          time(work - hook, hold);
          start.textContent = "Pause";
        }
      }
    }
  } else {
    startClicks++; // Click counter - ads 1 per every click

    if (start.textContent === "Lets get things done!") {
      time(work, hold);
      start.textContent = "Pause";
    } else {
      // Every second click stops countdown and change button text to "Continue"
      if (startClicks % 2 === 0) {
        start.textContent = "Continue";
        header.textContent = "Paused";
        clearInterval(countDown);
      }

      // First click starts function with preset interval and changes button text to "Pause"
      else if (startClicks === 1) {
        time(work, hold);
        start.textContent = "Pause";
      }

      // Any other(every odd except first) click will restart countdown with updated interval
      else {
        time(work - hook, hold);
        start.textContent = "Pause";
      }
    }
  }
});

// Restart button
const restart = document.querySelector("#restart");
restart.addEventListener("click", e => {
  e.preventDefault();
  // if pressed on custom counter sets displayed number to be same as last input
  if (document.body.classList.contains("custom")) {
    minutes = work / 60;
    combiner = `${minutes < 10 ? "0" : ""}${Math.floor(minutes)}:${
      seconds < 10 ? "0" : ""
    }${Math.floor(seconds)}`;
  }
  breakIn.style.visibility = "hidden";
  start.textContent = "Lets get things done!";
  startBtn.style.visibility = "visible";
  clearInterval(countDown);
  clearInterval(breakDown);
  display.textContent = combiner;
  hook = 0;
});

// Pop up window button "Done" - if clicked close pop up
const done = document.getElementById("done");
done.addEventListener("click", () => {
  overlaySingle.style.visibility = "hidden";
  document.querySelector(".overlay2 p").style.visibility = "hidden";
});

// Pop up window button for another activity select. On press hides and clears initial pop up and brings overlay with activity selection
const change = document.getElementById("change");
change.addEventListener("click", () => {
  overlaySingle.style.visibility = "hidden";
  overlayWhole.style.visibility = "visible";
  overlaySingle.removeChild(overlaySingle.children[3]);
  overlaySingle.removeChild(overlaySingle.children[2]);
  overlaySingle.removeChild(overlaySingle.children[1]);
  overlaySingle.removeChild(overlaySingle.children[0]);
});

// For each activity in overlay attach click event listener, that will copy content of activity and inserts it into pop up window. Then hides overlay and shows pop up.
overlayArray.forEach(element => {
  element.addEventListener("click", e => {
    const clicking = e.target;
    const elder = clicking.parentElement;
    const activity = Math.floor(Math.random() * 12) + 1;
    let overlayMulti = document.querySelector(`.grid:nth-of-type(${activity})`);
    overlayWhole.style.visibility = "hidden";
    overlaySingle.style.visibility = "visible";
    overlayMulti = elder;
    overlaySingle.insertAdjacentHTML("afterbegin", overlayMulti.innerHTML); // Used insertAdjacentHTML as innerHTML cancels event listeners
  });
});
