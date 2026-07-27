// ============================================================
// MAQUEEN BLACK-LINE DELIVERY ROBOT
//
//                  A
//                  |
//            D ----S---- B
//                  |
//                  C
//
// Robot begins at S, physically facing A.
//
// ROBOT BUTTONS:
// A = choose first station: A, B, C, or D
// B = confirm selection and start
//
// DEFAULT ROUTE:
// A -> S -> B -> S -> C -> S -> D
//
// LINE SENSOR VALUES:
// 0 = black tape
// 1 = white board
// ============================================================


// -------------------- ROBOT STATES --------------------

let WAITING = 0
let OUTBOUND = 1
let RETURNING = 2
let BUSY = 3
let DONE = 4

let robotState = WAITING


// -------------------- MOTOR SPEEDS --------------------

let FORWARD_SPEED = 42
let CORRECTION_SPEED = 46
let SEARCH_SPEED = 25
let SPIN_SPEED = 35


// -------------------- TURN SETTINGS --------------------

// Change these after physically testing the Maqueen.
let TURN_90_MS = 430
let TURN_180_MS = 860

// Distance needed to move into the middle of S.
let CENTER_ADVANCE_MS = 180

// Distance needed to leave the middle intersection.
let LEAVE_CENTER_MS = 250


// -------------------- MARKER SETTINGS --------------------

// Maximum time allowed while crossing a small white gap.
let GAP_BRIDGE_MAX_MS = 260

// Valid white marker duration.
let VALID_GAP_MIN_MS = 35
let VALID_GAP_MAX_MS = 260

// Two white gaps close together indicate a destination.
let DOUBLE_GAP_WINDOW_MS = 1100

// Ignore the spawn gap immediately after leaving S.
let DEPARTURE_IGNORE_MS = 700

// Ignore the destination gaps immediately after turning around.
let RETURN_IGNORE_MS = 900


// -------------------- DELIVERY VARIABLES --------------------

let destinations = ["A", "B", "C", "D"]

let destinationIndex = 0
let deliveriesCompleted = 0

let leftSensor = 0
let rightSensor = 0

// -1 means the line was last seen toward the left.
// 1 means the line was last seen toward the right.
let lastDirection = 1

// -1 means the robot is not currently crossing white.
let whiteStartedAt = -1

let lastOutboundGapAt = -10000
let outboundGapCount = 0

let legStartedAt = 0
let returnStartedAt = 0

let stationReadyReceived = false
let acknowledgmentReceived = false


// ============================================================
// BASIC MOTOR FUNCTIONS
// ============================================================

function stopMotors() {
    maqueen.motorStop(maqueen.Motors.M1)
    maqueen.motorStop(maqueen.Motors.M2)
}

function forward() {
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

function reverse() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CCW,
        FORWARD_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CCW,
        FORWARD_SPEED
    )
}


// Turn gently left while following black tape.
function correctLeft() {
    maqueen.motorStop(maqueen.Motors.M1)

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )
}


// Turn gently right while following black tape.
function correctRight() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )

    maqueen.motorStop(maqueen.Motors.M2)
}


// Spin left in place.
function spinLeft() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CCW,
        SPIN_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        SPIN_SPEED
    )
}


// Search toward the right when the black tape is lost.
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


// Search toward the left when the black tape is lost.
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


function turnAround() {
    // Move away from the destination before turning.
    reverse()
    basic.pause(180)

    stopMotors()
    basic.pause(100)

    spinLeft()
    basic.pause(TURN_180_MS)

    stopMotors()
    basic.pause(150)
}


// Robot physically begins facing A.
// This rotates it toward the selected first station.
function faceSelectedFirstStation() {
    let numberOfLeftTurns = (4 - destinationIndex) % 4

    for (
        let turnNumber = 0;
        turnNumber < numberOfLeftTurns;
        turnNumber++
    ) {
        turnLeft90Degrees()
    }
}


// ============================================================
// RADIO FUNCTIONS
// ============================================================

function currentDestination(): string {
    return destinations[destinationIndex]
}


// Ask the selected station whether it is turned on and ready.
function waitForCurrentStation() {
    stationReadyReceived = false

    stopMotors()
    basic.showString(currentDestination())

    while (!stationReadyReceived) {
        radio.sendString(
            "CALL:" + currentDestination()
        )

        basic.pause(250)
    }

    basic.showIcon(IconNames.Yes)
    basic.pause(300)

    // Display the current station letter.
    basic.showString(currentDestination())
}


// Tell the station that the Maqueen reached it.
function deliverFood() {
    acknowledgmentReceived = false

    stopMotors()
    basic.showString(currentDestination())

    while (!acknowledgmentReceived) {
        radio.sendString(
            "ARRIVED:" + currentDestination()
        )

        basic.pause(250)
    }

    // The correct station confirmed the delivery.
    basic.showIcon(IconNames.Yes)
    basic.pause(500)
}


// Receive messages from Stations A, B, C, and D.
radio.onReceivedString(function (message) {
    if (
        message ==
        "READY:" + currentDestination()
    ) {
        stationReadyReceived = true
    }

    if (
        message ==
        "ACK:" + currentDestination()
    ) {
        acknowledgmentReceived = true
    }
})


// ============================================================
// DESTINATION HANDLING
// ============================================================

function destinationReached() {
    robotState = BUSY

    stopMotors()

    // Wait until the correct station confirms delivery.
    deliverFood()

    // Turn around only after receiving ACK.
    turnAround()

    whiteStartedAt = -1
    outboundGapCount = 0
    lastOutboundGapAt = -10000

    robotState = RETURNING
    returnStartedAt = input.runningTime()

    forward()

    // Move away from the two destination markers.
    basic.pause(250)
}


// ============================================================
// SPAWN HANDLING
// ============================================================

function spawnReached() {
    robotState = BUSY

    // Move farther so the center of the car reaches S.
    forward()
    basic.pause(CENTER_ADVANCE_MS)

    stopMotors()
    basic.pause(250)

    deliveriesCompleted += 1

    // Four stations have been completed.
    if (deliveriesCompleted >= 4) {
        robotState = DONE

        radio.sendString("ALL_DONE")

        basic.showIcon(IconNames.Yes)
        stopMotors()

        return
    }

    // Move to the next clockwise destination.
    destinationIndex =
        (destinationIndex + 1) %
        destinations.length

    // Flash the next station letter.
    basic.showString(currentDestination())

    // Make sure the next station is communicating.
    waitForCurrentStation()

    // A -> B -> C -> D requires one left turn
    // after returning from each station.
    turnLeft90Degrees()

    whiteStartedAt = -1
    outboundGapCount = 0
    lastOutboundGapAt = -10000

    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    forward()

    // Clear the middle intersection.
    basic.pause(LEAVE_CENTER_MS)
}


// ============================================================
// WHITE MARKER DETECTION
// ============================================================

function registerCompletedGap(): boolean {
    let currentTime = input.runningTime()

    // Traveling from S toward a station.
    if (robotState == OUTBOUND) {

        // Ignore the spawn marker immediately after departure.
        if (
            currentTime - legStartedAt <
            DEPARTURE_IGNORE_MS
        ) {
            return false
        }

        // Determine whether two gaps happened close together.
        if (
            currentTime - lastOutboundGapAt <=
            DOUBLE_GAP_WINDOW_MS
        ) {
            outboundGapCount += 1
        } else {
            outboundGapCount = 1
        }

        lastOutboundGapAt = currentTime

        // Two white gaps mean the destination was reached.
        if (outboundGapCount >= 2) {
            destinationReached()
            return true
        }
    }


    // Traveling from a station back toward S.
    if (robotState == RETURNING) {

        // Ignore the destination markers after turning around.
        if (
            currentTime - returnStartedAt <
            RETURN_IGNORE_MS
        ) {
            return false
        }

        // The next single white gap is the spawn marker.
        spawnReached()
        return true
    }

    return false
}


// ============================================================
// BLACK-TAPE LINE FOLLOWING
// ============================================================

function lineFollowingStep() {
    leftSensor = maqueen.readPatrol(
        maqueen.Patrol.PatrolLeft
    )

    rightSensor = maqueen.readPatrol(
        maqueen.Patrol.PatrolRight
    )

    let currentTime = input.runningTime()


    // --------------------------------------------------------
    // BOTH SENSORS SEE WHITE
    // --------------------------------------------------------

    if (
        leftSensor == 1 &&
        rightSensor == 1
    ) {
        if (whiteStartedAt == -1) {
            whiteStartedAt = currentTime
        }

        let whiteDuration =
            currentTime - whiteStartedAt

        // Keep moving across a small marker gap.
        if (
            whiteDuration <=
            GAP_BRIDGE_MAX_MS
        ) {
            forward()
        } else {
            // Too much white means the robot lost the black tape.
            if (lastDirection == -1) {
                searchLeft()
            } else {
                searchRight()
            }
        }

        return
    }


    // --------------------------------------------------------
    // FINISHED CROSSING A WHITE GAP
    // --------------------------------------------------------

    if (whiteStartedAt != -1) {
        let completedGapDuration =
            currentTime - whiteStartedAt

        whiteStartedAt = -1

        if (
            completedGapDuration >=
            VALID_GAP_MIN_MS &&
            completedGapDuration <=
            VALID_GAP_MAX_MS
        ) {
            if (registerCompletedGap()) {
                return
            }
        }
    }


    // --------------------------------------------------------
    // NORMAL BLACK-TAPE TRACKING
    // --------------------------------------------------------

    if (
        leftSensor == 0 &&
        rightSensor == 0
    ) {
        // Both sensors detect black tape.
        forward()

    } else if (
        leftSensor == 0 &&
        rightSensor == 1
    ) {
        // Black tape is under the left sensor.
        lastDirection = -1
        correctLeft()

    } else if (
        leftSensor == 1 &&
        rightSensor == 0
    ) {
        // Black tape is under the right sensor.
        lastDirection = 1
        correctRight()
    }
}


// ============================================================
// ROBOT BUTTON CONTROLS
// ============================================================

// Button A cycles through A, B, C, and D.
input.onButtonPressed(Button.A, function () {
    if (robotState != WAITING) {
        return
    }

    destinationIndex =
        (destinationIndex + 1) %
        destinations.length

    basic.showString(currentDestination())
})


// Button B confirms the displayed station and begins.
input.onButtonPressed(Button.B, function () {
    if (robotState != WAITING) {
        return
    }

    robotState = BUSY

    deliveriesCompleted = 0
    outboundGapCount = 0
    lastOutboundGapAt = -10000
    whiteStartedAt = -1

    // Make sure the selected station answers.
    waitForCurrentStation()

    // Robot begins physically facing Station A.
    faceSelectedFirstStation()

    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    forward()
    basic.pause(LEAVE_CENTER_MS)
})


// ============================================================
// INITIAL SETUP
// ============================================================

// Every micro:bit must use radio group 17.
radio.setGroup(17)

// Maximum radio power.
radio.setTransmitPower(7)

stopMotors()

// A is the default starting station.
basic.showString(currentDestination())


// ============================================================
// MAIN LOOP
// ============================================================

basic.forever(function () {
    if (
        robotState == OUTBOUND ||
        robotState == RETURNING
    ) {
        lineFollowingStep()
    } else {
        stopMotors()
    }

    basic.pause(10)
})
