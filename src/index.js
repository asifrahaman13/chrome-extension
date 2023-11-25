console.log("Injection is done.");
const config = require("./config.js");

var AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const awsAccessKeyId = config.awsAccessKeyId;
const awsSecretAccessKey = config.awsSecretAccessKey;
const s3BucketName = config.s3BucketName;

AWS.config.update({
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
});

const s3 = new AWS.S3();

var recorder = null;
var chunks = [];
var isRecording = false;

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = function () {
  
    stream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    recorder = null;
    isRecording = false;

    chunks.forEach((chunk, index) => {
      uploadToS3(chunk, index);
    });

    chunks = [];
    
  };

  isRecording = true;
  recorder.start();
}

function uploadToS3(chunk, index) {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const timestampInSeconds = Math.floor(timestamp / 1000);
  const newUuid = uuidv4();
  const params = {
    Bucket: s3BucketName,
    Key: `screen-recording-part-${timestampInSeconds}-${newUuid}.webm`,
    Body: chunk,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(`Error uploading part ${index} to S3:`, err);
    } else {
      console.log(`Part ${index} uploaded to S3:`, data.Location);
    }
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "request_recording" && !isRecording) {
    console.log("requesting recording");
    sendResponse(`processed: ${message.action}`);

    try {
      const microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const combinedStream = new MediaStream();
      combinedStream.addTrack(screenStream.getVideoTracks()[0]);
      combinedStream.addTrack(microphoneStream.getAudioTracks()[0]);

      onAccessApproved(combinedStream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }

  if (message.action === "stopvideo" && isRecording) {
    console.log("stopping video");
    sendResponse(`processed: ${message.action}`);
    recorder.stop();
  }
});
