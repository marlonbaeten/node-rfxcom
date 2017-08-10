/**
 * Created by max on 11/07/2017.
 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling
 */
class Thermostat3 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat3";
    };

/*
 * Extracts the device id.
 *
 */
    _splitDeviceId(deviceId) {
        let id = {};
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
        id = RfxCom.stringToBytes(parts[0], 3);
        if (id.value < 0 ||
            (this.isSubtype('G6R_H4T1') && id.value > 0xff) ||
            (this.isSubtype(['G6R_H4TB', 'G6R_H4S']) && id.value > 0x3ffff) ||
            (this.isSubtype('G6R_H4TD') && id.value > 0xffff)) {
            throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.nextMessageSequenceNumber(),
            buffer = [0x08, defines.THERMOSTAT3, self.subtype, seqnbr,
                device.idBytes[0], device.idBytes[1], device.idBytes[2], command, 0];
        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    };

    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    }

    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    }

    switchOn2(deviceId, callback) {
        if (this.isSubtype('G6R_H4TB')) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support switchOn2()");
        }
    }

    switchOff2(deviceId, callback) {
        if (this.isSubtype('G6R_H4TB')) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else {
            throw new Error("Device does not support switchOff2()");
        }
    }

    up(deviceId, callback) {
        return this._sendCommand(deviceId, 0x02, callback);
    }

    down(deviceId, callback) {
        return this._sendCommand(deviceId, 0x03, callback);
    }

    runUp(deviceId, callback) {
        if (this.isSubtype('G6R_H4T1')) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else {
            throw new Error("Device does not support runUp()");
        }
    }

    runDown(deviceId, callback) {
        if (this.isSubtype('G6R_H4T1')) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support runDown()");
        }
    }

    stop(deviceId, callback) {
        if (this.isSubtype('G6R_H4T1')) {
            return this._sendCommand(deviceId, 0x06, callback);
        } else {
            throw new Error("Device does not support stop()");
        }
    }

}

module.exports = Thermostat3;