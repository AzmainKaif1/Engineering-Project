// ============================================================
// MAQUEEN FAST BLACK-LINE FOLLOWER
// + RADIO CONTROLLER
// + RGB STATUS
// + MUSIC
//
// CONTROLLER COMMANDS:
//
// A       sends "LEFT"
// B       sends "RIGHT"
// A + B   sends "TOGGLE"
//
// RUNNING MODE:
// - Robot follows black tape.
// - RGB lights are RED.
// - Micro:bit shows an X.
// - Running tune repeats.
//
// DELIVERY / STOPPED MODE:
// - Robot stops.
// - RGB lights are GREEN.
// - Micro:bit shows a check mark.
// - Completion tune plays once.
//
// Both micro:bits must use radio group 17.
//
// LINE SENSOR VALUES:
// 0 = black
// 1 = white
// ============================================================


// ============================================================
// WHEEL SPEED SETTINGS
// ============================================================

// Separate speeds help balance the two motors.
//
// If the robot drifts left:
// Increase LEFT_FORWARD_SPEED slightly.
//
// If the robot drifts right:
// Increase RIGHT_FORWARD_SPEED slightly.

let LEFT_FORWARD_SPEED = 48
let RIGHT_FORWARD_SPEED = 52

// Speeds used while correcting the line.
let LEFT_CORRECTION_SPEED = 56
let RIGHT_CORRECTION_SPEED = 58

// Slow wheel speed during corrections.
let SLOW_WHEEL_SPEED = 14

// Speed used when searching for a lost line.
let SEARCH_SPEED = 32

// Speeds used for controller turns.
let LEFT_TURN_SPEED = 66
let RIGHT_TURN_SPEED = 70


// ============================================================
// TURN SETTINGS
// ============================================================

// Faster motors require shorter turning times.
//
// Increase if the robot does not turn enough.
// Decrease if the robot turns too far.

let LEFT_TURN_MS = 330
let RIGHT_TURN_MS = 330

// Move forward after a controller turn so the sensors
// reconnect with the selected black tape.
let REJOIN_LINE_MS = 180

// Continue forward briefly if both sensors see white.
let WHITE_GRACE_MS = 60


// ============================================================
// RGB SETTINGS
// ============================================================

// Change P15 if your RGB LEDs use another pin.
let rgbLights = neopixel.create(
    DigitalPin.P15,
    4,
    NeoPixelMode.RGB
)

// Maximum RGB brightness.
rgbLights.setBrightness(255)


// ============================================================
// VARIABLES
// ============================================================

// Robot starts running immediately when powered on.
let robotRunning = true

// True when the robot is stopped at a delivery location.
let deliveryMode = false

// Prevent automatic line-following during a manual turn.
let manualTurnActive = false

// -1 means the black line was last seen toward the left.
// 1 means the black line was last seen toward the right.
let lastDirection = 1

// -1 means both sensors are not currently seeing white.
let whiteStartedAt = -1


// ============================================================
// RGB FUNCTIONS
// ============================================================

function showRunningRed() {
    rgbLights.showColor(
        neopixel.colors(NeoPixelColors.Red)
    )
}


function showDeliveryGreen() {
    rgbLights.showColor(
        neopixel.colors(NeoPixelColors.Green)
    )
}


function turnOffRGB() {
    rgbLights.clear()
    rgbLights.show()
}


// ============================================================
// MUSIC FUNCTIONS
// ============================================================

function startRunningTune() {
    // Stop any previous melody first.
    music.stopMelody(
        MelodyStopOptions.All
    )

    // Repeating background tune.
    // It does not block line-following.
    music.startMelody(
        [
            "C4:1",
            "E4:1",
            "G4:1",
            "E4:1",
            "D4:1",
            "F4:1",
            "A4:1",
            "F4:1"
        ],
        MelodyOptions.ForeverInBackground
    )
}


function playCompletionTune() {
    music.stopMelody(
        MelodyStopOptions.All
    )

    // Completion/success melody.
    music.startMelody(
        [
            "C4:1",
            "E4:1",
            "G4:1",
            "C5:2",
            "G4:1",
            "C5:3"
        ],
        MelodyOptions.Once
    )
}


// ============================================================
// MOTOR FUNCTIONS
// ============================================================

function stopRobot() {
    maqueen.motorStop(
        maqueen.Motors.M1
    )

    maqueen.motorStop(
        maqueen.Motors.M2
    )
}


function moveForward() {
    // M1 = left wheel.
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        LEFT_FORWARD_SPEED
    )

    // M2 = right wheel.
    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        RIGHT_FORWARD_SPEED
    )
}


// Turn gently left while following the line.
function correctLeft() {
    // Slow the left wheel.
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        SLOW_WHEEL_SPEED
    )

    // Speed up the right wheel.
    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        RIGHT_CORRECTION_SPEED
    )
}


// Turn gently right while following the line.
function correctRight() {
    // Speed up the left wheel.
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        LEFT_CORRECTION_SPEED
    )

    // Slow the right wheel.
    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        SLOW_WHEEL_SPEED
    )
}


// Rotate left in place.
function spinLeft() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CCW,
        LEFT_TURN_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CW,
        RIGHT_TURN_SPEED
    )
}


// Rotate right in place.
function spinRight() {
    maqueen.motorRun(
        maqueen.Motors.M1,
        maqueen.Dir.CW,
        LEFT_TURN_SPEED
    )

    maqueen.motorRun(
        maqueen.Motors.M2,
        maqueen.Dir.CCW,
        RIGHT_TURN_SPEED
    )
}


// Search left when both sensors lose the line.
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


// Search right when both sensors lose the line.
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
// CONTROLLER LEFT TURN
// ============================================================

function controllerTurnLeft() {
    if (
        !robotRunning ||
        deliveryMode ||
        manualTurnActive
    ) {
        return
    }

    manualTurnActive = true

    stopRobot()
    basic.pause(40)

    spinLeft()
    basic.pause(LEFT_TURN_MS)

    stopRobot()
    basic.pause(50)

    // Push forward onto the selected black line.
    moveForward()
    basic.pause(REJOIN_LINE_MS)

    whiteStartedAt = -1
    lastDirection = -1

    manualTurnActive = false
}


// ============================================================
// CONTROLLER RIGHT TURN
// ============================================================

function controllerTurnRight() {
    if (
        !robotRunning ||
        deliveryMode ||
        manualTurnActive
    ) {
        return
    }

    manualTurnActive = true

    stopRobot()
    basic.pause(40)

    spinRight()
    basic.pause(RIGHT_TURN_MS)

    stopRobot()
    basic.pause(50)

    // Push forward onto the selected black line.
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


    // --------------------------------------------------------
    // BOTH SENSORS SEE BLACK
    // --------------------------------------------------------

    if (
        leftSensor == 0 &&
        rightSensor == 0
    ) {
        whiteStartedAt = -1

        moveForward()
    }


    // --------------------------------------------------------
    // LEFT SENSOR SEES BLACK
    // --------------------------------------------------------

    else if (
        leftSensor == 0 &&
        rightSensor == 1
    ) {
        whiteStartedAt = -1
        lastDirection = -1

        correctLeft()
    }


    // --------------------------------------------------------
    // RIGHT SENSOR SEES BLACK
    // --------------------------------------------------------

    else if (
        leftSensor == 1 &&
        rightSensor == 0
    ) {
        whiteStartedAt = -1
        lastDirection = 1

        correctRight()
    }


    // --------------------------------------------------------
    // BOTH SENSORS SEE WHITE
    // --------------------------------------------------------

    else {
        if (whiteStartedAt == -1) {
            whiteStartedAt =
                input.runningTime()
        }

        let whiteDuration =
            input.runningTime() -
            whiteStartedAt

        // Continue straight briefly for small sensor flickers.
        if (
            whiteDuration <
            WHITE_GRACE_MS
        ) {
            moveForward()

        } else {
            // Search in the direction where the line
            // was last detected.
            if (lastDirection == -1) {
                searchLeft()
            } else {
                searchRight()
            }
        }
    }
}


// ============================================================
// RUNNING MODE
// ============================================================

function enterRunningMode() {
    deliveryMode = false
    robotRunning = true
    manualTurnActive = false

    whiteStartedAt = -1

    // Red means the delivery is still in progress.
    showRunningRed()

    // X means not delivered yet.
    basic.showIcon(
        IconNames.No
    )

    startRunningTune()
}


// ============================================================
// DELIVERY / STOPPED MODE
// ============================================================

function enterDeliveryMode() {
    deliveryMode = true
    robotRunning = false
    manualTurnActive = false

    stopRobot()

    // Green means delivery completed.
    showDeliveryGreen()

    // Check mark means success.
    basic.showIcon(
        IconNames.Yes
    )

    playCompletionTune()

    stopRobot()
}


// ============================================================
// TOGGLE RUN / STOP
// ============================================================

function toggleDeliveryMode() {
    if (deliveryMode) {
        enterRunningMode()
    } else {
        enterDeliveryMode()
    }
}


// ============================================================
// RADIO CONTROLLER
// ============================================================

radio.onReceivedString(function (command) {

    // Controller A button.
    if (
        command == "LEFT" ||
        command == "A"
    ) {
        controllerTurnLeft()
    }


    // Controller B button.
    else if (
        command == "RIGHT" ||
        command == "B"
    ) {
        controllerTurnRight()
    }


    // Controller A+B buttons.
    else if (
        command == "TOGGLE"
    ) {
        toggleDeliveryMode()
    }


    // Optional backup start command.
    else if (
        command == "START"
    ) {
        enterRunningMode()
    }


    // Optional backup stop command.
    else if (
        command == "STOP"
    ) {
        enterDeliveryMode()
    }
})


// ============================================================
// BUTTONS DIRECTLY ON THE ROBOT
// ============================================================

// Robot A button starts/resumes.
input.onButtonPressed(
    Button.A,
    function () {
        enterRunningMode()
    }
)


// Robot B button stops and marks delivery complete.
input.onButtonPressed(
    Button.B,
    function () {
        enterDeliveryMode()
    }
)


// Robot A+B toggles running/stopped mode.
input.onButtonPressed(
    Button.AB,
    function () {
        toggleDeliveryMode()
    }
)


// ============================================================
// INITIAL SETUP
// ============================================================

// Robot and controller must use the same radio group.
radio.setGroup(17)

// Maximum radio transmission power.
radio.setTransmitPower(7)

// Maximum sound volume.
music.setVolume(255)

// Start immediately in running mode.
enterRunningMode()

// Begin moving immediately.
moveForward()


// ============================================================
// MAIN LOOP
// ============================================================

basic.forever(function () {
    if (
        robotRunning &&
        !deliveryMode &&
        !manualTurnActive
    ) {
        followBlackLine()

    } else if (
        !robotRunning ||
        deliveryMode
    ) {
        stopRobot()
    }

    basic.pause(10)
})
