// declare our dependencies
var crypto = require('crypto-js');
var https = require('https');
var xml = require('xml2js');

main();

// split the code into a main function
function main() {
  // this serviceList is unused right now, but may be used in future
  const serviceList = [
    'dynamodb',
    'ec2',
    'sqs',
    'sns',
    's3'
  ];

  // our variables
  var access_key = 'AKIAJ7K3XP4M4MW2B2FA';
  var secret_key = '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';
  var region = 'us-west-2';
  var url = 'a2oxjrmrtmst02.iot.us-west-2.amazonaws.com';
  var myService = 'iotdata';
  var myMethod = 'GET';
  var myPath = '/things/PhuongESP32/shadow';

  // get the various date formats needed to form our request
  var amzDate = getAmzDate(new Date().toISOString());
  var authDate = amzDate.split("T")[0];

  // we have an empty payload here because it is a GET request
  var payload = '';
  // get the SHA256 hash value for our payload
  var hashedPayload = crypto.SHA256(payload).toString();

  // create our canonical request
  var canonicalReq = myMethod + '\n' +
    myPath + '\n' +
    '\n' +
    'host:' + url + '\n' +
    'x-amz-content-sha256:' + hashedPayload + '\n' +
    'x-amz-date:' + amzDate + '\n' +
    '\n' +
    'host;x-amz-content-sha256;x-amz-date' + '\n' +
    hashedPayload;

  // hash the canonical request
  var canonicalReqHash = crypto.SHA256(canonicalReq).toString();

  // form our String-to-Sign
  var stringToSign = 'AWS4-HMAC-SHA256\n' +
    amzDate + '\n' +
    authDate + '/' + region + '/' + myService + '/aws4_request\n' +
    canonicalReqHash;

  // get our Signing Key
  var signingKey = getSignatureKey(crypto, secret_key, authDate, region, myService);

  // Sign our String-to-Sign with our Signing Key
  var authKey = crypto.HmacSHA256(stringToSign, signingKey);

  // Form our authorization header
  var authString = 'AWS4-HMAC-SHA256 ' +
    'Credential=' +
    access_key + '/' +
    authDate + '/' +
    region + '/' +
    myService + '/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=' + authKey;

  console.log(amzDate);
  console.log(authString);

  // throw our headers together
  headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': authString,
    'Host': url,
    'x-amz-date': amzDate,
    //'x-amz-content-sha256' : hashedPayload
  };


  // call our function
  performRequest(url, myPath, headers, payload, function (response) {
    console.log(response);
  });
};

// this function gets the Signature Key, see AWS documentation for more details, this was taken from the AWS samples site
function getSignatureKey(Crypto, key, dateStamp, regionName, serviceName) {
  var kDate = Crypto.HmacSHA256(dateStamp, "AWS4" + key);
  var kRegion = Crypto.HmacSHA256(regionName, kDate);
  var kService = Crypto.HmacSHA256(serviceName, kRegion);
  var kSigning = Crypto.HmacSHA256("aws4_request", kService);
  return kSigning;
}

// this function converts the generic JS ISO8601 date format to the specific format the AWS API wants
function getAmzDate(dateStr) {
  var chars = [":", "-"];
  for (var i = 0; i < chars.length; i++) {
    while (dateStr.indexOf(chars[i]) != -1) {
      dateStr = dateStr.replace(chars[i], "");
    }
  }
  dateStr = dateStr.split(".")[0] + "Z";
  return dateStr;
}

// the REST API call using the Node.js 'https' module
function performRequest(endpoint, path, headers, data, success) {

  var dataString = data;

  var options = {
    host: endpoint,
    port: 443,
    path: path,
    method: 'GET',
    headers: headers
  };

  var req = https.request(options, function (res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function (data) {
      responseString += data;
    });

    res.on('end', function () {
      //console.log(responseString);
      success(responseString);
    });
  });

  req.write(dataString);
  req.end();
}