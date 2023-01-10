// Using chrome, edge or any distribution of chromium
var port, textEncoder, writableStreamClosed, writer, historyIndex = -1;
const lineHistory = [];
async function connectSerial() {
    try {
        const filters = [
            { usbVendorId: 0x10c4 }
        ];
        // Prompt user to select any serial port.
        port = await navigator.serial.requestPort({ filters });
        await port.open({ baudRate: 9600 });
        let settings = {};

        if (localStorage.dtrOn == "true") settings.dataTerminalReady = true;
        if (localStorage.rtsOn == "true") settings.requestToSend = true;
        if (Object.keys(settings).length > 0) await port.setSignals(settings);

        
        textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        writer = textEncoder.writable.getWriter();
        await listenToPort();
    } catch (e){
        alert("Serial Connection Failed" + e);
    }
}

async function listenToPort() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    
    // Listen to data coming from the serial device.
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            console.log('[readLoop] DONE', done);
            reader.releaseLock();
            break;
        }
        // value is a string.
        // console.log(value);
    }
}

async function sendSerialLine(dataToSend) {
    await writer.write(dataToSend);
    if (dataToSend.trim().startsWith('\x03')) echo(false);
}

async function callToNumber(phoneNumber) {
    await sendSerialLine('ATD' + phoneNumber + ';\r\n');
}

async function hangOut() {
    await sendSerialLine('ATH\r\n');
}