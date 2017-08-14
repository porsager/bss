!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.b=e()}(this,function(){"use strict";function t(e){return e.hasOwnProperty("width")?e:t(Object.getPrototypeOf(e))}function e(t,e){return t.indexOf(e,t.length-e.length)>-1}function n(t){return t.charAt(0).toLowerCase()+t.slice(1)}function r(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])}function i(t){return t.replace(/-([a-z])/g,function(t){return t[1].toUpperCase()})}function o(t){return t.replace(/([A-Z])/g,"-$1").toLowerCase()}function u(t){return t.charAt(0)+(t.match(/([A-Z])/g)||[]).join("").toLowerCase()}function c(t){var e=u(t),n=S[e]&&S[e]!==t?t:e;return E[n]=t,n}function a(t){return Object.keys(t).sort().map(function(e){return e.replace(/CLASS_NAME/g,t[e])}).join("")}function f(t){var e=[],n=[],r=!1;return Object.keys(t).forEach(function(i){"@"===i.charAt(0)?(e.push([i,t[i]]),delete t[i]):" "===i.charAt(0)||":"===i.charAt(0)?(n.push([i,t[i]]),delete t[i]):r=!0}),(r?l(".CLASS_NAME",t):"")+n.map(function(t){return l(".CLASS_NAME"+t[0],t[1])}).join("")+e.map(function(t){return t[0]+"{"+l(".CLASS_NAME",t[1])+"}"}).join("")}function l(t,e){return t+"{"+s("string"==typeof e?p(e):e.style||e)+"}"}function s(t){return t=d(t),Object.keys(t).map(function(e){return g(t,e)}).join("")}function d(t){return Object.keys(t).reduce(function(e,n){var r=t[n];return r||0===r||""===r?("content"===n&&'"'!==r.charAt(0)?e[n]='"'+r+'"':e[n in L?L[n]:n]=b(n,r),e):e},{})}function p(t){return t.indexOf(";")>-1?y(t):h(t)}function y(t){return t.split(";").reduce(function(t,e){var n=e.trim().split(":"),r=n[0],o=n[1];return r&&o&&(t[i(r.trim())]=o.trim()),t},{})}function h(t){return t.split("\n").reduce(function(t,e){var n=e.trim().split(" ");if(n.length>1){var r=i(n.shift().trim());t[E[r]||r]=n.join(" ").trim()}return t},{})}function m(t){throw new Error("not implemented")}function g(t,e){return(M.test(e)?"-":"")+o(e)+":"+t[e]+";"}function b(t,e){return e+(!isNaN(e)&&$.indexOf(t)>-1?"px":"")}function v(){R=!1,N.textContent=T+a(z)}function j(t){T+=String(t),O()}function A(t){var e=f(t);if(e in z)return z[e];var n=B+ ++_;return z[e]=n,O(),n}function O(){R||(R=!0,Z.resolve().then(v))}function w(t){var e=arguments;if(Array.isArray(t)&&Array.isArray(t.raw))arguments[0]={raw:arguments[0]},r(w.style,p(String.raw.apply(null,arguments)));else for(var n=0;n<arguments.length;n++)"string"==typeof e[n]?r(w.style,p(e[n])):"object"==typeof e[n]&&r(w.style,e[n].style||e[n]);return x(w)}function x(t){if(t!==w)return t;var e=Object.create(w,{style:{value:w.style}});return w.style={},e}function k(t){return function(e){return this.style[t]=void 0!==e&&e,x(this)}}var S={ai:"alignItems",b:"bottom",bc:"backgroundColor",br:"borderRadius",bs:"boxShadow",c:"color",d:"display",f:"float",fd:"flexDirection",ff:"fontFamily",fs:"fontSize",h:"height",jc:"justifyContent",l:"left",m:"margin",mb:"marginBottom",ml:"marginLeft",mr:"marginRight",mt:"marginTop",o:"opacity",p:"padding",pb:"paddingBottom",pl:"paddingLeft",pr:"paddingRight",pt:"paddingTop",r:"right",t:"top",ta:"textAlign",td:"textDecoration",tt:"textTransform",w:"width"},E=Object.create(null),C=Object.keys(t(document.documentElement.style)).filter(function(t){return"string"==typeof document.documentElement.style[t]}),L=Object.create(null,{}),M=/^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/,P=window.navigator.userAgent.indexOf("Edge")>-1,$=function(){var t=document.createElement("div");return C.filter(function(n){try{t.style[n]="1px",t.style.setProperty(n,"1px")}catch(t){return}return e(!P&&t.style[n]||t.style.getPropertyValue(n),"px")}).concat("gridGap")}(),N=document.createElement("style"),z=Object.create(null,{}),T="",_=0,R=!1,Z=window.Promise||{resolve:function(){return{then:function(t){return setTimeout(t,0)}}}};document.head.appendChild(N);var B="b"+("000"+(46656*Math.random()|0).toString(36)).slice(-3)+("000"+(46656*Math.random()|0).toString(36)).slice(-3),D=0,U={},W=["active","any","checked","default","disabled","empty","enabled","first","first-child","first-of-type","fullscreen","focus","hover","indeterminate","in-range","invalid","last-child","last-of-type","left","link","only-child","only-of-type","optional","out-of-range","read-only","read-write","required","right","root","scope","target","valid","visited","dir","lang","not","nth-child","nth-last-child","nth-last-of-type","nth-of-type","after","before","first-letter","first-line","selection","backdrop","placeholder","marker","spelling-error","grammar-error"];return w.style={},w.toString=function(){return"."+this.class},w.forceUpdate=v,w.$keyframes=function(t){var e=Object.keys(t).map(function(e){return l(e,t[e].style||t[e])}).join("");if(e in U)return U[e];var n=B+ ++D;return U[e]=n,j("@keyframes "+n+"{"+e+"}"),n},w.prepend=j,w.helper=function(t,e){return 1===arguments.length?m(t):"object"==typeof e?(delete w[t],void Object.defineProperty(w,t,{get:function(){return r(this.style,e.style||e),x(this)}})):void(w[t]=function(){var t=e.apply(null,arguments);return r(this.style,t.style),x(this)})},w.css=function(t,e){j(l(t,e.style||e))},C.forEach(function(t){if(M.test(t)){var e=n(t.replace(M,"$2"));if(-1===C.indexOf(e))return L[e]=t,void(w[e]=w[c(e)]=k(t))}w[t]=w[c(t)]=k(t)}),Object.defineProperty(w,"class",{get:function(){return A(this.style)}}),w.$media=function(t,e){return this.style["@media "+t]=e.style,x(this)},w.$nest=function(t,e){return this.style[(0===t.indexOf(":")?"":" ")+t]=e.style,x(this)},W.forEach(function(t){return w["$"+i(t)]=function(e,n){return this.style[":"+t+(n?"("+e+")":"")]=n?n.style:e.style,x(this)}}),w.helper("$animate",function(t,e){return w.animation(w.$keyframes(e)+" "+t)}),w});
//# sourceMappingURL=bss.js.map
