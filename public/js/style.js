function copyText(t) {
  const e = `http://localhost:3000/r/${t}`;
  navigator.clipboard.writeText(e).then(
    function () {
      alert("Copying to clipboard was successful!");
    },
    function (t) {
      alert("Could not copy text: ", t);
    }
  );
}

setTimeout(() => {
  let tempDiv = document.querySelector(".temp-div");
  if (tempDiv) {
    tempDiv.style.display = "none";
  }
}, 4500);

if (document.querySelector(".hide-after")) {
  document.querySelector(".hide-after").addEventListener("click", () => {
    setTimeout(() => {
      document.querySelector(".link-alert").style.display = "none";
    }, 1000);
  });
}

console.log("STYLE.JS IS LOADED");
