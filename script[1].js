"use strict";
/* ---------- SAMPLE DATASET ----------
   verified:true  = based on widely published central-scheme rules (still confirm officially).
   verified:false = DEMONSTRATION example; criteria NOT verified.
   Amounts and deadlines are deliberately omitted because they change every year. */
const NSP = "https://scholarships.gov.in/";
const AICTE = "https://www.aicte-india.org/schemes/students-development-schemes";
const SCHOLARSHIPS = [
  {name:"Post-Matric Scholarship for SC Students", provider:"Ministry of Social Justice & Empowerment (via NSP)", type:"Category-based",
   levels:["Class 12","Diploma","Undergraduate","Postgraduate"], maxIncome:250000, categories:["SC"], verified:true,
   benefits:"Course-fee and maintenance support (amount varies – see notification).", link:NSP},
  {name:"Post-Matric Scholarship for ST Students", provider:"Ministry of Tribal Affairs (via NSP)", type:"Category-based",
   levels:["Class 12","Diploma","Undergraduate","Postgraduate"], maxIncome:250000, categories:["ST"], verified:true,
   benefits:"Fee and maintenance support (amount varies – see notification).", link:NSP},
  {name:"Central Sector Scheme for College & University Students", provider:"Dept. of Higher Education (via NSP)", type:"Merit-based",
   levels:["Undergraduate","Postgraduate"], maxIncome:450000, minMarks:80, marksKey:"prev", verified:true,
   extra:["Class 12 merit is judged by board percentile (top 20%), not raw percentage – check the cut-off","Course must be a regular degree course"],
   benefits:"Annual support for regular college/university students (see notification).", link:NSP},
  {name:"AICTE Pragati Scholarship for Girls", provider:"AICTE", type:"Gender-based",
   levels:["Diploma","Undergraduate"], maxIncome:800000, gender:"Female", verified:true,
   extra:["Admission to an AICTE-approved institution","Limit on number of girls per family – read the guidelines"],
   benefits:"Support for technical education (amount per official guidelines).", link:AICTE},
  {name:"AICTE Saksham Scholarship", provider:"AICTE", type:"Disability-based",
   levels:["Diploma","Undergraduate"], maxIncome:800000, disability:true, verified:true,
   extra:["Disability certificate (minimum 40%)","Admission to an AICTE-approved institution"],
   benefits:"Support for technical education for specially-abled students.", link:AICTE},
  {name:"Merit-cum-Means Scholarship (Minority Communities)", provider:"Ministry of Minority Affairs (via NSP)", type:"Merit + Means",
   levels:["Diploma","Undergraduate","Postgraduate"], maxIncome:250000, minMarks:50, marksKey:"current", verified:false,
   extra:["Must belong to a notified minority community (not asked in this form)","Professional / technical course required"],
   benefits:"Demonstration entry – check the official notification.", link:NSP},
  {name:"Pre-Matric Support Scheme (Demo)", provider:"Central scheme – demonstration example", type:"Means-based",
   levels:["Class 10"], maxIncome:250000, categories:["SC","ST","OBC"], verified:false,
   benefits:"Demonstration entry – check the official notification.", link:NSP},
  {name:"State Merit Scholarship – Punjab (Demo)", provider:"State government – demonstration example", type:"State-level",
   levels:["Class 12","Undergraduate"], maxIncome:300000, minMarks:60, marksKey:"prev", state:"Punjab", verified:false,
   benefits:"Demonstration entry only. Look up your state's scholarship portal.", link:NSP},
  {name:"EWS / General Means Scholarship (Demo)", provider:"Illustrative example", type:"Means-based",
   levels:["Undergraduate","Postgraduate"], maxIncome:600000, categories:["General","EWS"], minMarks:60, marksKey:"current", verified:false,
   benefits:"Demonstration entry only – not a real scheme.", link:NSP}
];
const STATES = "Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Andaman and Nicobar Islands|Chandigarh|Dadra and Nagar Haveli and Daman and Diu|Delhi|Jammu and Kashmir|Ladakh|Lakshadweep|Puducherry".split("|");

const $ = id => document.getElementById(id);
let profile = null;

/* ---------- SETUP ---------- */
$("state").innerHTML = '<option value="">Select…</option>' + STATES.map(s => `<option>${s}</option>`).join("");
fillFilter("fLevel", [...new Set(SCHOLARSHIPS.flatMap(s => s.levels))]);
fillFilter("fType", [...new Set(SCHOLARSHIPS.map(s => s.type))]);
fillFilter("fProv", [...new Set(SCHOLARSHIPS.map(s => s.provider))]);
function fillFilter(id, items){ $(id).innerHTML += items.map(i => `<option>${i}</option>`).join(""); }

$("menuBtn").onclick = () => $("navLinks").classList.toggle("open");
$("navLinks").onclick = () => $("navLinks").classList.remove("open");
$("level").onchange = () => {
  const l = $("level").value;
  $("prevLabel").textContent = l === "Class 10" ? "Class 10 percentage (if available)" : l === "Class 12" ? "Class 10 percentage" : "Class 12 percentage";
};

/* ---------- FORM ---------- */
function numOrNull(id){ const v = $(id).value.trim(); return v === "" ? null : Number(v); }
function setErr(id, msg){ $("e-" + id).textContent = msg; $(id).classList.toggle("bad", !!msg); return !msg; }

function validate(){
  let ok = true;
  ok = setErr("state", $("state").value ? "" : "Please select your state.") && ok;
  ok = setErr("level", $("level").value ? "" : "Please select your education level.") && ok;
  ok = setErr("category", $("category").value ? "" : "Please select your category.") && ok;
  const inc = numOrNull("income");
  ok = setErr("income", inc === null || inc < 0 || isNaN(inc) ? "Enter a valid annual income (0 or more)." : "") && ok;
  for (const id of ["prev", "current"]) {
    const v = numOrNull(id);
    ok = setErr(id, v !== null && (v < 0 || v > 100) ? "Enter a percentage between 0 and 100." : "") && ok;
  }
  return ok;
}

$("eligForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!validate()) { document.querySelector(".bad")?.focus(); return; }
  profile = {name:$("name").value.trim(), state:$("state").value, level:$("level").value, prev:numOrNull("prev"),
    current:numOrNull("current"), income:numOrNull("income"), category:$("category").value,
    gender:$("gender").value, inst:$("inst").value, disability:$("disability").value};
  $("results").hidden = false; $("resultBody").hidden = true; $("loader").hidden = false;
  $("results").scrollIntoView();
  setTimeout(() => { $("loader").hidden = true; $("resultBody").hidden = false; render(); }, 700);  // short loading effect
});

$("resetBtn").onclick = () => {
  $("eligForm").reset(); document.querySelectorAll(".err").forEach(e => e.textContent = "");
  document.querySelectorAll(".bad").forEach(e => e.classList.remove("bad"));
  $("results").hidden = true; profile = null;
};
$("againBtn").onclick = () => $("finder").scrollIntoView();
$("printBtn").onclick = () => window.print();
["fLevel","fType","fProv"].forEach(id => $(id).onchange = () => profile && render());

/* ---------- MATCHING ENGINE ----------
   Each scheme criterion becomes a check: "pass", "fail" or "unknown" (data missing).
   Any "fail" removes the scheme. Score = passed checks / total checks (unknown counts as NOT passed). */
function evaluate(s, p){
  const checks = [];
  const add = (label, status) => checks.push({label, status});
  add(`Education level: ${p.level}`, s.levels.includes(p.level) ? "pass" : "fail");
  add(`Income ₹${p.income.toLocaleString("en-IN")} within ₹${s.maxIncome.toLocaleString("en-IN")} limit`, p.income <= s.maxIncome ? "pass" : "fail");
  if (s.categories) add(`Category ${p.category} ${s.categories.includes(p.category) ? "is" : "is not"} eligible`, s.categories.includes(p.category) ? "pass" : "fail");
  if (s.state) add(`State: ${s.state}`, p.state === s.state ? "pass" : "fail");
  if (s.gender) add(p.gender ? `Gender: ${s.gender}` : "Gender not provided (scheme is for female students)", p.gender ? (p.gender === s.gender ? "pass" : "fail") : "unknown");
  if (s.disability) add(p.disability ? "Disability status" : "Disability status not provided", p.disability ? (p.disability === "yes" ? "pass" : "fail") : "unknown");
  if (s.minMarks){
    const v = s.marksKey === "current" ? p.current : p.prev;
    const which = s.marksKey === "current" ? "current" : "previous exam";
    add(v === null ? `Minimum ${s.minMarks}% in ${which} marks – not provided` : `${which[0].toUpperCase() + which.slice(1)} marks ${v}% vs ${s.minMarks}% needed`,
        v === null ? "unknown" : v >= s.minMarks ? "pass" : "fail");
  }
  if (checks.some(c => c.status === "fail")) return null;
  const passed = checks.filter(c => c.status === "pass").length;
  const hasUnknown = checks.some(c => c.status === "unknown");
  return {s, checks, score:Math.round(passed / checks.length * 100),
          status: hasUnknown || !s.verified ? "Needs Verification" : "Potential Match"};
}

/* ---------- RESULTS ---------- */
function render(){
  const fl = $("fLevel").value, ft = $("fType").value, fp = $("fProv").value;
  const all = SCHOLARSHIPS.map(s => evaluate(s, profile)).filter(Boolean)
    .filter(r => (!fl || r.s.levels.includes(fl)) && (!ft || r.s.type === ft) && (!fp || r.s.provider === fp))
    .sort((a, b) => b.score - a.score);   // most relevant first
  $("greeting").textContent = profile.name ? `Hello, ${profile.name}! 👋` : "Hello! 👋";
  $("count").textContent = `${all.length} potential scholarship${all.length === 1 ? "" : "s"} found for you.`;
  $("cards").innerHTML = all.length ? all.map(card).join("") :
    `<div class="card empty"><h3>😕 No matches found</h3><p>Try: clearing the filters, checking your income and category, filling optional fields (gender, disability, marks), or visiting your state's scholarship portal and <a href="${NSP}" target="_blank" rel="noopener">scholarships.gov.in</a>.</p></div>`;
  requestAnimationFrame(() => document.querySelectorAll(".bar i").forEach(b => b.style.width = b.dataset.w + "%"));
}

function card({s, checks, score, status}){
  const li = {pass:"pass", unknown:"unk"};
  return `<article class="card result">
    <header><div><h3>${s.name}</h3><div class="prov">${s.provider}</div></div>
      <div><span class="badge ${status === "Potential Match" ? "ok" : "verify"}">${status}</span>
      ${s.verified ? "" : '<br><span class="badge demo">Demo example</span>'}</div></header>
    <div class="meta"><span>🎯 Level: ${s.levels.join(", ")}</span><span>📊 Min marks: ${s.minMarks ? s.minMarks + "%" : "None listed"}</span>
      <span>💰 Income limit: ₹${s.maxIncome.toLocaleString("en-IN")}</span><span>👥 Categories: ${s.categories ? s.categories.join(", ") : "All"}</span>
      <span>🏷️ Type: ${s.type}</span></div>
    <p>🎁 ${s.benefits}</p>
    <div class="score"><b>Match Score: ${score}%</b><div class="bar"><i data-w="${score}" style="width:0"></i></div>
      <small>Estimate of profile fit only – not the chance of receiving the scholarship.</small></div>
    <b>Why you match / what's unclear</b>
    <ul class="check">${checks.map(c => `<li class="${li[c.status]}">${c.label}</li>`).join("")}</ul>
    <b>Please verify</b>
    <ul class="check"><li class="todo">${s.verified ? "Current criteria, dates and amount on the official notification" : "Demonstration entry – criteria are NOT verified; check the official notification"}</li>
      ${(s.extra || []).map(x => `<li class="todo">${x}</li>`).join("")}</ul>
    <a class="btn" href="${s.link}" target="_blank" rel="noopener">Official website ↗</a>
  </article>`;
}
