# google-directions-polyline

[![Build Status](https://travis-ci.org/christophercliff/google-directions-polyline.png?branch=master)](https://travis-ci.org/christophercliff/google-directions-polyline)

A client for bulk querying polylines from the [Google Directions API][google]. The client optimizes queries by retrieving up to nine polylines per request and throttling requests to meet rate limits.

## Usage

```js
var client = require('google-directions-polyline').create({
    key: 'YOUR_KEY'
})
var bounds = [
    [ origin1, destination1 ],
    [ origin2, destination2 ],
    // ...
    [ originN, destinationN ]
]

client.getPolylines(bounds)
    .then(function(polylines){

    })

// or...

client.getGeoJSON(bounds)
    .then(function(featureCollection){

    })
```

Where `origin` and `destination` have the form `[ lat, lon ]`.

## Installation

```
$ npm install google-directions-polyline
```

## License

MIT, see [LICENSE][license] for details.

[google]: https://developers.google.com/maps/documentation/directions/
[license]: https://github.com/christophercliff/google-directions-polyline/blob/master/LICENSE.md
