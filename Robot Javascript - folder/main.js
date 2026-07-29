// ============================================================
// SIMPLE MAQUEEN ROUTE
//
// 1. Start on the middle vertical black line.
// 2. Press Button A.
// 3. Robot drives straight to the intersection.
// 4. Robot turns left.
// 5. Robot follows the black tape forever.
//
// Button A = start
// Button B = stop
//
// Maqueen sensor values:
// 0 = black
// 1 = white
// ============================================================


// ---------------- SPEED SETTINGS ----------------

let FORWARD_SPEED = 30
let CORRECTION_SPEED = 35
let SEARCH_SPEED = 22
let TURN_SPEED = 30


// ---------------- TIMING SETTINGS ----------------

// Change this until the robot reaches the middle intersection.
let STRAIGHT_TIME_MS = 1600

// Change this until the robot makes a proper 90-degree left turn.
let LEFT_TURN_TIME_MS = 430

// Move slightly forward after turning left.
let AFTER_TURN_TIME_MS = 250


// ---------------- VARIABLES ----------------

let started = false
let stopped = false

// -1 means the line was last seen on the left.
// 1 means the line was last seen on the right.
let lastDirection = 1


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
    maqueen.motorStop(maqueen.Motors.M1)

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )
}


function correctRight() {
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
        TURN_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        TURN_SPEED
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
// INITIAL MOVEMENT
// ============================================================

function goStraightThenTurnLeft() {
    // Drive straight from the starting point.
    moveForward()
    basic.pause(STRAIGHT_TIME_MS)

    stopRobot()
    basic.pause(150)

    // Turn left at the middle intersection.
    spinLeft()
    basic.pause(LEFT_TURN_TIME_MS)

    stopRobot()
    basic.pause(150)

    // Move onto the horizontal black line.
    moveForward()
    basic.pause(AFTER_TURN_TIME_MS)

    stopRobot()
    basic.pause(100)
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
        moveForward()
    }


    // Black tape is under the left sensor.
    else if (
        leftSensor == 0 &&
        rightSensor == 1
    ) {
        lastDirection = -1
        correctLeft()
    }


    // Black tape is under the right sensor.
    else if (
        leftSensor == 1 &&
        rightSensor == 0
    ) {
        lastDirection = 1
        correctRight()
    }


    // Both sensors detect white.
    // Search for the black line instead of stopping.
    else {
        if (lastDirection == -1) {
            searchLeft()
        } else {
            searchRight()
        }
    }
}


// ============================================================
// BUTTONS
// ============================================================

// Press A to begin.
input.onButtonPressed(Button.A, function () {
    if (!started) {
        started = true
        stopped = false

        basic.showArrow(ArrowNames.North)

        goStraightThenTurnLeft()

        basic.showArrow(ArrowNames.West)
    }
})


// Press B to stop.
input.onButtonPressed(Button.B, function () {
    stopped = true
    stopRobot()

    basic.showIcon(IconNames.No)
})


// ============================================================
// SETUP
// ============================================================

stopRobot()
basic.showIcon(IconNames.Happy)


// ============================================================
// FOREVER LOOP
// ============================================================

basic.forever(function () {
    if (started && !stopped) {
        followBlackLine()
    } else {
        stopRobot()
    }

    basic.pause(10)
})
