/* Shared behavior: header/footer partials, terminal, estimator, contact script. */
(function(){
"use strict";

/* Header and footer injected on every page. NAV defined per page via data attributes on body. */
var PAGES = [
  {href:"index.html", label:"Home"},
  {href:"about.html", label:"About"},
  {href:"portfolio.html", label:"Work"},
  {href:"estimator.html", label:"Scope a project"},
  {href:"contact.html", label:"Contact"}
];
function buildChrome(){
  var active = document.body.getAttribute("data-page") || "";
  var depth = parseInt(document.body.getAttribute("data-depth") || "0", 10);
  var pre = depth > 0 ? "../" : "";
  var nav = PAGES.map(function(p){
    return '<a href="'+pre+p.href+'"'+(p.href===active?' class="active"':'')+'>'+p.label+'</a>';
  }).join("");
  var hd = document.createElement("header");
  hd.className = "hd";
  hd.innerHTML = '<div class="hd-in"><a class="brand" href="'+pre+'index.html" aria-label="OSolutions home"><span class="brand-mark">O</span><span class="brand-name">OSolutions</span></a><nav class="nav">'+nav+'</nav></div>';
  document.body.insertBefore(hd, document.body.firstChild);
  var ft = document.createElement("footer");
  ft.className = "ft";
  ft.innerHTML = '<div class="ft-in"><a href="'+pre+'privacy.html">Privacy Policy</a><a href="'+pre+'terms.html">Terms</a><a href="'+pre+'contact.html">Contact</a><a href="https://knowledgeable-solutions.com/" target="_blank" rel="noopener">Original site</a><span class="sp">A style study recreation. Content rewritten; not affiliated with OSolutions LLC.</span></div>';
  document.body.appendChild(ft);
}
if(document.readyState === "loading"){document.addEventListener("DOMContentLoaded", buildChrome);}else{buildChrome()}

/* ---------- terminal (home) ---------- */
var termBody = document.getElementById("term-body");
var termInput = document.getElementById("term-input");
var termForm = document.getElementById("term-form");
var termHint = document.getElementById("term-hint");
if(termBody && termForm){
  var PROMPT = '<span class="prompt">visitor@osolutions:~$</span> ';
  function line(html, cls){
    var d = document.createElement("div");
    d.className = "term-line" + (cls ? " " + cls : "");
    d.innerHTML = html;
    termBody.appendChild(d);
    termBody.scrollTop = termBody.scrollHeight;
    return d;
  }
  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  var CMDS = {
    help: function(){
      line("navigate with: cd &lt;page&gt;", "mut");
      line("");
      line("  home             the home terminal", "mut");
      line("  project_examples see shipped work", "mut");
      line("  scope_my_project scope a project", "mut");
      line("  who_are_we       about OSolutions", "mut");
      line("  contact          start a conversation", "mut");
      line("  privacy          privacy policy", "mut");
      line("  terms            terms of service", "mut");
      line("");
      line("other: ls (list pages) / help / clear", "dim");
    },
    ls: function(){ CMDS.help(); },
    clear: function(){ termBody.innerHTML = ""; },
    who_are_we: function(){ go("about.html"); },
    project_examples: function(){ go("portfolio.html"); },
    scope_my_project: function(){ go("estimator.html"); },
    contact: function(){ go("contact.html"); },
    privacy: function(){ go("privacy.html"); },
    terms: function(){ go("terms.html"); },
    home: function(){ go("index.html"); }
  };
  function go(page){ line("opening " + page + " ...", "ok"); setTimeout(function(){ window.location.href = page; }, 450); }
  function run(raw){
    var input = raw.trim();
    line(PROMPT + esc(input || ""));
    if(!input) return;
    var parts = input.split(/\s+/);
    var name = parts[0].toLowerCase();
    if(name === "cd"){
      var target = (parts[1] || "").toLowerCase();
      if(CMDS[target] && target !== "help" && target !== "ls" && target !== "clear"){ CMDS[target](); }
      else if(target){ line("cd: no such page: " + esc(target), "warn"); }
      else { line("usage: cd <page>   try: cd project_examples", "mut"); }
      return;
    }
    if(CMDS[name]){ CMDS[name](); }
    else { line("command not found: " + esc(name), "warn"); }
  }
  function typeLines(lines, done){
    var i = 0;
    (function next(){
      if(i >= lines.length){ if(done) done(); return; }
      line(lines[i][0], lines[i][1]);
      i++;
      setTimeout(next, 180);
    })();
  }
  termBody.innerHTML = "";
  typeLines([
    ["OSOLUTIONS v1.0.0", "mut"],
    ["initializing system...", "dim"],
    ["loading modules...", "dim"],
    ["ready.", "ok"]
  ], function(){
    line("");
    line("Welcome. Type <b>help</b> to see every command, or pick one below.", "mut");
    termHint.textContent = "click the terminal, then type: help";
  });
  var cmdBtns = document.getElementById("cmd-btns");
  if(cmdBtns){
    ["project_examples","scope_my_project","who_are_we","contact"].forEach(function(c){
      var b = document.createElement("button");
      b.className = "chip"; b.type = "button"; b.textContent = c;
      b.addEventListener("click", function(){ run(c); termInput.focus(); });
      cmdBtns.appendChild(b);
    });
  }
  termForm.addEventListener("submit", function(e){
    e.preventDefault();
    run(termInput.value);
    termInput.value = "";
  });
  termBody.addEventListener("click", function(){ termInput.focus(); });
}

/* ---------- estimator ---------- */
var estRoot = document.getElementById("estimator");
if(estRoot){
  var STEPS = [
    {key:"projectType", q:"What are you trying to do?",
     options:[["website","Get customers","Website"],["app_data","Run my business better","App + Data"],["automation","Automate a task","Pure code"],["infrastructure","Get set up and stay online","Infrastructure"],["security","Feel safer from attacks","Cybersecurity"]]},
    {key:"audience", q:"Who will use it?",
     options:[["public","Public"],["team","My team"],["both","Both"]]},
    {key:"existingState", q:"Is any of it built already?",
     options:[["fresh","No, start fresh"],["improve","Yes, improve it"],["replace","Yes, replace it"]]},
    {key:"dataNeeds", q:"What about your data?",
     options:[["none","No data involved"],["records","Store and manage records"],["optimize","Optimize or organize existing data"],["spreadsheets","It is trapped in spreadsheets"]]},
    {key:"projectLength", q:"How long is the project?",
     options:[["under_1mo","Less than 1 month"],["one_to_3mo","1 to 3 months"],["over_3mo","More than 3 months"]]},
    {key:"budget", q:"What is your budget?",
     options:[["under_5k","Under $5,000"],["k5_to_15","$5,000 to $15,000"],["k15_to_50","$15,000 to $50,000"],["over_50k","$50,000 and up"],["unsure","Not sure yet"]]}
  ];
  var idx = 0, answers = {};
  function render(){
    estRoot.innerHTML = "";
    var done = idx >= STEPS.length;
    var prog = document.createElement("div"); prog.className = "est-prog";
    STEPS.forEach(function(s,i){ var p = document.createElement("i"); if(i < idx || done) p.className = "on"; prog.appendChild(p); });
    estRoot.appendChild(prog);
    var wrap = document.createElement("div"); wrap.className = "est-anim";
    if(!done){
      var step = STEPS[idx];
      var q = document.createElement("div"); q.className = "est-q"; q.textContent = step.q;
      var c = document.createElement("div"); c.className = "est-count"; c.textContent = "[" + (idx+1) + "/" + STEPS.length + "]";
      var chips = document.createElement("div"); chips.className = "ci-chips chiprow";
      var chosen = answers[step.key] || null;
      step.options.forEach(function(o){
        var b = document.createElement("button"); b.type = "button"; b.className = "chip" + (chosen === o[0] ? " sel" : ""); b.textContent = o[1];
        b.addEventListener("click", function(){ answers[step.key] = o[0]; render(); });
        chips.appendChild(b);
      });
      var nav = document.createElement("div"); nav.className = "est-nav";
      var back = document.createElement("button"); back.type = "button"; back.className = "est-back"; back.textContent = idx === 0 ? "Start over" : "Back";
      back.addEventListener("click", function(){ if(idx === 0){ answers = {}; } else { idx--; } render(); });
      var next = document.createElement("button"); next.type = "button"; next.className = "est-next"; next.textContent = idx === STEPS.length - 1 ? "Finish" : "Continue";
      next.disabled = !chosen;
      next.addEventListener("click", function(){ idx++; render(); });
      nav.appendChild(back); nav.appendChild(next);
      var err = document.createElement("div"); err.className = "est-err"; err.id = "est-err";
      wrap.appendChild(q); wrap.appendChild(c); wrap.appendChild(chips); wrap.appendChild(nav); wrap.appendChild(err);
    } else {
      var title = document.createElement("div"); title.className = "est-q"; title.textContent = "Scope captured. Thank you.";
      var sub = document.createElement("div"); sub.className = "est-count"; sub.textContent = "send this along and we will scope it out together on a call";
      var box = document.createElement("div"); box.className = "scope-summary";
      STEPS.forEach(function(s){
        var val = s.options.filter(function(o){ return o[0] === answers[s.key]; })[0];
        var row = document.createElement("div"); row.className = "row";
        row.innerHTML = '<span class="k">' + s.q + '</span><span class="v">' + (val ? val[1] : "—") + "</span>";
        box.appendChild(row);
      });
      var scope = encodeURIComponent(JSON.stringify(answers));
      var link = document.createElement("a"); link.className = "btn"; link.href = "contact.html?scope=" + scope; link.textContent = "Contact us about this project";
      var again = document.createElement("button"); again.type = "button"; again.className = "est-back"; again.style.marginTop = "12px"; again.style.width = "100%"; again.textContent = "Start over";
      again.addEventListener("click", function(){ idx = 0; answers = {}; render(); });
      var lrow = document.createElement("div"); lrow.style.marginTop = "22px"; lrow.appendChild(link);
      wrap.appendChild(title); wrap.appendChild(sub); wrap.appendChild(box); wrap.appendChild(lrow); wrap.appendChild(again);
    }
    estRoot.appendChild(wrap);
  }
  render();
}

/* ---------- contact script ---------- */
var csBody = document.getElementById("cs-body");
var csForm = document.getElementById("cs-form");
var csInput = document.getElementById("cs-input");
if(csBody && csForm){
  var scopeParam = null;
  try{
    var m = window.location.search.match(/[?&]scope=([^&]+)/);
    if(m) scopeParam = JSON.parse(decodeURIComponent(m[1]));
  }catch(e){}
  var SCOPE_LABELS = {
    projectType:{website:"Get customers (Website)",app_data:"Run my business better (App + Data)",automation:"Automate a task (Pure code)",infrastructure:"Get set up and stay online (Infrastructure)",security:"Feel safer from attacks (Cybersecurity)"},
    audience:{public:"Public",team:"My team",both:"Both"},
    existingState:{fresh:"Start fresh",improve:"Improve what exists",replace:"Replace what exists"},
    dataNeeds:{none:"No data involved",records:"Store and manage records",optimize:"Optimize or organize existing data",spreadsheets:"Data trapped in spreadsheets"},
    projectLength:{under_1mo:"Less than 1 month",one_to_3mo:"1 to 3 months",over_3mo:"More than 3 months"},
    budget:{under_5k:"Under $5,000",k5_to_15:"$5,000 to $15,000",k15_to_50:"$15,000 to $50,000",over_50k:"$50,000 and up",unsure:"Not sure yet"}
  };
  var SCOPE_NAMES = {projectType:"Project type",audience:"Audience",existingState:"Starting point",dataNeeds:"Data needs",projectLength:"Timeline",budget:"Budget"};
  var state = {step:"boot", name:"", email:"", desc:""};
  function cline(html, cls){
    var d = document.createElement("div");
    d.className = "term-line" + (cls ? " " + cls : "");
    d.innerHTML = html;
    csBody.appendChild(d);
    csBody.scrollTop = csBody.scrollHeight;
  }
  function cprompt(t){ cline('<span class="prompt">contact.sh&gt;</span> ' + t); }
  function wait(ms, fn){ setTimeout(fn, ms); }
  function start(){
    csBody.innerHTML = "";
    if(scopeParam){
      cline("loading project scope ...", "dim");
      var rows = Object.keys(SCOPE_NAMES).map(function(k){
        var lab = (SCOPE_LABELS[k] || {})[scopeParam[k]] || scopeParam[k];
        return '<div class="row"><span class="k">' + SCOPE_NAMES[k] + '</span><span class="v">' + lab + "</span></div>";
      }).join("");
      cline('<div class="scope-summary">' + rows + "</div>");
      cline("scope attached. it will travel with your message.", "ok");
      cline("");
    }
    cline("$ ./contact_osolutions.sh", "mut");
    wait(500, function(){
      cline("loading contact script ...", "dim");
      wait(600, function(){
        cprompt("what is your name?");
        state.step = "name";
      });
    });
  }
  function confirmStep(){
    cprompt("name: <b>" + esc(state.name) + "</b>  email: <b>" + esc(state.email) + "</b>");
    cprompt("looks right? (y / n)");
    state.step = "confirm1";
  }
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  csForm.addEventListener("submit", function(e){
    e.preventDefault();
    var v = csInput.value.trim();
    csInput.value = "";
    cline('<span class="prompt">contact.sh&gt;</span> ' + esc(v || ""));
    if(state.step === "name"){
      if(!v){ cprompt("please give a name so we know what to call you."); return; }
      state.name = v; state.step = "email";
      cprompt("what is your email?");
    } else if(state.step === "email"){
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){ cprompt("that email does not look right. try again?"); return; }
      state.email = v; confirmStep();
    } else if(state.step === "confirm1"){
      if(/^y(es)?$/i.test(v)){ state.step = "desc"; cprompt("describe your project in a few lines:"); }
      else { cline("restarting ...", "warn"); wait(700, start); state.step = "boot"; }
    } else if(state.step === "desc"){
      if(!v){ cprompt("a sentence or two is enough. go ahead:"); return; }
      state.desc = v;
      cprompt("message: <b>" + esc(state.desc) + "</b>");
      cprompt("send it? (y / n)");
      state.step = "confirm2";
    } else if(state.step === "confirm2"){
      if(/^y(es)?$/i.test(v)){
        state.step = "done";
        cline("sending ...", "dim");
        wait(800, function(){
          cline("message recorded. we reply within one business day.", "ok");
          cline("");
          cline("this is a recreation for study, so nothing was actually sent.", "dim");
          cline("the real contact page lives on the original site (footer link below).", "dim");
        });
      } else { cline("restarting ...", "warn"); wait(700, start); state.step = "boot"; }
    }
  });
  csBody.addEventListener("click", function(){ csInput.focus(); });
  start();
}
})();
