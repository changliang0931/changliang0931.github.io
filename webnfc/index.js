const terminal = document.getElementById("terminal");
const scanButton = document.getElementById("scanButton");
const writeButton = document.getElementById("writeButton");
const makeReadOnlyButton = document.getElementById("makeReadOnlyButton");
const cleanLog = document.getElementById('cleanLog');
//*************************************
hterm.defaultStorage = new lib.Storage.Local();
let t = new hterm.Terminal();
t.onTerminalReady = () => {
    console.log('Terminal ready.');
};
t.decorate(terminal);
t.setHeight(24);
t.installKeyboard();
t.io.println('');
t.io.println('********************************');
t.io.println('* 请先【扫描】设备 *');
t.io.println('* 输入写入信息 *');
t.io.println('* 点击【写入】 *');
t.io.println('********************************');
t.io.println('');
t.onLog = data => {
    t.io.println('devices log : ' + new Date().getTime() + ' ' + data);
};
t.onError = error => {
    t.io.println('devices error : ' + new Date().getTime() + ' ' + error);
};

//*************************************
scanButton.addEventListener("click", async () => {
    console.log("User clicked scan button");
    try {
        const ndef = new NDEFReader();
        await ndef.scan();
        t.onLog("> Scan started");
        ndef.addEventListener("readingerror", () => {
            t.onLog("Argh! Cannot read data from the NFC tag. Try another one?");
        });

        ndef.addEventListener("reading", ({ message, serialNumber }) => {
            t.onLog(`> Serial Number: ${serialNumber}`);
            t.onLog(`> Records: (${message.records.length})`);
            t.onLog(`> Record: (${message.records[0].recordType})`);
             t.onLog(`> Record: (${JSON.stringify(message.records)})`);
        });
    } catch (error) {
        t.onError("Argh! " + error);
    }
});

writeButton.addEventListener("click", async () => {
    console.log("User clicked write button");
    try {
        const message = document.getElementById("message");
        const ndef = new NDEFReader();
        await ndef.write(message.value);
        t.onLog(`> Message written :${message.value}`);
    } catch (error) {
        t.onError("Argh! " + error);
    }
});

makeReadOnlyButton.addEventListener("click", async () => {
    console.log("User clicked make read-only button");
    try {
        const ndef = new NDEFReader();
        await ndef.makeReadOnly();
        t.onLog("> NFC tag has been made permanently read-only");
    } catch (error) {
        t.onError("Argh! " + error);
    }
});

getAddressButton.addEventListener("click", async () => {
    try {
        const action = new Uint8Array(1);
        action[0] = 0x03;
        const ndef = new NDEFReader();

        ndef.addEventListener("reading", ({ message, serialNumber }) => {
            for (let record of message.records) {
                t.onLog(`> Record: (${JSON.stringify(record)})`);
                t.onLog(`> Record:`)
                t.onLog(`>   type: ${record.recordType}`)
                t.onLog(`>   id: ${record.id}`)
                t.onLog(`>   id: ${record.data}`)
            }
        });

        await ndef.scan();
        await ndef.write( { records: [
        {
            recordType: "com:ftsafe:ibc:nft",
            data: action.buffer,
        },
        ]});
        await ndef.scan();
    } catch (error) {
        t.onError("Argh! " + error);
    }
})

cleanLog.addEventListener('click', () => {
    t.clear();
    t.reset();
});
