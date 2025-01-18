function showCustomAlert(message) {
    let alertContainer = document.createElement("div");
    alertContainer.classList.add("custom-alert");
  
    let alertMessage = document.createElement("p");
    alertMessage.textContent = message;
  
    let closeButton = document.createElement("button");
    closeButton.textContent = "OK";
    closeButton.classList.add("custom-alert-close-btn");
    closeButton.addEventListener("click", function () {
      document.body.removeChild(alertContainer);
    });
  
    alertContainer.appendChild(alertMessage);
    alertContainer.appendChild(closeButton);
    document.body.appendChild(alertContainer);
  }
  