var mockData = require("../mock.json");
var aws = require('../aws/aws.js');
var docean = require('../do/do.js');
require('../models/reservation');
require('../models/template');
var mongoose = require('mongoose');
var Reservation = mongoose.model('Reservation');
var Template = mongoose.model('Template');

function validate(msg) {
    if(Number(msg.VCPUs) < 0 || Number(msg.VRAM) < 0 || Number(msg.Storage) < 0 || Number(msg.NodeCount) < 0 || Number(msg.Count) < 0) {
        return false;
    }
    return true;
}

exports.post_reservations = function(req, res) {
	//var userId = req.params.userId;
    console.log("POST request Received : ")
    console.log(req.body);
    // TODO: CHECK THE TYPE OF REQUEST AND CALL APPROPRIATE AWS METHOD
    aws.create_vm(req, res);
    //docean.create_vm(req, res)
}

exports.delete_reservation = function(req, res) {
    var ReservationId = req.params.ReservationId;
    console.log(ReservationId);
    aws.terminate_vm(req, res);
    //docean.terminate_vm(req, res);
}

exports.get_reservations = function(req, res) {
	//console.log(mockData);
	var userId = req.params.UserId;

    var reservationIds = [];
    
    Reservation.find({"UserId" : userId}, function(err, results) {
        if(err) {
            return res.send({"status": 500, "message": "Internal Server Error"});
        } else {

            console.log(results);
            if(results.length == 0) {
                console.log("Could not find reservation for this user from database", err);
                return res.send({"status": 400, "data": "You don't have any reservation at this moment"});
            }

            var k=1
            for(i in results) {

                if (results[i].Cloud == "aws") {
                    var details = "" + k + ". Reservation ID: *" + results[i].Reservation.ReservationId + "*";
                    k=k+1;

                    var vmConfig =results[i].Request;

                    details += "\n> _(" + vmConfig.OS + ", " + vmConfig.VCPUs + "vCPUs, " + vmConfig.VRAM + "GB RAM, " + 
                               vmConfig.Storage + "GB " + vmConfig.StorageType + ")_ *x" + results[i].Reservation.Instances.length + "*";

                    for (var j = 0; j < results[i].Reservation.Instances.length; j++) {
                        details += "\n>" + results[i].Reservation.Instances[j].PublicIpAddress;
                        console.log(details);
                    }
                    
                    reservationIds.push(details);
                } 
                else if (results[i].Cloud == "do") {
                    //var res = results[i].Reservation.droplet;
                    console.log("---------------");
                    var droplet = results[i].Reservation.droplet;
                    console.log(results[i].Reservation.droplet);
                    console.log("---------------");

                    console.log("\n> _(" + droplet.image.distribution + droplet.image.name + 
                                        ", " + droplet.size.vcpus  + "vCPUs, " + droplet.size.slug + " RAM, " +
                                        droplet.size.disk + "GB SSD" + ")_ *x1*");

                    for (var j = 0; j < droplet.networks.v4.length; j++) {
                        details += "\n>" + droplet.networks.v4[0].ip_address;
                        console.log(details);
                    }

                    reservationIds.push(details);
                }
            }
            return res.send({"status": 200, "data": reservationIds.join("\n\n")});
            
        }
    });
    
}
