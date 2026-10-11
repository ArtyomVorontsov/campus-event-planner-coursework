$(function () {
  let actions = 0;
  function log(label) {
    $("#status").text(label + " — action " + ++actions);
  }
  $("#toggle").on("click", function () {
    $("#article").stop(true, true).toggle();
    log("Toggle");
  });
  $("#fade").on("click", function () {
    $("#article").stop(true, true).fadeToggle(400);
    log("Fade");
  });
  $("#slide").on("click", function () {
    $("#article").stop(true, true).slideToggle(400);
    log("Slide");
  });
  $("#animate").on("click", function () {
    $("#card")
      .stop(true, true)
      .css({ left: 0, opacity: 1 })
      .animate({ left: 140, opacity: 0.5 }, 600)
      .animate({ left: 0, opacity: 1 }, 600);
    log("Animation");
  });
});
