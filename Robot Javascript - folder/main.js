function search_right() {
    // pivots right to find line
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, SEARCH_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, SEARCH_SPEED)
}
function turn_left() {
    // stop the left wheel and move the right wheel
    maqueen.motorStop(maqueen.Motors.M1)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, TURN_SPEED)
}
function forward() {
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, FORWARD_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, FORWARD_SPEED)
}
function turn_right() {
    // move left wheel and stop the right wheel
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, TURN_SPEED)
    maqueen.motorStop(maqueen.Motors.M2)
}
function search_left() {
    // slowly pivots left to find the line
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, SEARCH_SPEED)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, SEARCH_SPEED)
}
let right = 0
// reading from the right sensor
let left = 0
// reading from the left sensor
let SEARCH_SPEED = 0
let TURN_SPEED = 0
let FORWARD_SPEED = 0
FORWARD_SPEED = 42
TURN_SPEED = 55
SEARCH_SPEED = 28
// -1 = the line was last seen on the left
// 1 = the line was last seen on the right
let last_direction = 1
// if it loses direction it just goes where it last saw the line
basic.forever(function () {
    left = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    right = maqueen.readPatrol(maqueen.Patrol.PatrolRight)
    // 0 = black line
    // 1 = lighter surface
    if (left == 0 && right == 0) {
        // both sensors detect the line
        forward()
    } else if (left == 0 && right == 1) {
        // line is underneath the left sensor
        last_direction = -1
        turn_left()
    } else if (left == 1 && right == 0) {
        // line is underneath the right sensor
        last_direction = 1
        turn_right()
    } else {
        // neither sensor detects black
        if (last_direction == -1) {
            // the line was last seen on the left
            search_left()
        } else {
            // the line was last seen on the right
            search_right()
        }
    }
    basic.pause(5)
})
