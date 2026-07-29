// ============================================================
// MAQUEEN ULTRASONIC DELIVERY ROBOT (no radio)
//
//                  A
//                  |
//            D ----S---- B
//                  |
//                  C
//
// Robot begins at S, physically facing A.
// LOOP RULE: after every single return to S, turn the same direction
// (RETURN_TURN_DIRECTION) once, then go straight to the next station.
// Which physical station ends up visited in which order falls out of
// the course layout -- confirm by testing.
//
// Arrival at a station = ultrasonic sensor detects the cardboard
// building close ahead. No radio needed.
//
// Getting back to spawn = timed dead reckoning. No tape gap, no
// sensor-based marker at the intersection at all -- the robot just
// drives back at CREEP_SPEED for a fixed, measured duration per arm
// (arms are different lengths, so each gets its own number), then
// stops and does the turn. Same open-loop philosophy already used
// for the turns themselves (TURN_90_MS etc.) -- no angle/position
// feedback, just calibrated timing.
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

// Confirmed by testing with turn-calibration-test.js: the two motors
// aren't perfectly matched, so a single shared spin speed doesn't
// give a clean 90/180 in every direction. Each turn type gets its
// own tuned value instead. Still worth re-checking these
// periodically as the battery drains, since these are open-loop
// (timed) turns with no angle feedback.
let TURN_LEFT_SPEED = 65
let TURN_RIGHT_SPEED = 69
let TURN_AROUND_SPEED = 62

// Current commanded forward speed. Starts at FORWARD_SPEED and gets
// throttled down by checkArrivalOutbound() as the robot nears a
// building, then reset back to FORWARD_SPEED at the start of each
// new leg. forward() always drives at whatever this is currently
// set to.
let forwardSpeed = FORWARD_SPEED


// -------------------- TURN SETTINGS (TUNE THESE) --------------------

let TURN_90_MS = 430
let TURN_180_MS = 860

// Used by the very first launch (Button B), where the robot is
// manually placed on the line rather than actively leaving a
// detected gap.
let LEAVE_CENTER_MS = 480

// Used every other time the robot leaves spawn: how long to blind-
// drive straight after the spawn turn before handing off to normal
// line following. Gives it a moment to clear the pivot point so
// line-following isn't immediately fighting the turn's momentum.
// Started equal to LEAVE_CENTER_MS, tune independently -- this drive
// starts from a dead stop right at the intersection rather than from
// an arbitrary manual placement.
let CROSS_CENTER_MS = 480


// -------------------- ULTRASONIC SETTINGS (TUNE THESE) --------------------

// Distance in cm at which the robot counts the building as "reached"
// and stops for real. Raised from 8 to 10 — at 8cm there usually
// isn't enough room left to fully bleed off momentum before contact,
// especially since the last stretch is now driven at CREEP_SPEED.
let ARRIVAL_DISTANCE_CM = 10

// Distance in cm at which the robot starts slowing to CREEP_SPEED
// instead of full FORWARD_SPEED. Approaching slowly gives much less
// momentum to shed at the final stop, which is the main fix for
// "doesn't stop in time and hits the object."
let SLOWDOWN_DISTANCE_CM = 30

// Slow approach speed used between SLOWDOWN_DISTANCE_CM and
// ARRIVAL_DISTANCE_CM.
let CREEP_SPEED = 20

// Ignore ultrasonic readings right after leaving spawn, so it doesn't
// falsely trigger on something behind it or on sensor noise.
let DEPARTURE_IGNORE_MS = 800

// How long to sit at the building before turning around (feels like a delivery).
let DELIVERY_PAUSE_MS = 800


// How long the robot tolerates seeing white on both sensors before
// concluding the line is genuinely lost and starts actively
// searching for it. Now that spawn detection is moving to a timer
// (no more tape gap to tolerate), "both white" should basically
// always mean real line loss -- so this is just filtering out a
// single-tick sensor flicker, not tolerating a deliberate gap.
// Dropped way down from 500 for that reason; if it's still too
// twitchy (searching on brief, harmless flickers), nudge it up
// slightly, but it shouldn't need to be anywhere near 500 again.
let LINE_LOST_MS = 80


// -------------------- RETURN TIMING (TUNE THESE) --------------------
//
// How long, in ms, the return leg takes from each station back to the
// center of the intersection, driving at CREEP_SPEED. Indexed by
// destinationIndex (0,1,2,3 cycling), one entry per leg of the loop.
// Arms are different physical lengths, so these are NOT the same
// number -- measure each one by watching where the robot actually
// stops relative to the intersection and nudging the corresponding
// entry up (stopped short of center) or down (overshot past center).
//
// These are placeholders, not measured values yet -- start here and
// tune per arm.
let returnDurationMs = [3000, 3000, 3000, 3000]

// The entire return leg drives at CREEP_SPEED, not just a portion of
// it -- an earlier version tried switching to creep partway through
// (after RETURN_SLOWDOWN_MS), but that only works if the timing
// happens to land before reaching the intersection, which isn't
// reliable across arms of different lengths. Driving the whole leg
// slow removes that guesswork entirely: less momentum at the stop no
// matter which arm it's returning from, and it's also the speed the
// returnDurationMs values above were/should be measured at -- if you
// ever change CREEP_SPEED, re-measure all four.


// -------------------- ROUTE ORDER & TURNS AT SPAWN --------------------

// Every single return does the exact same thing: one turn (currently
// right), then straight out to the next station. No per-arm turn
// plan needed anymore -- unlike the old design (some returns went
// straight through, one turned left, one turned right), this is a
// single fixed rule applied every time. Which physical station ends
// up visited in which order falls out of the course geometry, not
// this array -- destinations is just here to give destinationIndex
// something to cycle through (0,1,2,3,0,...) for indexing
// returnDurationMs below, since the arms are different lengths.
// Confirm by testing which order this actually visits the 4 stations
// in, and swap RETURN_TURN_DIRECTION to "left" if it's visiting them
// backwards from what you want.
let destinations = ["leg0", "leg1", "leg2", "leg3"]
let destinationIndex = 0

let RETURN_TURN_DIRECTION = "right"


// -------------------- LINE FOLLOWING STATE --------------------

let leftSensor = 0
let rightSensor = 0
let lastDirection = 1   // -1 = line last seen left, 1 = last seen right
let whiteStartedAt = -1 // when the current both-white stretch began, -1 if not currently white

let legStartedAt = 0


// ============================================================
// BASIC MOTOR FUNCTIONS
// ============================================================

function stopMotors() {
    maqueen.motorStop(maqueen.Motors.M1)
    maqueen.motorStop(maqueen.Motors.M2)
}

function forward() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, forwardSpeed)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, forwardSpeed)
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

function spinLeft(speed: number) {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, speed)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, speed)
}

function spinRight(speed: number) {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, speed)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, speed)
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
    spinLeft(TURN_LEFT_SPEED)
    basic.pause(TURN_90_MS)
    stopMotors()
    basic.pause(150)
}

function turnRight90Degrees() {
    stopMotors()
    basic.pause(100)
    spinRight(TURN_RIGHT_SPEED)
    basic.pause(TURN_90_MS)
    stopMotors()
    basic.pause(150)
}

function turnAround() {
    reverse()
    basic.pause(180)
    stopMotors()
    basic.pause(100)
    spinLeft(TURN_AROUND_SPEED)
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
    return maqueen.Ultrasonic()
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

    // Whole return leg drives slow -- see note above.
    forwardSpeed = CREEP_SPEED

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
    if (distance <= 0) {
        return
    }

    if (distance <= ARRIVAL_DISTANCE_CM) {
        performArrivalRoutine()

    } else if (distance <= SLOWDOWN_DISTANCE_CM) {
        // Close enough to start easing off — creep the rest of the
        // way in so there's much less momentum to shed at the stop.
        forwardSpeed = CREEP_SPEED

    } else {
        forwardSpeed = FORWARD_SPEED
    }
}


// ============================================================
// RETURNING TO SPAWN (timed dead reckoning)
// ============================================================

function handleSpawnReached() {
    robotState = BUSY

    stopMotors()
    basic.pause(200)

    // Same turn every single time -- see RETURN_TURN_DIRECTION above.
    if (RETURN_TURN_DIRECTION == "right") {
        turnRight90Degrees()
    } else {
        turnLeft90Degrees()
    }

    // Advance to the next destination in the fixed loop.
    destinationIndex = (destinationIndex + 1) % destinations.length

    // Full speed heading back out; checkArrivalOutbound() will slow
    // it down again as it nears the next building.
    forwardSpeed = FORWARD_SPEED

    robotState = OUTBOUND
    legStartedAt = input.runningTime()

    // Same approach as the very first launch (Button B): blind-drive
    // straight for a fixed, calibrated time to clear the
    // intersection, then hand off to the ordinary lineFollowingStep()
    // -- the same line-following/correction/search logic used for
    // every other stretch of every leg. No separate sensor-based
    // "wait until confirmed clear" logic: that approach (tried and
    // reworked three times) kept being the thing that broke, whether
    // by hanging forever waiting for a reading that never came, or by
    // handing off control at the wrong moment. Reusing the simpler,
    // already-proven mechanism instead of a bespoke one for this one
    // spot removes that whole class of bug.
    forward()
    basic.pause(CROSS_CENTER_MS)
}


// Called every loop tick while RETURNING. No sensor involved at all --
// just checks whether enough time has passed for this specific arm
// (returnDurationMs[destinationIndex]) since the return leg started.
function checkSpawnReturn() {
    if (input.runningTime() - legStartedAt >= returnDurationMs[destinationIndex]) {
        // handleSpawnReached() sets robotState = BUSY as its very
        // first line, so the main loop's
        // "if (robotState == RETURNING) lineFollowingStep()" check
        // right after this call is already false by the time it
        // runs -- nothing gets a chance to run another tick of
        // RETURNING logic after time's up.
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
        whiteStartedAt = -1
        forward()

    } else if (leftSensor == 0 && rightSensor == 1) {
        whiteStartedAt = -1
        lastDirection = -1
        correctLeft()

    } else if (leftSensor == 1 && rightSensor == 0) {
        whiteStartedAt = -1
        lastDirection = 1
        correctRight()

    } else {
        // Both sensors see white -- with no tape/marker anywhere on
        // the course anymore, this should only ever be a brief
        // misread (a flicker, a moment of drift). Tolerate that for
        // LINE_LOST_MS by driving straight; past that, the line is
        // genuinely gone, so actively search for it using the
        // direction of the last real correction, instead of driving
        // straight forever.
        if (whiteStartedAt == -1) {
            whiteStartedAt = input.runningTime()
        }

        if (input.runningTime() - whiteStartedAt < LINE_LOST_MS) {
            forward()
        } else if (lastDirection == -1) {
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
    forwardSpeed = FORWARD_SPEED
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
