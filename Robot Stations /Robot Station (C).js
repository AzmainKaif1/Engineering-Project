// ============================================================
// STATION C - DELIVERY CHECKPOINT
// ============================================================

let stationName = "C"
let deliveryReceived = false

radio.setGroup(17)

basic.showString("C")
basic.pause(500)
basic.clearScreen()
basic.showString("C")

radio.onReceivedString(function (receivedString) {

    if (receivedString == "CALL:C") {
        radio.sendString("READY:C")
    }

    if (receivedString == "ARRIVED:C") {
        deliveryReceived = true

        basic.showIcon(IconNames.Yes)
        basic.pause(500)

        radio.sendString("ACK:C")

        music.playTone(Note.C, music.beat(BeatFraction.Quarter))

        basic.clearScreen()
        basic.showString("C")
    }
})

basic.forever(function () {
    basic.pause(100)
})
