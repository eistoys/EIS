document.addEventListener("DOMContentLoaded", (event) => {
  // Select the element with the ID 'remix'
  const remixElement = document.getElementById("remix");

  // Check if the element exists
  if (remixElement) {
    // Add a click event listener to the element
    remixElement.addEventListener("click", () => {
      // Your code to handle the click event goes here
      window.parent.postMessage("remix");
      // You can perform any action here, such as redirecting to another page, changing the content, etc.
    });
  } else {
    console.log('Element with ID "remix" not found.');
  }
});

window.addEventListener("message", (event) => {
  if (event.data === "close") {
    $("#menu_bar").toggleClass("active");
    $(".menu").removeClass("open");
  }
});
