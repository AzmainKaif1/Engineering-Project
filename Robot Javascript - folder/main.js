// ============================================================
// MAQUEEN ULTRASONIC DELIVERY ROBOT (no radio, no tape markers)
//
//                  A
//                  |
//            D ----S---- B
//                  |
//                  C
//
// Robot begins at S, physically facing A.
// LOOP ORDER: A -> S -> B -> S -> D -> S -> C -> S -> (repeat forever)
//
// Arrival at a station = ultrasonic sensor detects the cardboard
// building close ahead. No radio, no tape gaps needed.
// ============================================================


// -------------------- ROBOT STATES --------------------

let WAITING = 0
let OUTBOUND = 1
let RETURNING = 2
let BUSY = 3

let robotState = WAITING


// -------------------- MOTOR SPEEDS --------------------

let FORWARD_SPEED = 42
let CORRECTION_SPEED = 46
let SEARCH_SPEED = 25
let SPIN_SPEED = 35


// -------------------- TURN SETTINGS (TUNE THESE) --------------------

let TURN_90_MS = 430
let TURN_180_MS = 860
let LEAVE_CENTER_MS = 250


// -------------------- ULTRASONIC SETTINGS (TUNE THESE) --------------------

// Distance in cm at which the robot counts the building as "reached".
let ARRIVAL_DISTANCE_CM = 8

// Ignore ultrasonic readings right after leaving spawn, so it doesn't
// falsely trigger on something behind it or on sensor noise.
let DEPARTURE_IGNORE_MS = 800

// How long to sit at the building before turning around (feels like a delivery).
let DELIVERY_PAUSE_MS = 800


// -------------------- RETURN-TO-SPAWN TIMING (TUNE THESE) --------------------

// Since there are no tape gaps at S anymore, we use a timed drive
// to guess when the robot is back at the center. Measure how long
// it takes your robot to drive from each station back to S and set these.
let RETURN_DRIVE_TIME_MS = 3000


// -------------------- ROUTE ORDER & TURNS AT SPAWN --------------------

// Fixed loop order, not user-selectable.
let destinations = ["A", "B", "D", "C"]
let destinationIndex = 0

// TURN PLAN — describes the turn made AT SPAWN after returning from
// destinations[i], before heading out to the next one in the list.
// direction: "left" or "right", turns: how many 90 degree turns.
//
// A -> B  : 1 left turn   (adjacent arm)
// B -> D  : 2 left turns  (opposite arm, 180 degrees)
// D -> C  : 1 right turn  (adjacent arm, other direction)
// C -> A  : 2 left turns  (opposite arm, 180 degrees, loops back)
//
// IMPORTANT: this is a best-guess based on the geometry of your +
// track. Left/right may come out backwards depending on which way
// your motors actually spin for turnLeft90Degrees(). Test it and
// swap "left"/"right" below if it turns the wrong way.
let turnPlan = [
    { direction: "left", turns: 1 },   // after A -> go to B
    { direction: "left", turns: 2 },   // after B -> go to D
    { direction: "right", turns: 1 },  // after D -> go to C
    { direction: "left", turns: 2 }    // after C -> go to A (loop)
]


// -------------------- LINE FOLLOWING STATE --------------------

let leftSensor = 0
let rightSensor = 0
let lastDirection = 1   // -1 = line last seen left, 1 = last seen right

let legStartedAt = 0


// ============================================================
// BASIC MOTOR FUNCTIONS
// ============================================================

function stopMotors() {
    maqueen.motorStop(maqueen.Motors.M1)
    maqueen.motorStop(maqueen.Motors.M2)
}

function forward() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, FORWARD_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, FORWARD_SPEED)
}

function reverse() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, FORWARD_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, FORWARD_SPEED)
}

function correctLeft() {
    maqueen.motorStop(maqueen.Motors.M1)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, CORRECTION_SPEED)
}

function correctRight() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, CORRECTION_SPEED)
    maqueen.motorStop(maqueen.Motors.M2)
}

function spinLeft() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, SPIN_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, SPIN_SPEED)
}

function spinRight() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, SPIN_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, SPIN_SPEED)
}

function searchRight() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, SEARCH_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, SEARCH_SPEED)
}

function searchLeft() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, SEARCH_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, SEARCH_SPEED)
}


// ============================================================
// LARGE TURN FUNCTIONS
// ============================================================

function turnLeft90Degrees() {
    stopMotors()
    basic.pause(100)
    spinLeft()
    basic.pause(TURN_90_MS)
    stopMotors()
    basic.pause(150)
}

function turnRight90Degrees() {
    stopMotors()
    basic.pause(100)
    spinRight()
    basic.pause(TURN_90_MS)
    stopMotors()
    basic.pause(150)
}

function turnAround() {
    reverse()
    basic.pause(180)
    stopMotors()
    basic.pause(100)
    spinLeft()
    basic.pause(TURN_180_MS)
    stopMotors()
    basic.pause(150)
}


// ============================================================
// ULTRASONIC READING
// ============================================================

function readDistanceCm(): number {
    // If this block name doesn't match your extension version,
    // check the Maqueen category in the blocks editor for the
    // exact "Ultrasonic sensor distance (cm)" block and swap it in.
    return maqueen.Ultrasonic(maqueen.PingUnit.Centimeters)
}


// ============================================================
// ARRIVAL AT A STATION (ultrasonic-triggered)
// ============================================================

function performArrivalRoutine() {
    robotState = BUSY

    stopMotors()
    basic.showIcon(IconNames.Happy)
    basic.pause(DELIVERY_PAUSE_MS)

    turnAround()

    robotState = RETURNING
    legStartedAt = input.runningTime()

    forward()
}


// Called every loop tick while OUTBOUND.
function checkArrivalOutbound() {
    let currentTime = input.runningTime()

    // Ignore the sensor right after leaving spawn.
    if (currentTime - legStartedAt < DEPARTURE_IGNORE_MS) {
        return
    }

    let distance = readDistanceCm()

    // 0 usually means an invalid/echo-timeout reading on this sensor;
    // ignore those instead of treating them as "very close".
    if (distance > 0 && distance <= ARRIVAL_DISTANCE_CM) {
        performArrivalRoutine()
    }
}


// ============================================================
// RETURNING TO SPAWN (timer-based)
// ============================================================

function handleSpawnReached() {
    robotState = BUSY

    stopMotors()
    basic.pause(200)

    let plan = turnPlan[destinationIndex]

    for (let turnNumber = 0; turnNumber < plan.turns; turnNumber++) {
        if (plan.direction == "right") {
            turnRight90Degrees()
        } else {
            turnLeft90Degrees()
        }
    }

    // Advance to the next destination in the fixed loop.
    destinationIndex = (destinationIndex + 1) % destinations.length

    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    forward()
    basic.pause(LEAVE_CENTER_MS)
}


// Called every loop tick while RETURNING.
function checkSpawnReturn() {
    let currentTime = input.runningTime()

    if (currentTime - legStartedAt >= RETURN_DRIVE_TIME_MS) {
        handleSpawnReached()
    }
}


// ============================================================
// BLACK-TAPE LINE FOLLOWING (no gap/marker logic needed)
// ============================================================

function lineFollowingStep() {
    leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight)

    if (leftSensor == 0 && rightSensor == 0) {
        forward()

    } else if (leftSensor == 0 && rightSensor == 1) {
        lastDirection = -1
        correctLeft()

    } else if (leftSensor == 1 && rightSensor == 0) {
        lastDirection = 1
        correctRight()

    } else {
        // Both sensors see white — line lost, search for it.
        if (lastDirection == -1) {
            searchLeft()
        } else {
            searchRight()
        }
    }
}


// ============================================================
// BUTTON CONTROL — single start button
// ============================================================

input.onButtonPressed(Button.B, function () {
    if (robotState != WAITING) {
        return
    }

    destinationIndex = 0
    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    basic.showIcon(IconNames.Happy)

    forward()
    basic.pause(LEAVE_CENTER_MS)
})


// ============================================================
// INITIAL SETUP
// ============================================================

stopMotors()
basic.showIcon(IconNames.Happy)


// ============================================================
// MAIN LOOP
// ============================================================

basic.forever(function () {
    if (robotState == OUTBOUND) {
        checkArrivalOutbound()
        if (robotState == OUTBOUND) {
            lineFollowingStep()
        }

    } else if (robotState == RETURNING) {
        checkSpawnReturn()
        if (robotState == RETURNING) {
            lineFollowingStep()
        }

    } else {
        stopMotors()
    }

    basic.pause(10)
})
