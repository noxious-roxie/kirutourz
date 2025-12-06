/* script.js - frontend wiring for Tournament Formatter */

// Manual overrides for replay URLs (keyed by "PlayerA vs PlayerB")
const overrideReplayLinks = {};

// DOM elements
const threadInput = document.getElementById("threadInput");
const btnParse = document.getElementById("btnParse");
const btnGenerateReplays = document.getElementById("btnGenerateReplays");
const btnGenerateKey = document.getElementById("btnGenerateKey");

const parsedArea = document.getElementById("parsedArea");
const parsedJson = document.getElementById("parsedJson");

const outputArea = document.getElementById("outputArea");
const bbOutput = document.getElementById("bbOutput");

const keyArea = document.getElementById("keyArea");
const keyOutput = document.getElementById("keyOutput");

let parsedData = null;

// helper: call proxy fetch on server
async function fetchThreadHTML(url) {
  const res = await fetch('/api/fetchSmogon?url=' + encodeURIComponent(url));
  if (!res.ok) throw new Error('Failed to fetch thread via server proxy');
  const j = await res.json();
  if (j.error) throw new Error(j.error);
  return j.html || j.raw || '';
}

// Parse button: fetch thread (if URL) or use raw text
btnParse.addEventListener('click', async () => {
  const input = threadInput.value.trim();
  if (!input) { alert('Please paste a Smogon thread URL or OP text'); return; }

  parsedJson.textContent = 'Parsing...';
  parsedArea.classList.remove('hidden');

  try {
    let raw;
    if (/^https?:\/\//i.test(input)) {
      raw = await fetchThreadHTML(input);
    } else {
      raw = input;
    }

    // call parse endpoint to build structured result
    const res = await fetch('/api/parse-thread', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ input: raw })
    });
    const j = await res.json();
    if (j.error) throw new Error(j.error);

    parsedData = j.parsed || { raw };
    parsedJson.textContent = JSON.stringify(parsedData, null, 2);

    // enable buttons
    btnGenerateReplays.disabled = false;
    btnGenerateKey.disabled = false;

  } catch (err) {
    parsedJson.textContent = 'ERROR: ' + err.message;
    btnGenerateReplays.disabled = true;
    btnGenerateKey.disabled = true;
  }
});

// Generate Replays: send parsed data to backend generator
btnGenerateReplays.addEventListener('click', async () => {
  if (!parsedData) return alert('Parse a thread first.');

  const payload = { parsed: parsedData, raw: parsedData.raw || '', options: { useSprites: true, autoPrefixes: true, overrideReplayLinks } };

  try {
    const res = await fetch('/api/generate-replays', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (j.error) throw new Error(j.error);
    bbOutput.value = j.bbcode || '';
    outputArea.classList.remove('hidden');
  } catch (err) {
    alert('Generate failed: ' + err.message);
  }
});

// Generate Key
btnGenerateKey.addEventListener('click', async () => {
  if (!parsedData) return alert('Parse a thread first.');
  try {
    const res = await fetch('/api/generate-key', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ parsed: parsedData, options: { useSprites: true } })
    });
    const j = await res.json();
    if (j.error) throw new Error(j.error);
    keyOutput.value = j.keyBBCode || '';
    keyArea.classList.remove('hidden');
  } catch (err) {
    alert('Generate KEY failed: ' + err.message);
  }
});
