const request = require("request")

const base = 'https://api.uptimerobot.com/v2/'

module.exports = Robot
function Robot(key){
	if (key === '' || typeof key !== 'string') {
		throw new Error('Uptime Robot API Key must be provided')
	}
	this.key = key
	this.request = function(method, options, callback) {
		options.api_key = this.key
		options.format = 'json'
		request({
			method: 'POST',
			url: base + method, 
			headers: { 'cache-control': 'no-cache', 'content-type': 'application/x-www-form-urlencoded' },
			form: options
		}, function(error, response, body) {
			body = JSON.parse(body)
			if (error || body.stat === 'fail') {
				callback(makeError(body), body)
			} else {
				callback(error, body)
			}
		})
	}
}

function makeError(response) {
	let err = new Error(response.error.message)
	err.name = 'UptimeRobotServerError'
	err.code = response.error.type
	return err
}

Robot.prototype.getMonitors = function (options, callback) {
	if (typeof options === 'function') {
		callback = options
		options = {}
	}
	options = options || {}

	if (!options.logs && options.alertContacts) throw new Error('Logs is required if alert contacts is true.')
	if (options.monitors) options.monitors = normaliseArray(options.monitors)
	if (options.customUptimeRatio) options.customUptimeRatio = normaliseArray(options.customUptimeRatio)
	if (options.logs) options.logs = '1'
	if (options.alertContacts) options.alertContacts = '1'
	if (options.showMonitorAlertConcats) options.showMonitorAlertConcats = '1'
	if (options.showTimezone) options.showTimezone = '1'
	if (options.responseTimes) options.responseTimes  = '1'

	this.request('getMonitors', options, function(error, response) {
		let monitors = response.monitors
		monitors.forEach(function (monitor) {
			if (monitor.custom_uptime_ratio) monitor.custom_uptime_ratio = monitor.custom_uptime_ratio.split('-')
			else monitor.custom_uptime_ratio = []
			if (monitor.logs) {
				monitor.logs.forEach(function (log) {
					log.datetime = new Date(log.datetime)
				})
			}
		})
		callback(error, monitors)
	})
}

Robot.prototype.newMonitor = function (options, callback) {
	if (!options.friendly_name) throw new Error('friendly_name is required')
	if (!options.url) throw new Error('url is required')
	options.type = options.type || '1'
	options.alert_contacts = normaliseArray(options.alert_contacts)
	options.mwindows = normaliseArray(options.mwindows)

	this.request('newMonitor', options, function(error, response) {
		callback(error, response)
	})
}

Robot.prototype.editMonitor = function (options, callback) {
	if (!options.id) throw new Error('Monitor id is required')
	options.alert_contacts = normaliseArray(options.alert_contacts)
	options.mwindows = normaliseArray(options.mwindows)

	this.request('editMonitor', options, function(error, response) {
		callback(error, response)
	})
}

Robot.prototype.deleteMonitor = function (id, callback) {
	this.request('deleteMonitor', { id: id }, function(error, response) {
		callback(error, response)
	})
}

Robot.prototype.resetMonitor = function (id, callback) {
	this.request('resetMonitor', { id: id }, function(error, response) {
		callback(error, response)
	})
}

Robot.prototype.getAlertContacts = function (options, callback) {
	if (typeof options === 'function') {
		callback = options
		options = {}
	}
	options = options || {}
	if (options.alert_contacts) options.alert_contacts = normaliseArray(options.alert_contacts)
	if (options.offset) options.offset = options.offset
	if (options.limit) options.limit = options.limit

	this.request('getAlertContacts', options, function(error, response) {
		callback(error, response)
	})
}

function normaliseArray(arr) {
	return (arr || []).join('-')
}