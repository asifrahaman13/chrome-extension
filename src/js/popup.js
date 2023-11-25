document.addEventListener("DOMContentLoaded", () => {
    // GET THE SELECTORS OF THE BUTTONS
    const startVideoButton = document.querySelector("button#start_video");
    const stopVideoButton = document.querySelector("button#stop_video");
    const messageContainer = document.getElementById("message_container");

    // Add a message to the container
                    messageContainer.innerHTML = "Recording started!";

    // adding event listeners
    startVideoButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "request_recording" }, function (response) {
                if (!chrome.runtime.lastError) {
                    console.log(response);

                    // Add a message to the container
                    messageContainer.innerHTML = "Recording started!";
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

                    // Clear the message when stopping the video
                    messageContainer.textContent = "";
                } else {
                    console.log(chrome.runtime.lastError, 'error line 27');
                }
            });
        });
    });
});
