        // JavaScript function to toggle the mobile menu
        function toggleMenu() {
            var navMenu = document.getElementById('navMenu');
            navMenu.classList.toggle('active');
        }

  // Function to load and insert header
  function loadContent() {
    fetch('../views/layout/header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header').innerHTML = data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
loadContent();

function loadFooter() {
    fetch('/views/layout/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header').innerHTML = data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}
loadFooter();


document.addEventListener("DOMContentLoaded", function() {
  const toggleBtn = document.getElementById("toggle-btn");
  const navbarCenter = document.getElementById("navbar-center");
  const navbarRight = document.getElementById("navbar-right");

  toggleBtn.addEventListener("click", function() {
    navbarCenter.classList.toggle("show");
    navbarRight.classList.toggle("show");
  });
});
