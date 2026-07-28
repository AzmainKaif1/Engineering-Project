// ============================================================
// STATION A - DELIVERY CHECKPOINT
// ============================================================

let stationName = "A"
let deliveryReceived = false

radio.setGroup(17)

basic.showString("A")
basic.pause(500)
basic.clearScreen()
basic.showString("A")

radio.onReceivedString(function (receivedString) {

    // Robot is checking if this station is powered on and ready.
    if (receivedString == "CALL:A") {
        radio.sendString("READY:A")
    }

    // Robot has physically arrived at Station A.
    if (receivedString == "ARRIVED:A") {
        deliveryReceived = true

        basic.showIcon(IconNames.Yes)
        basic.pause(500)

        // Tell the robot it can turn around and head back.
        radio.sendString("ACK:A")

        music.playTone(Note.C, music.beat(BeatFraction.Quarter))

        basic.clearScreen()
        basic.showString("A")
    }
})

basic.forever(function () {
    basic.pause(100)
})
