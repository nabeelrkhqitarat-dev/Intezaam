
// ---------------- Intezaam Workspace ----------------
const $ = (sel, ctx=document)=>ctx.querySelector(sel);
const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));

const defaultData = {
  version: 1,
  settings: { couple: "Talha & Joveriya", date: "2025-12-25", city: "Allahabad", venue: "Apollo Gardens" },
  tasks: [
    {id: "t1", title:"Book venue advance", category:"Venue", status:"In-Progress", owner:"Talha Family", due:"2025-11-25", cost:15000, priority:"High", notes:"Advance 50%"},
    {id: "t2", title:"Finalize menu", category:"Catering", status:"Backlog", owner:"Both", due:"2025-12-05", cost:0, priority:"Medium", notes:"Get veg & non-veg balance"},
    {id: "t3", title:"Print invitations", category:"Invitations", status:"Blocked", owner:"Joveriya Family", due:"2025-11-28", cost:4500, priority:"High", notes:"Awaiting final design signoff"},
    {id: "t4", title:"Stage backdrop", category:"Decor", status:"Backlog", owner:"Vendor", due:"2025-12-20", cost:12000, priority:"Low", notes:"Green & gold"}
  ],
  guests: [
    {id:"g1", name:"Ahmed Khan", side:"Groom", phone:"", count:2, rsvp:"Invited", table:"", notes:""},
    {id:"g2", name:"Fatima Ali", side:"Bride", phone:"", count:3, rsvp:"Pending", table:"", notes:""},
    {id:"g3", name:"Rizwan", side:"Groom", phone:"", count:1, rsvp:"Going", table:"A3", notes:""}
  ],
  budget: [
    {id:"b1", item:"Venue Booking", category:"Venue", estimated:40000, actual:35000, vendor:"Apollo Gardens", notes:"Negotiated"},
    {id:"b2", item:"Catering", category:"Food", estimated:120000, actual:0, vendor:"TBD", notes:"Per plate quote awaited"},
    {id:"b3", item:"Photography", category:"Media", estimated:25000, actual:0, vendor:"TBD", notes:""}
  ],
  vendors: [
    {id:"v1", name:"Apollo Gardens", service:"Venue", quote:40000, contact:"Manager 98xxxx", status:"Booked", notes:""},
    {id:"v2", name:"Shah Caterers", service:"Catering", quote:115000, contact:"Shah 98xxxx", status:"Negotiating", notes:""}
  ],
  menu: [
    {id:"m1", course:"Starter", item:"Fish Fry (Rohu/Katla)", veg:"Non-Veg", notes:""},
    {id:"m2", course:"Starter", item:"Shami Kebab", veg:"Non-Veg", notes:""},
    {id:"m3", course:"Main", item:"Chicken White Korma", veg:"Non-Veg", notes:""},
    {id:"m4", course:"Main", item:"Palak Paneer", veg:"Veg", notes:""}
  ],
  timeline: [
    {id:"d1", time:"18:00", title:"Nikah Ceremony", owner:"Both", notes:"Arrive early"},
    {id:"d2", time:"19:30", title:"Dinner Opens", owner:"Catering", notes:""}
  ],
  notes: ""
};

let state = null;

async function loadData(){
  // Try localStorage first
  const local = localStorage.getItem("intezaam-data");
  if(local){
    try{ state = JSON.parse(local); return; }catch(e){}
  }
  // Then try bundled json
  try {
    const res = await fetch("../data/intezaam.json?ts="+Date.now());
    if(res.ok){
      state = await res.json();
      return;
    }
  } catch(e){ /* ignore */ }
  // Fallback
  state = structuredClone(defaultData);
}
function saveLocal(){
  localStorage.setItem("intezaam-data", JSON.stringify(state));
  alert("Saved locally in this browser.");
}
function resetSample(){
  if(confirm("Reset workspace to sample data? This will overwrite local changes in this browser.")){
    state = structuredClone(defaultData);
    renderAll();
    saveLocal();
  }
}
function uid(prefix){ return prefix + Math.random().toString(36).slice(2,8); }

// -------- Dashboard & Donut -------
function sumBudget(field){
  return state.budget.reduce((a,b)=>a+(Number(b[field]||0)),0);
}
function renderDashboard(){
  $("#statTasks").textContent = String(state.tasks.length);
  $("#statGuests").textContent = String(state.guests.reduce((a,b)=>a+(Number(b.count||1)),0));
  $("#statBudgetActual").textContent = "₹"+ sumBudget("actual").toLocaleString();
  $("#statBudgetEst").textContent = "₹"+ sumBudget("estimated").toLocaleString();
  drawDonut("budgetDonut", [
    {label:"Estimated", value: sumBudget("estimated")},
    {label:"Actual", value: sumBudget("actual")}
  ]);
}
function drawDonut(canvasId, parts){
  const c = document.getElementById(canvasId);
  if(!c) return;
  const ctx = c.getContext("2d");
  const W = c.width = c.clientWidth || 500;
  const H = c.height = 280;
  const cx = W/2, cy = H/2, r = Math.min(W,H)/2 - 20, t = 30;
  const total = parts.reduce((a,b)=>a+b.value,0) || 1;
  let start = -Math.PI/2;
  const colors = ["#C8A75E","#1E7D67","#6B7280","#F59E0B"];
  ctx.clearRect(0,0,W,H);
  parts.forEach((p,i)=>{
    const angle = (p.value/total)*Math.PI*2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start+angle);
    ctx.arc(cx, cy, r-t, start+angle, start, true);
    ctx.closePath();
    ctx.fillStyle = colors[i%colors.length];
    ctx.fill();
    start += angle;
  });
  // Legend
  ctx.font = "14px ui-sans-serif, system-ui";
  ctx.fillStyle = "#374151";
  let lx = 20, ly = 20;
  parts.forEach((p,i)=>{
    ctx.fillStyle = colors[i%colors.length];
    ctx.fillRect(lx, ly-10, 14, 14);
    ctx.fillStyle = "#111827";
    ctx.fillText(`${p.label}: ₹${(p.value||0).toLocaleString()}`, lx+20, ly);
    ly += 20;
  });
}

// -------- Tasks (Kanban) --------
function renderKanban(){
  $("#colBacklog").innerHTML = "";
  $("#colProgress").innerHTML = "";
  $("#colBlocked").innerHTML = "";
  $("#colDone").innerHTML = "";
  state.tasks.forEach(task=>{
    const div = document.createElement("div");
    div.className = "card";
    div.draggable = true;
    div.dataset.id = task.id;
    div.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px">
      <div><strong>${task.title}</strong><div class="small">${task.category} • ${task.owner}</div></div>
      <div class="small">₹${Number(task.cost||0).toLocaleString()}</div>
    </div>
    <div class="small">Due: ${task.due||"-"} | Priority: ${task.priority||"-"}</div>`;
    div.addEventListener("dragstart", e=>{ e.dataTransfer.setData("text/plain", task.id); });
    const bucket = {
      "Backlog":"colBacklog",
      "In-Progress":"colProgress",
      "Blocked":"colBlocked",
      "Done":"colDone"
    }[task.status||"Backlog"];
    $("#"+bucket).appendChild(div);
  });
  $$(".column").forEach(col=>{
    col.addEventListener("dragover", e=>e.preventDefault());
    col.addEventListener("drop", e=>{
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const t = state.tasks.find(x=>x.id===id);
      if(t){ t.status = col.dataset.status; saveLocal(); renderKanban(); renderDashboard(); }
    });
  });
}
function bindTaskForm(){
  $("#addTask").addEventListener("click", ()=>{
    const t = {
      id: uid("t"), title: $("#taskTitle").value || "Untitled",
      category: $("#taskCategory").value, status: "Backlog",
      owner: $("#taskOwner").value, due: $("#taskDue").value,
      cost: Number($("#taskCost").value || 0), priority: $("#taskPriority").value, notes:""
    };
    state.tasks.push(t); saveLocal(); renderKanban(); renderDashboard();
    $("#taskTitle").value=""; $("#taskCost").value="";
  });
}

// -------- Guests --------
function renderGuests(){
  const tbl = $("#guestTable");
  tbl.innerHTML = "<tr><th>Name</th><th>Side</th><th>Phone</th><th>Count</th><th>RSVP</th><th></th></tr>";
  state.guests.forEach(g=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${g.name}</td><td>${g.side}</td><td>${g.phone||""}</td><td>${g.count||1}</td><td>${g.rsvp||"Invited"}</td><td><button data-id="${g.id}" class="btn">✕</button></td>`;
    tbl.appendChild(tr);
  });
  $$("#guestTable .btn").forEach(b=>b.addEventListener("click",()=>{
    const id = b.getAttribute("data-id");
    state.guests = state.guests.filter(x=>x.id!==id);
    saveLocal(); renderGuests(); renderDashboard();
  }));
}
function bindGuestForm(){
  $("#addGuest").addEventListener("click", ()=>{
    state.guests.push({
      id: uid("g"), name: $("#guestName").value || "Unnamed", side: $("#guestSide").value,
      phone: $("#guestPhone").value, count: Number($("#guestCount").value || 1),
      rsvp: $("#guestRSVP").value, table:"", notes:""
    });
    saveLocal(); renderGuests(); renderDashboard();
    $("#guestName").value=""; $("#guestPhone").value=""; $("#guestCount").value="";
  });
}

// -------- Budget --------
function renderBudget(){
  const tbl = $("#budgetTable");
  tbl.innerHTML = "<tr><th>Item</th><th>Category</th><th>Estimated</th><th>Actual</th><th>Vendor</th><th></th></tr>";
  state.budget.forEach(b=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${b.item}</td><td>${b.category}</td><td>₹${Number(b.estimated||0).toLocaleString()}</td><td>₹${Number(b.actual||0).toLocaleString()}</td><td>${b.vendor||""}</td><td><button data-id="${b.id}" class="btn">✕</button></td>`;
    tbl.appendChild(tr);
  });
  $$("#budgetTable .btn").forEach(b=>b.addEventListener("click",()=>{
    const id = b.getAttribute("data-id");
    state.budget = state.budget.filter(x=>x.id!==id);
    saveLocal(); renderBudget(); renderDashboard();
  }));
}
function bindBudgetForm(){
  $("#addBudget").addEventListener("click", ()=>{
    state.budget.push({
      id: uid("b"), item: $("#bItem").value || "Untitled", category: $("#bCat").value || "",
      estimated: Number($("#bEst").value||0), actual: Number($("#bAct").value||0),
      vendor: $("#bVendor").value || "", notes:""
    });
    saveLocal(); renderBudget(); renderDashboard();
    $("#bItem").value=""; $("#bEst").value=""; $("#bAct").value=""; $("#bVendor").value=""; $("#bCat").value="";
  });
}

// -------- Vendors --------
function renderVendors(){
  const tbl = $("#vendorTable");
  tbl.innerHTML = "<tr><th>Name</th><th>Service</th><th>Quote</th><th>Contact</th><th>Status</th><th></th></tr>";
  state.vendors.forEach(v=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${v.name}</td><td>${v.service}</td><td>₹${Number(v.quote||0).toLocaleString()}</td><td>${v.contact||""}</td><td>${v.status||"Prospecting"}</td><td><button data-id="${v.id}" class="btn">✕</button></td>`;
    tbl.appendChild(tr);
  });
  $$("#vendorTable .btn").forEach(b=>b.addEventListener("click",()=>{
    const id = b.getAttribute("data-id");
    state.vendors = state.vendors.filter(x=>x.id!==id);
    saveLocal(); renderVendors();
  }));
}
function bindVendorForm(){
  $("#addVendor").addEventListener("click", ()=>{
    state.vendors.push({
      id: uid("v"), name: $("#vName").value || "Unnamed", service: $("#vService").value || "",
      quote: Number($("#vQuote").value||0), contact: $("#vContact").value || "",
      status: $("#vStatus").value || "Prospecting", notes:""
    });
    saveLocal(); renderVendors();
    $("#vName").value=""; $("#vService").value=""; $("#vQuote").value=""; $("#vContact").value="";
  });
}

// -------- Menu --------
function renderMenu(){
  const tbl = $("#menuTable");
  tbl.innerHTML = "<tr><th>Course</th><th>Item</th><th>Veg/Non-Veg</th><th>Notes</th><th></th></tr>";
  state.menu.forEach(m=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${m.course}</td><td>${m.item}</td><td>${m.veg}</td><td>${m.notes||""}</td><td><button data-id="${m.id}" class="btn">✕</button></td>`;
    tbl.appendChild(tr);
  });
  $$("#menuTable .btn").forEach(b=>b.addEventListener("click",()=>{
    const id = b.getAttribute("data-id");
    state.menu = state.menu.filter(x=>x.id!==id);
    saveLocal(); renderMenu();
  }));
}
function bindMenuForm(){
  $("#addMenu").addEventListener("click", ()=>{
    state.menu.push({
      id: uid("m"), course: $("#mCourse").value || "", item: $("#mItem").value || "",
      veg: $("#mVeg").value || "Veg", notes: $("#mNotes").value || ""
    });
    saveLocal(); renderMenu();
    $("#mCourse").value=""; $("#mItem").value=""; $("#mNotes").value="";
  });
}

// -------- Timeline --------
function renderTimeline(){
  const tbl = $("#timelineTable");
  tbl.innerHTML = "<tr><th>Time</th><th>Activity</th><th>Owner</th><th>Notes</th><th></th></tr>";
  state.timeline.forEach(d=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.time}</td><td>${d.title}</td><td>${d.owner||""}</td><td>${d.notes||""}</td><td><button data-id="${d.id}" class="btn">✕</button></td>`;
    tbl.appendChild(tr);
  });
  $$("#timelineTable .btn").forEach(b=>b.addEventListener("click",()=>{
    const id = b.getAttribute("data-id");
    state.timeline = state.timeline.filter(x=>x.id!==id);
    saveLocal(); renderTimeline();
  }));
}
function bindTimelineForm(){
  $("#addTimeline").addEventListener("click", ()=>{
    state.timeline.push({
      id: uid("d"), time: $("#tTime").value || "", title: $("#tTitle").value || "",
      owner: $("#tOwner").value || "", notes: $("#tNotes").value || ""
    });
    saveLocal(); renderTimeline();
    $("#tTime").value=""; $("#tTitle").value=""; $("#tOwner").value=""; $("#tNotes").value="";
  });
}

// -------- Notes & Settings --------
function renderNotes(){ $("#notesText").value = state.notes || ""; }
function bindNotes(){ $("#notesText").addEventListener("input", e=>{ state.notes = e.target.value; saveLocal(); }); }
function renderSettings(){
  $("#sCouple").value = state.settings.couple || "";
  $("#sDate").value = state.settings.date || "";
  $("#sCity").value = state.settings.city || "";
  $("#sVenue").value = state.settings.venue || "";
}
function bindSettings(){
  ["sCouple","sDate","sCity","sVenue"].forEach(id=>{
    $("#"+id).addEventListener("input", ()=>{
      state.settings.couple = $("#sCouple").value;
      state.settings.date = $("#sDate").value;
      state.settings.city = $("#sCity").value;
      state.settings.venue = $("#sVenue").value;
      saveLocal();
    });
  });
}

// -------- Export/Import --------
function exportJson(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "intezaam.json";
  a.click();
}
function importJson(file){
  const r = new FileReader();
  r.onload = e=>{
    try{
      state = JSON.parse(e.target.result);
      renderAll(); saveLocal();
    }catch(err){ alert("Invalid JSON"); }
  };
  r.readAsText(file);
}

// -------- Tabs --------
function bindTabs(){
  $$(".sidebar .nav a").forEach(a=>{
    a.addEventListener("click", ()=>{
      $$(".sidebar .nav a").forEach(n=>n.classList.remove("active"));
      a.classList.add("active");
      $$(".section").forEach(s=>s.classList.remove("active"));
      $("#"+a.dataset.tab).classList.add("active");
    });
  });
}

// -------- Render all --------
function renderAll(){
  renderDashboard();
  renderKanban();
  renderGuests();
  renderBudget();
  renderVendors();
  renderMenu();
  renderTimeline();
  renderNotes();
  renderSettings();
}

// Init
loadData().then(()=>{
  bindTabs();
  bindTaskForm();
  bindGuestForm();
  bindBudgetForm();
  bindVendorForm();
  bindMenuForm();
  bindTimelineForm();
  bindNotes();
  bindSettings();
  $("#exportJson").addEventListener("click", exportJson);
  $("#importJson").addEventListener("change", e=>importJson(e.target.files[0]));
  $("#saveLocal").addEventListener("click", saveLocal);
  $("#resetData").addEventListener("click", resetSample);
  renderAll();
});
