
document.addEventListener("DOMContentLoaded", () => {

    var startVideoButton = document.querySelector("button#start_video");
    var stopVideoButton = document.querySelector("button#stop_video");
    var messageContainer = document.getElementById("message_container");




    // Retrieve the state from localStorage when the extension is loaded
    const recordingState = localStorage.getItem("recording");
    if (recordingState === "true") {
        startVideoButton.textContent = "";
        startVideoButton.style.display = "none"
        stopVideoButton.textContent = "Stop video";

    }
    else {
        stopVideoButton.style.display = "none"
    }

    function displayMessage(message, delay) {
        messageContainer.textContent = message;
        setTimeout(() => {
            messageContainer.textContent = "";
        }, delay);
    }

    startVideoButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "request_recording" }, function (response) {
                if (!chrome.runtime.lastError) {
                    console.log(response);

                    // Update the state in localStorage
                    localStorage.setItem("recording", "true");

                    // Display a persistent message for 3 seconds
                    displayMessage("Recording started!", 3000);
                    startVideoButton.textContent = "";
                    startVideoButton.style.display = "none"
                    stopVideoButton.textContent = "Stop video";
                } else {
                    console.log(chrome.runtime.lastError, 'error line 14');
                }
            });
        });
    });

    stopVideoButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "stopvideo" }, function (response) {
                if (!chrome.runtime.lastError) {
                    console.log(response);

                    // Update the state in localStorage
                    localStorage.setItem("recording", "false");

                    // Display a persistent message for 3 seconds
                    displayMessage("Recording stopped!", 3000);
                    startVideoButton.textContent = "Start video";
                    stopVideoButton.textContent = "";
                    stopVideoButton.style.display = "none"
                } else {
                    console.log(chrome.runtime.lastError, 'error line 27');
                }
            });
        });
    });
});
