var version = "0.8";

/*
 * Returns the version of this service.
 * Parameters: None
 */
var VersionCommandAssistant = function() {};
VersionCommandAssistant.prototype.run = function(future) {
	future.result = {version: version, success: true, instance: (new Date()).toString()};
};


var SendWoLCommandAssistant = function() {};
SendWoLCommandAssistant.prototype.run = function(future) {  
	var num_packets = 3;
	var macAddress = this.controller.args.macAddress;
	var port = this.controller.args.port || 9;
	var broadcastIP = this.controller.args.broadcastIP;

	try {
		var magic_packet = createMagicPacket(macAddress);
	} catch (err) {
		future.result = {success: false, error: err.message};
		return;
	}
	
	var dgram  = IMPORTS.require('dgram');
	var socket = dgram.createSocket('udp4');
	socket.setBroadcast(true);
	var packets_sent = 0;
	
	var handler = function(error) {
		if (error) {
			//future.result = {success: false, error: "Error here1"};
			socket.close();
			future.result = {success: false, error: error};
			return;
		} else if (packets_sent == num_packets) {
			socket.close();
			future.result = {success: true};
			return;
		} else {
			sendWoL();
		}
	}
	
	var sendWoL = function() {
		packets_sent += 1;
		socket.send(magic_packet, 0, magic_packet.length, port, broadcastIP, handler);
	}
	sendWoL();
};


/*
 * Parameters: macAddress
 */
var ValidateMACFormatCommandAssistant = function() {};
ValidateMACFormatCommandAssistant.prototype.run = function(future) {
	try {
		var buffer = createMagicPacket(this.controller.args.macAddress);
	} catch (err) {
		future.result = {valid: false, error: err};
		return;
	}
	
	future.result = {valid: true};
};


var createMagicPacket = function(macAddress) {
	if (macAddress == "")
		throw "MAC address is required.";
	
	var dgram  = IMPORTS.require('dgram');
  var buffer = IMPORTS.require('buffer').Buffer;
	
  var num_mac_octets = 6;
  if (macAddress.length == (2 * num_mac_octets + (num_mac_octets - 1))) {
    var sep = macAddress[2];
    macAddress = macAddress.replace(new RegExp(sep, 'g'), '');
  } else if (macAddress.length != (2 * num_mac_octets)) {
    throw "malformed MAC address '" + macAddress + "'";
  }

  var mac_buffer = new Buffer(num_mac_octets);
  for (var i = 0; i < num_mac_octets; ++i) {
    mac_buffer[i] = parseInt(macAddress.substr(2 * i, 2), 16);
  }

  var num_macs = 16;
  var buffer = new Buffer((1 + num_macs) * num_mac_octets);
  for (var i = 0; i < num_mac_octets; ++i) {
    buffer[i] = 0xff;
  }
  for (var i = 0; i < num_macs; ++i) {
    mac_buffer.copy(buffer, (i + 1) * num_mac_octets, 0, mac_buffer.length)
  }
  return buffer;
}
