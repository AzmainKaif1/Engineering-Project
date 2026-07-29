// ============================================================
// MAQUEEN AUTO-START BLACK-LINE FOLLOWER + RADIO CONTROLLER
//
// The robot begins moving immediately when powered on.
//
// CONTROLLER:
// A button     sends "LEFT"
// B button     sends "RIGHT"
// A+B buttons  sends "TOGGLE"
//
// ROBOT BUTTONS:
// A = start/resume
// B = stop
//
// Both micro:bits must use radio group 17.
//
// Line sensor values:
// 0 = black
// 1 = white
// ============================================================


// -------------------- SPEED SETTINGS --------------------

let FORWARD_SPEED = 30
let CORRECTION_SPEED = 36
let SEARCH_SPEED = 23

let LEFT_TURN_SPEED = 55
let RIGHT_TURN_SPEED = 55


// -------------------- TURN SETTINGS --------------------

// Increase if the robot does not turn enough.
// Decrease if it turns too far.
let LEFT_TURN_MS = 390
let RIGHT_TURN_MS = 390

// Move forward after a controller turn so the sensors
// reconnect with the black tape.
let REJOIN_LINE_MS = 220

// How long to continue forward when both sensors briefly see white.
let WHITE_GRACE_MS = 70


// -------------------- VARIABLES --------------------

// Starts true, so the robot moves immediately after power-on.
let robotRunning = true

let manualTurnActive = false

// -1 = black line was last toward the left.
// 1 = black line was last toward the right.
let lastDirection = 1

let whiteStartedAt = -1


// ============================================================
// MOTOR FUNCTIONS
// ============================================================

function stopRobot() {
    maqueen.motorStop(maqueen.Motors.M1)
    maqueen.motorStop(maqueen.Motors.M2)
}


function moveForward() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        FORWARD_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        FORWARD_SPEED
    )
}


function correctLeft() {
    // Slow/stop the left wheel and run the right wheel.
    maqueen.motorStop(maqueen.Motors.M1)

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )
}


function correctRight() {
    // Run the left wheel and slow/stop the right wheel.
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )

    maqueen.motorStop(maqueen.Motors.M2)
}


function spinLeft() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CCW,
        LEFT_TURN_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        LEFT_TURN_SPEED
    )
}


function spinRight() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        RIGHT_TURN_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CCW,
        RIGHT_TURN_SPEED
    )
}


function searchLeft() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CCW,
        SEARCH_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        SEARCH_SPEED
    )
}


function searchRight() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        SEARCH_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CCW,
        SEARCH_SPEED
    )
}


// ============================================================
// MANUAL CONTROLLER TURNS
// ============================================================

function controllerTurnLeft() {
    if (!robotRunning || manualTurnActive) {
        return
    }

    manualTurnActive = true

    stopRobot()
    basic.pause(50)

    spinLeft()
    basic.pause(LEFT_TURN_MS)

    stopRobot()
    basic.pause(70)

    // Push onto the selected black line.
    moveForward()
    basic.pause(REJOIN_LINE_MS)

    whiteStartedAt = -1
    lastDirection = -1

    manualTurnActive = false
}


function controllerTurnRight() {
    if (!robotRunning || manualTurnActive) {
        return
    }

    manualTurnActive = true

    stopRobot()
    basic.pause(50)

    spinRight()
    basic.pause(RIGHT_TURN_MS)

    stopRobot()
    basic.pause(70)

    // Push onto the selected black line.
    moveForward()
    basic.pause(REJOIN_LINE_MS)

    whiteStartedAt = -1
    lastDirection = 1

    manualTurnActive = false
}


// ============================================================
// BLACK-LINE FOLLOWING
// ============================================================

function followBlackLine() {
    let leftSensor = maqueen.readPatrol(
        maqueen.Patrol.PatrolLeft
    )

    let rightSensor = maqueen.readPatrol(
        maqueen.Patrol.PatrolRight
    )


    // Both sensors detect black.
    if (
        leftSensor == 0 &&
        rightSensor == 0
    ) {
        whiteStartedAt = -1
        moveForward()
    }


    // Left sensor detects black.
    else if (
        leftSensor == 0 &&
        rightSensor == 1
    ) {
        whiteStartedAt = -1
        lastDirection = -1
        correctLeft()
    }


    // Right sensor detects black.
    else if (
        leftSensor == 1 &&
        rightSensor == 0
    ) {
        whiteStartedAt = -1
        lastDirection = 1
        correctRight()
    }


    // Both sensors detect white.
    else {
        if (whiteStartedAt == -1) {
            whiteStartedAt = input.runningTime()
        }

        let whiteDuration =
            input.runningTime() - whiteStartedAt

        // Continue briefly instead of immediately stopping.
        if (whiteDuration < WHITE_GRACE_MS) {
            moveForward()
        } else {
            // Search in the direction where black was last detected.
            if (lastDirection == -1) {
                searchLeft()
            } else {
                searchRight()
            }
        }
    }
}


// ============================================================
// RADIO CONTROLLER
// ============================================================

radio.onReceivedString(function (command) {

    // Supports the normal controller commands.
    if (command == "LEFT" || command == "A") {
        controllerTurnLeft()
    }

    else if (command == "RIGHT" || command == "B") {
        controllerTurnRight()
    }

    else if (command == "TOGGLE") {
        robotRunning = !robotRunning

        if (robotRunning) {
            whiteStartedAt = -1
            basic.showIcon(IconNames.Yes)
        } else {
            stopRobot()
            basic.showIcon(IconNames.No)
        }
    }

    else if (command == "START") {
        robotRunning = true
        whiteStartedAt = -1
        basic.showIcon(IconNames.Yes)
    }

    else if (command == "STOP") {
        robotRunning = false
        stopRobot()
        basic.showIcon(IconNames.No)
    }
})


// ============================================================
// ROBOT BUTTONS
// ============================================================

// Robot button A starts/resumes.
input.onButtonPressed(Button.A, function () {
    robotRunning = true
    whiteStartedAt = -1

    basic.showIcon(IconNames.Yes)
})


// Robot button B stops.
input.onButtonPressed(Button.B, function () {
    robotRunning = false
    stopRobot()

    basic.showIcon(IconNames.No)
})


// Robot A+B also toggles start/stop.
input.onButtonPressed(Button.AB, function () {
    robotRunning = !robotRunning

    if (robotRunning) {
        whiteStartedAt = -1
        basic.showIcon(IconNames.Yes)
    } else {
        stopRobot()
        basic.showIcon(IconNames.No)
    }
})


// ============================================================
// RADIO AND INITIAL STARTUP
// ============================================================

radio.setGroup(17)
radio.setTransmitPower(7)

// It begins running immediately.
robotRunning = true
whiteStartedAt = -1

basic.showIcon(IconNames.Yes)

moveForward()


// ============================================================
// MAIN LOOP
// ============================================================

basic.forever(function () {
    if (robotRunning && !manualTurnActive) {
        followBlackLine()
    } else if (!robotRunning) {
        stopRobot()
    }

    basic.pause(10)
})
