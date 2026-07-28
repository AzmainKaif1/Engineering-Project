// ============================================================
// STATION D - DELIVERY CHECKPOINT
// ============================================================

let stationName = "D"
let deliveryReceived = false

radio.setGroup(17)

basic.showString("D")
basic.pause(500)
basic.clearScreen()
basic.showString("D")

radio.onReceivedString(function (receivedString) {

    if (receivedString == "CALL:D") {
        radio.sendString("READY:D")
    }

    if (receivedString == "ARRIVED:D") {
        deliveryReceived = true

        basic.showIcon(IconNames.Yes)
        basic.pause(500)

        radio.sendString("ACK:D")

        music.playTone(Note.C, music.beat(BeatFraction.Quarter))

        basic.clearScreen()
        basic.showString("D")
    }
})

basic.forever(function () {
    basic.pause(100)
})
