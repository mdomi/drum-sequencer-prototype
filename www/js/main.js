!function(a){function b(a){return j*k/a}function c(a,b){var c=[],d=0,e=Array.prototype.slice.call(arguments,2);for(d=0;a>d;d++)c.push(b.apply(null,e));return c}function d(){this.el=i.createElement("span"),this.el.classList.add("sequencer-square");var a=!1;this.activate=function(){this.el.classList.add("sequencer-square-active")},this.deactivate=function(){this.el.classList.remove("sequencer-square-active")},this.toggle=function(){this.el.classList.toggle("sequencer-square-toggle"),a=!a}.bind(this),this.toggled=function(){return a},this.bindEvents=function(){this.el.addEventListener("click",this.toggle,!1)}}function e(a){return 10>a?"0"+String(a):String(a)}function f(){return(new Date).getTime()}function g(a){this.el=i.createElement("div");var b,e=[];e=c(a,d.create),e.forEach(function(a){this.el.appendChild(a.el)}.bind(this)),this.bindEvents=function(){e.forEach(function(a){a.bindEvents()})},this.setActive=function(a){b&&b.deactivate(),b=e[a],b.activate()},this.clearActive=function(){b&&b.classList.remove("sequencer-square-active"),b=void 0}}function h(d){function h(){m=0}function j(){n.innerHTML=e(Math.floor(m/4)+1)+" - "+e(m%4+1)}function k(){r.forEach(function(a){a.setActive(m)}),j.call(this),m=(m+1)%p}this.el=i.createElement("div");var l,m,n=i.createElement("span"),o=108,p=16,q=function(){var c=f(),d=b(4*o);k.call(this),l=a.setTimeout(q,Math.floor(d-(f()-c)))}.bind(this),r=c(d,g.create,p);this.el.appendChild(n),r.forEach(function(a){this.el.appendChild(a.el)}.bind(this)),this.bindEvents=function(){r.forEach(function(a){a.bindEvents()})},this.setTempo=function(a){o=a},this.start=function(){this.stop(),h(),q()},this.stop=function(){l&&a.clearTimeout(l)}}var i=a.document,j=1e3,k=60;d.create=function(){return new d},g.create=function(a){return new g(a)};var l=new h(3);i.getElementById("main").appendChild(l.el),l.bindEvents(),l.start()}(this);