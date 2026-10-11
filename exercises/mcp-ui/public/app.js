let tools = [];
const $ = (id) => document.getElementById(id);
function render() {
  const q = $("filter").value.toLowerCase();
  $("tools").replaceChildren(
    ...tools
      .filter((t) => t.name.toLowerCase().includes(q))
      .map((t) => {
        const li = document.createElement("li");
        li.textContent = t.name + " — " + t.description;
        return li;
      }),
  );
}
async function refresh() {
  try {
    const r = await fetch("/api/tools");
    if (!r.ok) throw Error();
    tools = (await r.json()).tools;
    render();
  } catch {
    $("result").textContent = "Cannot load MCP tools.";
  }
}
$("refresh").addEventListener("click", refresh);
$("filter").addEventListener("input", render);
$("clear").addEventListener("click", () => $("history").replaceChildren());
$("calculator").addEventListener("submit", async (event) => {
  event.preventDefault();
  const a = Number($("a").value),
    b = Number($("b").value);
  $("calculate").disabled = true;
  try {
    const r = await fetch("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a, b }),
    });
    const data = await r.json();
    if (!r.ok || data.isError) throw Error(data.error || "Tool failed");
    const value = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join(" ");
    $("result").textContent = "Result: " + value;
    const li = document.createElement("li");
    li.textContent = a + " + " + b + " = " + value;
    $("history").prepend(li);
  } catch (error) {
    $("result").textContent = error.message;
  } finally {
    $("calculate").disabled = false;
  }
});
refresh();
