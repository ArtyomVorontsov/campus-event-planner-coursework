const arrow = document.getElementById("myImage");
let x = 0;
document.getElementById("move").addEventListener("click", () => {
  x = Math.min(
    x + 10,
    document.getElementById("track").clientWidth - arrow.clientWidth - 24,
  );
  arrow.style.left = x + "px";
});
document.getElementById("reset").addEventListener("click", () => {
  x = 0;
  arrow.style.left = "0px";
});
document.getElementById("subscribe").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("feedback").textContent =
    "Demo subscription received. No email was sent.";
});
