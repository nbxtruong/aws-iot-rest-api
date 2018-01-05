var https = require('https');

main();

function main() {
    var host = 'a2oxjrmrtmst02.iot.us-west-2.amazonaws.com';
    var xAmzData = '20180104T042201Z';
    var authorization = 'AWS4-HMAC-SHA256 Credential=AKIAJ7K3XP4M4MW2B2FA/20180104/us-west-2/iotdata/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-date, Signature=67c5af703221792ba37f4c522e06ef716805d6253dd6ccf01d30c62b026d8552';
    var clientId = 'TruongESP32';
    var payload = '';

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': host,
        'Content-Length': 82,
        'x-amz-date': xAmzData,
        'Authorization': authorization
    };

    performRequest(host, headers, payload, clientId, function (response) {
        console.log(JSON.parse(response));
    });
};

function performRequest(host, headers, payload, clientId, success) {

    var dataString = payload;

    var body = {
        'state': {
            'desired': {
                'welcome': 1
            }
        }
    }

    var options = {
        host: host,
        port: 443,
        method: 'POST',
        body: body,
        headers: headers,
        path: '/things/' + clientId + '/shadow',
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            success(responseString);
        });
    });

    req.write(dataString);
    req.end();
}