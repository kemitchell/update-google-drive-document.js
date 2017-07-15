module.exports = updateGoogleDriveDocument

var google = require('googleapis')
var DOCX = require('docx-content-type')
var drive = google.drive('v3')
var https = require('https')
var querystring = require('querystring')
var OAuth2 = google.auth.OAuth2

function updateGoogleDriveDocument (
  clientID, clientSecret, refreshToken, file, stream, callback
) {
  fetchAccessToken(
    clientID, clientSecret, refreshToken,
    function (error, accessToken) {
      if (error) {
        callback(error)
      } else {
        var auth = new OAuth2(clientID, clientSecret)
        auth.setCredentials({access_token: accessToken})
        var request = {
          auth: auth,
          fileId: file,
          resource: {
            mimeType: 'application/vnd.google-apps.document'
          },
          media: {
            mimeType: DOCX,
            body: stream
          }
        }
        drive.files.update(request, callback)
      }
    }
  )
}

/* eslint-disable */
// https://developers.google.com/identity/protocols/OAuth2WebServer?hl=en#refresh
/* eslint-enable */
function fetchAccessToken (
  clientID, clientSecret, refreshToken, callback
) {
  var parameters = {
    client_id: clientID,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  }
  var body = querystring.stringify(parameters)
  var request = {
    host: 'www.googleapis.com',
    path: '/oauth2/v4/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    }
  }
  https.request(request, function (response) {
    var buffers = []
    response
      .on('data', function (buffer) {
        buffers.push(buffer)
      })
      .on('end', function () {
        callback(null, JSON.parse(Buffer.concat(buffers)).access_token)
      })
  })
    .end(body)
}
