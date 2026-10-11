const params = new URLSearchParams(location.search);
if (params.has("name"))
  document.getElementById("result").textContent =
    "Received GET submission for " + params.get("name");
document.getElementById("locate").addEventListener("click", () => {
  const out = document.getElementById("location");
  if (!navigator.geolocation) {
    out.textContent = "Geolocation unavailable";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (p) =>
      (out.textContent =
        "Latitude " +
        p.coords.latitude.toFixed(4) +
        ", longitude " +
        p.coords.longitude.toFixed(4)),
    (e) => (out.textContent = "Location unavailable: " + e.message),
    { timeout: 10000, maximumAge: 60000 },
  );
});
function allowDrop(e) {
  e.preventDefault();
}
function drag(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}
function drop(e) {
  e.preventDefault();
  if (e.dataTransfer.getData("text/plain") === "item")
    e.currentTarget.append(document.getElementById("item"));
}
document.getElementById("item").addEventListener("dragstart", drag);
for (const id of ["source", "target"]) {
  const z = document.getElementById(id);
  z.addEventListener("dragover", allowDrop);
  z.addEventListener("drop", drop);
}
document
  .getElementById("move-card")
  .addEventListener("click", () =>
    document.getElementById("target").append(document.getElementById("item")),
  );
const draft = document.getElementById("draft");
try {
  draft.value = localStorage.getItem("workbook-note") || "";
  draft.addEventListener("input", () =>
    localStorage.setItem("workbook-note", draft.value),
  );
} catch {}
