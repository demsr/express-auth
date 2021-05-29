document.getElementById("btn-toggle-nav").addEventListener("click", () => {
  let mobileNav = document.getElementById("mobile-menu");
  mobileNav.classList.toggle("hidden");
});
document.getElementById("btn-profile-menu").addEventListener("click", () => {
  let profileMenu = document.getElementById("profile-menu");
  profileMenu.classList.toggle("hidden");
});
