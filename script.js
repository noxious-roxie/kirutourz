const PROXY = "[https://corsproxy.io/](https://corsproxy.io/)?";

async function fetchThread(url) {
try {
const res = await fetch(url);
if (!res.ok) throw new Error("Primary fetch failed");
return await res.text();
} catch (e) {
// Try proxy
const proxied = PROXY + encodeURIComponent(url);
const res2 = await fetch(proxied);
if (!res2.ok) throw new Error("Proxy fetch failed");
return await res2.text();
}
}

document.getElementById("btnParse").onclick = async () => {
const input = document.getElementById("threadInput").value.trim();
if (!input) return alert("Paste a URL or OP text.");

let rawHTML = "";
let OPtext = "";

if (input.startsWith("http")) {
try {
rawHTML = await fetchThread(input);
} catch {
alert("Could not fetch URL. Try pasting the OP manually.");
return;
}
} else {
OPtext = input;
}

const parsed = parseOP(rawHTML || OPtext);
renderPreview(parsed);

document.getElementById("btnGenerateReplays").disabled = false;
document.getElementById("btnGenerateKey").disabled = false;
};

function parseOP(raw) {
const temp = document.createElement("div");
temp.innerHTML = raw;

const text = temp.innerText || raw;
const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

const matches = lines.filter(l => l.includes("vs") || l.includes("VS"));

return { matches, raw };
}

function renderPreview(parsed) {
const out = document.getElementById("parsedJson");
document.getElementById("parsedArea").classList.remove("hidden");

out.textContent = JSON.stringify(parsed, null, 2);
}

document.getElementById("btnGenerateReplays").onclick = () => {
const preview = document.getElementById("parsedJson").textContent;
const parsed = JSON.parse(preview);

const bb = parsed.matches
.map(m => `[B]${m}[/B] - Replay: [URL]paste replay here[/URL]`)
.join("\n");

document.getElementById("bbOutput").value = bb;
document.getElementById("outputArea").classList.remove("hidden");
};

document.getElementById("btnGenerateKey").onclick = () => {
const preview = document.getElementById("parsedJson").textContent;
const parsed = JSON.parse(preview);

const key = parsed.matches
.map((m, i) => `T${i + 1}: ${m}`)
.join("\n");

document.getElementById("keyOutput").value = key;
document.getElementById("keyArea").classList.remove("hidden");
};

