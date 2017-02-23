'use strict'

var assert = require('assert')
var Client = require('../')
var cl = new Client('u381541-3214c5ff8dc71a56cfca9ed7')

newTest()

var exampleMonitorId

function newTest() {
	cl.newMonitor({
		friendly_name: "example",
		url: "http://example.com"
	}, function(error, response) {
		if (error) {
			console.log("Creating monitor example.com failed: " + error.code)
			if (error.code == 'already_exists') {
				console.log("Monitor exmaple.com already exists, no biggie")
				console.log("newMonitor: pass")
				findMonitorId('example', function(){
					editTest()
				})
				
			} else {
				console.log('newMonitor: fail', error)
			}
		} else {
			console.log("newMonitor: pass")
			findMonitorId('example', function(){
				editTest()
			})
		}
	})
}

function findMonitorId(name, callback) {
	cl.getMonitors({ logs: true }, function(err, monitors) {
		for (var i = 0; i < monitors.length; i++) {
			if (monitors[i].friendly_name == name ){
				exampleMonitorId = monitors[i].id
				break
			}
		}
		callback()
	})
}

function editTest() {
	cl.editMonitor({
		id: exampleMonitorId,
		friendly_name: 'example'
	}, function(error, response ) {
		if (error) {
			console.log('editMonitor: fail', error.code)
		} else {
			console.log('editMonitor: pass')
			deleteTest() 
		}
	})

}

function deleteTest() {		
	cl.deleteMonitor(exampleMonitorId, function(error, response) {
		if (error) {
			console.log("Deleting monitor example.com failed: " + error.name)
			console.log('deleteMonitor: fail', error)
		} else {
			console.log('deleteMonitor: pass')
		}
	})
}