!function(a){function b(a){return p*q/a}function c(a,b){var c=[],d=0,e=r.call(arguments,2);for(d=0;a>d;d++)c.push(b.apply(null,e));return c}function d(a,b){var c=r.call(arguments,2);return a.map(function(a){return a[b].apply(a,c)})}function e(){this.el=o.createElement("span"),this.el.classList.add("sequencer-square");var a=!1;this.activate=function(){this.el.classList.add("sequencer-square-active")},this.deactivate=function(){this.el.classList.remove("sequencer-square-active")},this.toggle=function(){this.el.classList.toggle("sequencer-square-toggle"),a=!a}.bind(this),this.toggled=function(){return a},this.bindEvents=function(){this.el.addEventListener("click",this.toggle,!1)}}function f(a){return 10>a?"0"+String(a):String(a)}function g(){return(new Date).getTime()}function h(){var a=o.createElement("input");return a.type="range",a.min=0,a.max=100,a.value=50,a}function i(a,b){function f(){if(i){var a=b.createBufferSource();a.buffer=i,a.connect(j),a.noteOn(0)}}this.el=o.createElement("div");var g,i,j=b.createGainNode(),k=[],l=o.createElement("input"),n=h();j.connect(b.destination),j.gain.value=n.value/100,l.type="file",k=c(a,e.create),this.el.appendChild(n),k.forEach(function(a){this.el.appendChild(a.el)}.bind(this)),this.el.appendChild(l),this.bindEvents=function(){d(k,"bindEvents"),l.addEventListener("change",function(){m(l.files[0],b,function(a){i=a})}),n.addEventListener("change",function(){j.gain.value=n.value/100})},this.setActive=function(a){g&&g.deactivate(),g=k[a],g&&(g.activate(),g.toggled()&&f())},this.clearActive=function(){g&&g.classList.remove("sequencer-square-active"),g=void 0}}function j(e){function h(){m=0,d(t,"setActive"),j()}function j(){n.innerHTML=f(Math.floor(m/4)+1)+" - "+f(m%4+1)}function k(){t.forEach(function(a){a.setActive(m)}),j.call(this),m=(m+1)%r}this.el=o.createElement("div");var l,m,n=o.createElement("span"),p=108,q=new a.webkitAudioContext,r=16,s=function(){var c=g(),d=b(4*p);k.call(this),l=a.setTimeout(s,Math.floor(d-(g()-c)))}.bind(this),t=c(e,i.create,r,q);this.el.appendChild(n),t.forEach(function(a){this.el.appendChild(a.el)}.bind(this)),this.bindEvents=function(){d(t,"bindEvents")},this.setTempo=function(a){p=a},this.start=function(){this.stop(),s()},this.stop=function(){h(),l&&a.clearTimeout(l)}}function k(a,b){return a.target.classList.contains(b)}function l(b,c){var d=new a.FileReader;d.onload=function(){c(d.result)},d.readAsArrayBuffer(b)}function m(a,b,c){l(a,function(a){b.decodeAudioData(a,c)})}function n(a,b){this.el=a,this.bindEvents=function(){this.el.addEventListener("click",function(a){k(a,"js-play")?b.start():k(a,"js-stop")&&b.stop()}),this.el.addEventListener("change",function(a){k(a,"js-tempo")&&b.setTempo(parseInt(a.target.value,10))})}}var o=a.document,p=1e3,q=60,r=Array.prototype.slice;e.create=function(){return new e},i.create=function(a,b){return new i(a,b)};var s=new j(3),t=new n(o.getElementById("controls"),s);o.getElementById("main").appendChild(s.el),s.bindEvents(),t.bindEvents(),a.controller=s}(this);