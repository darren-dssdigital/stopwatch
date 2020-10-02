// tidied up imports
import React, { Component } from "react";
import ReactDOM from "react-dom";

const formattedSeconds = (sec: number) => Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);

interface StopwatchProps {
    initialSeconds: number;
}

interface StopwatchState {
    secondsElapsed: number;
    lapStartTime: number;
    laps: { id: number; time: number }[];
    nextLapID: number;
    isCounting: boolean;
}

// changed any to StopwatchState for state typechecking
class Stopwatch extends Component<StopwatchProps, StopwatchState> {
    // Added correct type to incrementer
    incrementer!: number;

    constructor(props: StopwatchProps) {
        super(props);
        this.state = {
            secondsElapsed: props.initialSeconds,
            // added lapStartTime so we can track when the new lap starts. A lap should be a lap and not record the total time elapsed
            lapStartTime: 0,
            // removed lastClearedIncrementer, we are not using this to conditionally render the buttons anymore, we are now using isCounting (UX Decision detailed in render method)
            laps: [],
            // changing laps to be an array of objects, adding nextLapID as a way to target a lap object specifically
            nextLapID: 0,
            isCounting: false,
        };
        // Moved Laps into State
    }

    // changed to arrow function to avoid using bind to access "this"
    handleStartClick = () => {
        // using window.setInterval, we aren't using SSR. Fixes trying to cast a number as a Timer
        this.incrementer = window.setInterval(
            () =>
                this.setState({
                    secondsElapsed: this.state.secondsElapsed + 1,
                }),
            1000
        );
        this.setState({
            isCounting: true,
        });
    };

    // changed to arrow function to avoid using bind to access "this"
    handleStopClick = () => {
        clearInterval(this.incrementer);
        this.setState({
            isCounting: false,
        });
    };

    // changed to arrow function to avoid using bind to access "this"
    handleResetClick = () => {
        clearInterval(this.incrementer);
        // incorrect use of brackets.
        // laps moved into setState function
        this.setState({
            secondsElapsed: 0,
            lapStartTime: 0,
            laps: [],
            nextLapID: 0,
        });
    };

    // changed to arrow function to avoid using bind to access "this"
    // typo in function name handleLabClick -> handleLapClick
    handleLapClick = () => {
        // refactor due to laps being moved into state & new data structure for laps.
        const newLap = {
            id: this.state.nextLapID,
            time: this.state.secondsElapsed - this.state.lapStartTime,
        };
        this.setState((prevState: StopwatchState) => ({
            laps: [...prevState.laps, newLap],
            nextLapID: this.state.nextLapID + 1,
            lapStartTime: this.state.secondsElapsed,
        }));
        // we are using state to manage our laps, no need to force a render as the state change does this for us. (this.forceUpdate() Deleted)
    };

    // changed to arrow function to avoid using bind to access "this"
    // changed index to id to target correct lap
    handleDeleteClick = (id: number) => {
        // refactor due to laps being moved into State.
        // using filter insead of splice - splice returns removed elements.
        const newLaps = this.state.laps.filter((lap: { id: number }) => lap.id !== id);
        this.setState({
            laps: newLaps,
        });
    };

    // you should stop the counter when the stopwatch is removed from the DOM
    componentWillUnmount = () => {
        clearInterval(this.incrementer);
    };

    render() {
        // added laps to the state destructuring
        const { secondsElapsed, laps, isCounting } = this.state;

        return (
            <div className="stopwatch">
                <h1 className="stopwatch-timer">{formattedSeconds(secondsElapsed)}</h1>
                {/* UX Decision, It didn't feel right that the buttons changed on the next second tick. I added isCounting as a way to tell if the Stopwatch is counting and conditionally render the buttons based on that */}
                {isCounting ? (
                    <>
                        <button type="button" className="stop-btn" onClick={this.handleStopClick}>
                            stop
                        </button>
                        <button type="button" onClick={this.handleLapClick}>
                            lap
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" className="start-btn" onClick={this.handleStartClick}>
                            start
                        </button>
                        {/* Hide reset button if secondsElapsed is 0 */}
                        {secondsElapsed !== 0 && (
                            <button type="button" onClick={this.handleResetClick}>
                                reset
                            </button>
                        )}
                    </>
                )}

                <div className="stopwatch-laps">
                    {laps &&
                        laps.map((lap: { id: number; time: number }) => (
                            <Lap
                                key={lap.id}
                                // added lap number prop
                                number={lap.id + 1}
                                // updated variable to time so its less ambiguous
                                time={lap.time}
                                // added function to prop, handleDeleteClick() was being called when the component rendered
                                onDelete={() => this.handleDeleteClick(lap.id)}
                            />
                        ))}
                </div>
            </div>
        );
    }
}

// corrected onDelete type
const Lap = (props: { number: number; time: number; onDelete: () => void }) => (
    // removed key and added it to the map call
    <div className="stopwatch-lap">
        {/* updated to use number prop so we can display the accurate lap instead of showing the index which changes with deletions */}
        <strong>{`Lap: ${props.number}`}</strong> - {formattedSeconds(props.time)}{" "}
        <button onClick={props.onDelete}> X </button>
    </div>
);

// React Renders into root div by default
ReactDOM.render(<Stopwatch initialSeconds={0} />, document.getElementById("root"));
