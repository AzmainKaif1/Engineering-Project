// ============================================================
// MAQUEEN AUTONOMOUS DELIVERY ROBOT
//
// Board layout:
//
//                  A
//                  |
//            D ----S---- B
//                  |
//                  C
//
// Robot starts at S facing A.
// Route: A -> B -> C -> D
//
// Sensor convention used here:
// 0 = black
// 1 = white
// ============================================================


// -------------------- STATES --------------------

let WAITING = 0
let OUTBOUND = 1
let RETURNING = 2
let BUSY = 3
let DONE = 4

let robotState = WAITING


// -------------------- SPEED SETTINGS --------------------

let FORWARD_SPEED = 42
let CORRECTION_SPEED = 46
let SEARCH_SPEED = 25
let SPIN_SPEED = 35


// -------------------- TURN CALIBRATION --------------------

// Adjust these two values after testing.
let TURN_90_MS = 430
let TURN_180_MS = 860

// How far to move into the middle after detecting the spawn gap.
let CENTER_ADVANCE_MS = 180

// How far to move forward after turning toward a new destination.
let LEAVE_CENTER_MS = 250


// -------------------- MARKER SETTINGS --------------------

// Small gaps shorter than this are crossed by driving straight.
let GAP_BRIDGE_MAX_MS = 260

// Minimum and maximum duration for a real marker gap.
let VALID_GAP_MIN_MS = 35
let VALID_GAP_MAX_MS = 260

// Two destination gaps must occur within this amount of time.
let DOUBLE_GAP_WINDOW_MS = 1100

// Ignore the spawn marker immediately after leaving the center.
let DEPARTURE_IGNORE_MS = 700

// Ignore the destination marker immediately after turning around.
let RETURN_IGNORE_MS = 900


// -------------------- DELIVERY VARIABLES --------------------

let destinations = ["A", "B", "C", "D"]
let destinationIndex = 0

let leftSensor = 0
let rightSensor = 0

let lastDirection = 1

// -1 means that a white gap is not currently being crossed.
let whiteStartedAt = -1

let lastOutboundGapAt = -10000
let outboundGapCount = 0

let legStartedAt = 0
let returnStartedAt = 0

let acknowledgmentReceived = false


// ============================================================
// MOTOR FUNCTIONS
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

// Gentle left correction while following the line.
function correctLeft() {
    maqueen.motorStop(maqueen.Motors.M1)

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )
}

// Gentle right correction while following the line.
function correctRight() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        CORRECTION_SPEED
    )

    maqueen.motorStop(maqueen.Motors.M2)
}

// Rotate left in place.
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

// Rotate right in place while searching.
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

// Rotate left in place while searching.
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
    // Back away from the edge or destination first.
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
// RADIO DELIVERY FUNCTIONS
// ============================================================

function currentDestination(): string {
    return destinations[destinationIndex]
}

function deliverFood() {
    let station = currentDestination()

    stopMotors()

    // Show which station has been reached.
    basic.showString(station)

    acknowledgmentReceived = false

    // Send several times in case a radio packet is missed.
    for (let attempt = 0; attempt < 10; attempt++) {
        if (!acknowledgmentReceived) {
            radio.sendString("DELIVER:" + station)
            basic.pause(180)
        }
    }

    if (acknowledgmentReceived) {
        basic.showIcon(IconNames.Yes)
    } else {
        // Delivery message was sent, but no confirmation returned.
        basic.showIcon(IconNames.No)
    }

    basic.pause(500)
}


// Receive confirmation from A, B, C or D.
radio.onReceivedString(function (receivedString) {
    if (
        robotState == BUSY &&
        receivedString == "ACK:" + currentDestination()
    ) {
        acknowledgmentReceived = true
    }
})


// ============================================================
// DESTINATION AND SPAWN HANDLING
// ============================================================

function destinationReached() {
    robotState = BUSY
    stopMotors()

    deliverFood()

    // Turn around and begin returning to spawn.
    turnAround()

    whiteStartedAt = -1
    outboundGapCount = 0
    lastOutboundGapAt = -10000

    robotState = RETURNING
    returnStartedAt = input.runningTime()

    forward()

    // Move away from the destination marker.
    basic.pause(250)
}

function spawnReached() {
    robotState = BUSY

    // The robot has just crossed the single white spawn marker.
    // Continue slightly farther so its center reaches the intersection.
    forward()
    basic.pause(CENTER_ADVANCE_MS)

    stopMotors()
    basic.pause(250)

    destinationIndex += 1

    // D was the final delivery.
    if (destinationIndex >= destinations.length) {
        robotState = DONE

        radio.sendString("ALL_DONE")

        basic.showIcon(IconNames.Yes)
        stopMotors()
        return
    }

    // Show the next destination while stopped.
    basic.showString(currentDestination())

    // Because destinations are arranged clockwise, turning left
    // after returning from each arm points toward the next arm.
    turnLeft90Degrees()

    whiteStartedAt = -1
    outboundGapCount = 0
    lastOutboundGapAt = -10000

    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    forward()

    // Clear the center intersection before normal tracking resumes.
    basic.pause(LEAVE_CENTER_MS)
}


// ============================================================
// GAP / LOCATION DETECTION
// ============================================================

function registerCompletedGap(): boolean {
    let now = input.runningTime()

    // --------------------------------------------------------
    // Traveling from spawn to a destination
    // --------------------------------------------------------
    if (robotState == OUTBOUND) {

        // Ignore the single spawn gap immediately after departure.
        if (now - legStartedAt < DEPARTURE_IGNORE_MS) {
            return false
        }

        // Check whether this gap occurred shortly after another gap.
        if (now - lastOutboundGapAt <= DOUBLE_GAP_WINDOW_MS) {
            outboundGapCount += 1
        } else {
            outboundGapCount = 1
        }

        lastOutboundGapAt = now

        // Two quick gaps mean the destination marker.
        if (outboundGapCount >= 2) {
            destinationReached()
            return true
        }
    }

    // --------------------------------------------------------
    // Returning from a destination to spawn
    // --------------------------------------------------------
    if (robotState == RETURNING) {

        // Ignore the destination's two gaps immediately after
        // turning around.
        if (now - returnStartedAt < RETURN_IGNORE_MS) {
            return false
        }

        // The first proper gap after the ignore period is the
        // single spawn marker.
        spawnReached()
        return true
    }

    return false
}


// ============================================================
// LINE FOLLOWING
// ============================================================

function lineFollowingStep() {
    leftSensor = maqueen.readPatrol(
        maqueen.Patrol.PatrolLeft
    )

    rightSensor = maqueen.readPatrol(
        maqueen.Patrol.PatrolRight
    )

    let now = input.runningTime()

    // --------------------------------------------------------
    // BOTH SENSORS SEE WHITE
    // --------------------------------------------------------

    if (leftSensor == 1 && rightSensor == 1) {

        if (whiteStartedAt == -1) {
            whiteStartedAt = now
        }

        let whiteDuration = now - whiteStartedAt

        // Continue straight across short white marker gaps.
        if (whiteDuration <= GAP_BRIDGE_MAX_MS) {
            forward()
        } else {
            // If white lasts too long, the robot probably lost
            // the line instead of crossing a marker.
            if (lastDirection == -1) {
                searchLeft()
            } else {
                searchRight()
            }
        }

        return
    }

    // --------------------------------------------------------
    // THE ROBOT HAS FINISHED CROSSING A WHITE GAP
    // --------------------------------------------------------

    if (whiteStartedAt != -1) {
        let completedGapDuration = now - whiteStartedAt
        whiteStartedAt = -1

        if (
            completedGapDuration >= VALID_GAP_MIN_MS &&
            completedGapDuration <= VALID_GAP_MAX_MS
        ) {
            if (registerCompletedGap()) {
                return
            }
        }
    }

    // --------------------------------------------------------
    // NORMAL BLACK-LINE FOLLOWING
    // --------------------------------------------------------

    if (leftSensor == 0 && rightSensor == 0) {
        // Both sensors see black.
        forward()

    } else if (leftSensor == 0 && rightSensor == 1) {
        // Black line is under the left sensor.
        lastDirection = -1
        correctLeft()

    } else if (leftSensor == 1 && rightSensor == 0) {
        // Black line is under the right sensor.
        lastDirection = 1
        correctRight()
    }
}


// ============================================================
// START BUTTON
// ============================================================

input.onButtonPressed(Button.A, function () {
    if (robotState != WAITING) {
        return
    }

    destinationIndex = 0
    outboundGapCount = 0
    lastOutboundGapAt = -10000
    whiteStartedAt = -1

    basic.showString(currentDestination())

    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    forward()
    basic.pause(LEAVE_CENTER_MS)
})


// ============================================================
// INITIAL SETUP
// ============================================================

// Every Maqueen and station micro:bit must use group 17.
radio.setGroup(17)

stopMotors()

basic.showLeds(`
    . # # # .
    # . # . #
    # . # . #
    # . . . #
    . # # # .
`)


// ============================================================
// MAIN LOOP
// ============================================================

basic.forever(function () {
    if (robotState == OUTBOUND || robotState == RETURNING) {
        lineFollowingStep()
    } else {
        stopMotors()
    }

    basic.pause(10)
})
