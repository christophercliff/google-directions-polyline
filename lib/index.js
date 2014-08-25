var _ = require('underscore')
var assert = require('assert')
var polyline = require('polyline')
var Promise = require('bluebird')
var qs = require('querystring').stringify
var Wreck = require('wreck')

var BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'
var LEGS_PER_REQUEST = 9
var REQUESTS_PER_PERIOD = 10
var PERIOD_DURATION = 1e3
var COORDINATE_DELIMITER = ','
var POINT_DELIMITER = '|'

module.exports = Client

function Client(options) {
    assert(_.isString(options.key))
    this.key = options.key
}

_.extend(Client.prototype, {

    getPolylines: function (bounds) {
        var groups = this.getRequestGroups(bounds)
        return Promise
            .reduce(groups, function(total, requests){
                return Promise.all(_.map(requests, get))
                    .delay(PERIOD_DURATION)
                    .then(function(responses){
                        return total.concat(responses)
                    })
            }, [])
            .then(toPolylines)
    },

    getGeoJSON: function (bounds) {
        return this.getPolylines(bounds)
            .then(toGeoJSON)
    },

    getRequestGroups: function (bounds) {
        return _.chain(bounds)
            .groupBy(function(url, i){
                return Math.floor(i/LEGS_PER_REQUEST)
            })
            .toArray()
            .map(function(legs){
                var points = _.chain(legs)
                    .reduce(function(total, n){
                        return total.concat(n)
                    }, [])
                    .unique(function(n){
                        return '' + n[0] + n[1]
                    })
                    .value()
                return [
                    BASE_URL,
                    qs({
                        origin: points.shift().join(COORDINATE_DELIMITER),
                        destination: points.pop().join(COORDINATE_DELIMITER),
                        waypoints: _.map(points, function(point){ return point.join(COORDINATE_DELIMITER) }).join(POINT_DELIMITER),
                        key: this.key
                    })
                ].join('?')
            }, this)
            .groupBy(function(url, i){
                return Math.floor(i/REQUESTS_PER_PERIOD)
            })
            .toArray()
            .value()
    }

})

_.extend(Client, {

    create: function (options) {
        return new Client(options)
    }

})



function get(url) {
    return new Promise(function(resolve, reject){
        Wreck.get(url, function(err, res, body){
            if (err) return reject(err)
            return resolve(JSON.parse(body))
        })
    })
}

function toPolylines(responses) {
    return _.chain(responses)
        .map(function(response){
            if (_.isString(response.error_message)) throw new Error(response.error_message)
            return response.routes
        })
        .flatten()
        .map(function(route){
            return route.legs
        })
        .flatten()
        .map(function(leg){
            return _.chain(leg.steps)
                .reduce(function(total, step){
                    return total.concat(polyline.decode(step.polyline.points))
                }, [])
                .map(function(coordinate){
                    return coordinate.reverse()
                })
                .value()
        })
        .value()
}

function toGeoJSON(polylines) {
    return {
        type: 'FeatureCollection',
        properties: {},
        features: _.chain(polylines)
            .map(function(polyline){
                return {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: polyline
                    }
                }
            })
            .value()
    }
}
