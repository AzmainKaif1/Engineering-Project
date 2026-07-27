// ============================================================
// STATION A - DELIVERY CHECKPOINT
// 
// This station acts as a receptor/checkpoint.
// When the robot arrives:
// 1. Receives delivery message from robot
// 2. Acknowledges receipt (tells robot to continue)
// 3. Displays the delivery notification
// ============================================================


// -------------------- VARIABLES --------------------

let stationName = "A"
let deliveryReceived = false


// ============================================================
// RADIO SETUP
// ============================================================

// Must match the robot's group (17)
radio.setGroup(17)

// Display startup message
basic.showString("A")
basic.pause(500)
basic.clearScreen()


// ============================================================
// RECEIVE DELIVERY FROM ROBOT
// ============================================================

radio.onReceivedString(function (receivedString) {
    // Check if this message is for Station A
    if (receivedString == "DELIVER:A") {
        deliveryReceived = true
        
        // Display that delivery has arrived
        basic.showIcon(IconNames.Yes)
        basic.pause(500)
        
        // Send acknowledgment back to robot
        // This tells the robot: "I received it, continue your journey"
        radio.sendString("ACK:A")
        
        // Optional: show a notification tone
        music.playTone(Note.C, music.beat(BeatFraction.Quarter))
        
        basic.clearScreen()
        basic.showString("A")
    }
})


// ============================================================
// MAIN LOOP
// ============================================================

basic.forever(function () {
    // Station just waits for deliveries
    // No movement needed - it's stationary
    basic.pause(100)
})
