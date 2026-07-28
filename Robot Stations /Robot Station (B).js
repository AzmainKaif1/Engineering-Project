// ============================================================
// STATION B - DELIVERY CHECKPOINT
// ============================================================

let stationName = "B"
let deliveryReceived = false

radio.setGroup(17)

basic.showString("B")
basic.pause(500)
basic.clearScreen()
basic.showString("B")

radio.onReceivedString(function (receivedString) {

    if (receivedString == "CALL:B") {
        radio.sendString("READY:B")
    }

    if (receivedString == "ARRIVED:B") {
        deliveryReceived = true

        basic.showIcon(IconNames.Yes)
        basic.pause(500)

        radio.sendString("ACK:B")

        music.playTone(Note.C, music.beat(BeatFraction.Quarter))

        basic.clearScreen()
        basic.showString("B")
    }
})

basic.forever(function () {
    basic.pause(100)
})
