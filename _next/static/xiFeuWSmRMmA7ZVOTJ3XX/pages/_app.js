(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{"+iuc":function(n,e,t){t("wgeU"),t("FlQf"),t("bBy9"),t("B9jh"),t("dL40"),t("xvv9"),t("V+O7"),n.exports=t("WEpk").Set},"/0+H":function(n,e,t){"use strict";var o=t("hfKm"),r=this&&this.__importDefault||function(n){return n&&n.__esModule?n:{default:n}};o(e,"__esModule",{value:!0});var i=r(t("q1tI")),a=t("lwAK");function c(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=n.ampFirst,t=void 0!==e&&e,o=n.hybrid,r=void 0!==o&&o,i=n.hasQuery;return t||r&&(void 0!==i&&i)}e.isInAmpMode=c,e.useAmp=function(){return c(i.default.useContext(a.AmpStateContext))}},0:function(n,e,t){t("74v/"),n.exports=t("nOHt")},"0tVQ":function(n,e,t){t("FlQf"),t("VJsP"),n.exports=t("WEpk").Array.from},"2PDY":function(n,e){n.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}},"4mXO":function(n,e,t){n.exports=t("7TPF")},"74v/":function(n,e,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/_app",function(){return t("cha2")}])},"7TPF":function(n,e,t){t("AUvm"),n.exports=t("WEpk").Object.getOwnPropertySymbols},"7m0m":function(n,e,t){var o=t("Y7ZC"),r=t("uplh"),i=t("NsO/"),a=t("vwuL"),c=t("IP1Z");o(o.S,"Object",{getOwnPropertyDescriptors:function(n){for(var e,t,o=i(n),u=a.f,l=r(o),s={},f=0;l.length>f;)void 0!==(t=u(o,e=l[f++]))&&c(s,e,t);return s}})},"8Kt/":function(n,e,t){"use strict";var o=t("ttDY"),r=t("hfKm"),i=this&&this.__importDefault||function(n){return n&&n.__esModule?n:{default:n}};r(e,"__esModule",{value:!0});var a=i(t("q1tI")),c=i(t("Xuae")),u=t("lwAK"),l=t("FYa8"),s=t("/0+H");function f(){var n=arguments.length>0&&void 0!==arguments[0]&&arguments[0],e=[a.default.createElement("meta",{charSet:"utf-8"})];return n||e.push(a.default.createElement("meta",{name:"viewport",content:"width=device-width,minimum-scale=1,initial-scale=1"})),e}function p(n,e){return"string"===typeof e||"number"===typeof e?n:e.type===a.default.Fragment?n.concat(a.default.Children.toArray(e.props.children).reduce((function(n,e){return"string"===typeof e||"number"===typeof e?n:n.concat(e)}),[])):n.concat(e)}e.defaultHead=f;var d=["name","httpEquiv","charSet","itemProp"];function m(n,e){return n.reduce((function(n,e){var t=a.default.Children.toArray(e.props.children);return n.concat(t)}),[]).reduce(p,[]).reverse().concat(f(e.inAmpMode)).filter(function(){var n=new o,e=new o,t=new o,r={};return function(i){var a=!0;if(i.key&&"number"!==typeof i.key&&i.key.indexOf("$")>0){var c=i.key.slice(i.key.indexOf("$")+1);n.has(c)?a=!1:n.add(c)}switch(i.type){case"title":case"base":e.has(i.type)?a=!1:e.add(i.type);break;case"meta":for(var u=0,l=d.length;u<l;u++){var s=d[u];if(i.props.hasOwnProperty(s))if("charSet"===s)t.has(s)?a=!1:t.add(s);else{var f=i.props[s],p=r[s]||new o;p.has(f)?a=!1:(p.add(f),r[s]=p)}}}return a}}()).reverse().map((function(n,e){var t=n.key||e;return a.default.cloneElement(n,{key:t})}))}var h=c.default();function v(n){var e=n.children;return a.default.createElement(u.AmpStateContext.Consumer,null,(function(n){return a.default.createElement(l.HeadManagerContext.Consumer,null,(function(t){return a.default.createElement(h,{reduceComponentsToState:m,handleStateChange:t,inAmpMode:s.isInAmpMode(n)},e)}))}))}v.rewind=h.rewind,e.default=v},"8iia":function(n,e,t){var o=t("QMMT"),r=t("RRc/");n.exports=function(n){return function(){if(o(this)!=n)throw TypeError(n+"#toJSON isn't generic");return r(this)}}},B9jh:function(n,e,t){"use strict";var o=t("Wu5q"),r=t("n3ko");n.exports=t("raTm")("Set",(function(n){return function(){return n(this,arguments.length>0?arguments[0]:void 0)}}),{add:function(n){return o.def(r(this,"Set"),n=0===n?0:n,n)}},o)},IP1Z:function(n,e,t){"use strict";var o=t("2faE"),r=t("rr1i");n.exports=function(n,e,t){e in n?o.f(n,e,r(0,t)):n[e]=t}},PQJW:function(n,e,t){var o=t("d04V"),r=t("yLu3");n.exports=function(n){if(r(Object(n))||"[object Arguments]"===Object.prototype.toString.call(n))return o(n)}},"RRc/":function(n,e,t){var o=t("oioR");n.exports=function(n,e){var t=[];return o(n,!1,t.push,t,e),t}},TbGu:function(n,e,t){var o=t("fGSI"),r=t("PQJW"),i=t("2PDY");n.exports=function(n){return o(n)||r(n)||i()}},"V+O7":function(n,e,t){t("aPfg")("Set")},VJsP:function(n,e,t){"use strict";var o=t("2GTP"),r=t("Y7ZC"),i=t("JB68"),a=t("sNwI"),c=t("NwJ3"),u=t("tEej"),l=t("IP1Z"),s=t("fNZA");r(r.S+r.F*!t("TuGD")((function(n){Array.from(n)})),"Array",{from:function(n){var e,t,r,f,p=i(n),d="function"==typeof this?this:Array,m=arguments.length,h=m>1?arguments[1]:void 0,v=void 0!==h,g=0,b=s(p);if(v&&(h=o(h,m>2?arguments[2]:void 0,2)),void 0==b||d==Array&&c(b))for(t=new d(e=u(p.length));e>g;g++)l(t,g,v?h(p[g],g):p[g]);else for(f=b.call(p),t=new d;!(r=f.next()).done;g++)l(t,g,v?a(f,h,[r.value,g],!0):r.value);return t.length=g,t}})},Wu5q:function(n,e,t){"use strict";var o=t("2faE").f,r=t("oVml"),i=t("XJU/"),a=t("2GTP"),c=t("EXMj"),u=t("oioR"),l=t("MPFp"),s=t("UO39"),f=t("TJWN"),p=t("jmDH"),d=t("6/1s").fastKey,m=t("n3ko"),h=p?"_s":"size",v=function(n,e){var t,o=d(e);if("F"!==o)return n._i[o];for(t=n._f;t;t=t.n)if(t.k==e)return t};n.exports={getConstructor:function(n,e,t,l){var s=n((function(n,o){c(n,s,e,"_i"),n._t=e,n._i=r(null),n._f=void 0,n._l=void 0,n[h]=0,void 0!=o&&u(o,t,n[l],n)}));return i(s.prototype,{clear:function(){for(var n=m(this,e),t=n._i,o=n._f;o;o=o.n)o.r=!0,o.p&&(o.p=o.p.n=void 0),delete t[o.i];n._f=n._l=void 0,n[h]=0},delete:function(n){var t=m(this,e),o=v(t,n);if(o){var r=o.n,i=o.p;delete t._i[o.i],o.r=!0,i&&(i.n=r),r&&(r.p=i),t._f==o&&(t._f=r),t._l==o&&(t._l=i),t[h]--}return!!o},forEach:function(n){m(this,e);for(var t,o=a(n,arguments.length>1?arguments[1]:void 0,3);t=t?t.n:this._f;)for(o(t.v,t.k,this);t&&t.r;)t=t.p},has:function(n){return!!v(m(this,e),n)}}),p&&o(s.prototype,"size",{get:function(){return m(this,e)[h]}}),s},def:function(n,e,t){var o,r,i=v(n,e);return i?i.v=t:(n._l=i={i:r=d(e,!0),k:e,v:t,p:o=n._l,n:void 0,r:!1},n._f||(n._f=i),o&&(o.n=i),n[h]++,"F"!==r&&(n._i[r]=i)),n},getEntry:v,setStrong:function(n,e,t){l(n,e,(function(n,t){this._t=m(n,e),this._k=t,this._l=void 0}),(function(){for(var n=this._k,e=this._l;e&&e.r;)e=e.p;return this._t&&(this._l=e=e?e.n:this._t._f)?s(0,"keys"==n?e.k:"values"==n?e.v:[e.k,e.v]):(this._t=void 0,s(1))}),t?"entries":"values",!t,!0),f(e)}}},XoMD:function(n,e,t){n.exports=t("hYAz")},Xuae:function(n,e,t){"use strict";var o=t("/HRN"),r=t("ZDA2"),i=t("/+P4"),a=t("K47E"),c=t("WaGi"),u=t("N9n2"),l=t("TbGu"),s=t("ttDY");t("hfKm")(e,"__esModule",{value:!0});var f=t("q1tI"),p=!1;e.default=function(){var n,e=new s;function t(t){n=t.props.reduceComponentsToState(l(e),t.props),t.props.handleStateChange&&t.props.handleStateChange(n)}return function(l){function s(n){var c;return o(this,s),c=r(this,i(s).call(this,n)),p&&(e.add(a(c)),t(a(c))),c}return u(s,l),c(s,null,[{key:"rewind",value:function(){var t=n;return n=void 0,e.clear(),t}}]),c(s,[{key:"componentDidMount",value:function(){e.add(this),t(this)}},{key:"componentDidUpdate",value:function(){t(this)}},{key:"componentWillUnmount",value:function(){e.delete(this),t(this)}},{key:"render",value:function(){return null}}]),s}(f.Component)}},cha2:function(n,e,t){"use strict";t.r(e);var o=t("q1tI"),r=t.n(o),i=(t("1DEj"),t("8Kt/")),a=t.n(i),c=t("CjxU"),u=t("cOp2"),l=t.n(u),s=t("qKvR"),f=t("mf32");function p(){var n=l()(['\n  html {\n    line-height: 1.15;\n    -webkit-text-size-adjust: 100%;\n  }\n\n  body {\n    margin: 0;\n  }\n\n  main {\n    display: block;\n  }\n\n  h1 {\n    font-size: 2em;\n    margin: 0.67em 0;\n  }\n\n  hr {\n    box-sizing: content-box;\n    height: 0;\n    overflow: visible;\n  }\n\n  pre {\n    font-family: monospace, monospace;\n    font-size: 1em;\n  }\n\n  a {\n    background-color: transparent;\n  }\n\n  abbr[title] {\n    border-bottom: none;\n    text-decoration: underline;\n    -webkit-text-decoration: underline dotted;\n    text-decoration: underline dotted;\n  }\n\n  b,\n  strong {\n    font-weight: bolder;\n  }\n\n  code,\n  kbd,\n  samp {\n    font-family: monospace, monospace;\n    font-size: 1em;\n  }\n\n  small {\n    font-size: 80%;\n  }\n\n  sub,\n  sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n\n  sub {\n    bottom: -0.25em;\n  }\n\n  sup {\n    top: -0.5em;\n  }\n\n  img {\n    border-style: none;\n  }\n\n  button,\n  input,\n  optgroup,\n  select,\n  textarea {\n    font-family: inherit;\n    font-size: 100%;\n    line-height: 1.15;\n    margin: 0;\n  }\n\n  button,\n  input {\n    overflow: visible;\n  }\n\n  button,\n  select {\n    text-transform: none;\n  }\n\n  button::-moz-focus-inner,\n  [type="button"]::-moz-focus-inner,\n  [type="reset"]::-moz-focus-inner,\n  [type="submit"]::-moz-focus-inner {\n    border-style: none;\n    padding: 0;\n  }\n\n  fieldset {\n    padding: 0.35em 0.75em 0.625em;\n  }\n\n  legend {\n    box-sizing: border-box;\n    color: inherit;\n    display: table;\n    max-width: 100%;\n    padding: 0;\n    white-space: normal;\n  }\n\n  progress {\n    vertical-align: baseline;\n  }\n\n  textarea {\n    overflow: auto;\n  }\n\n  [type="checkbox"],\n  [type="radio"] {\n    box-sizing: border-box;\n    padding: 0;\n  }\n\n  [type="number"]::-webkit-inner-spin-button,\n  [type="number"]::-webkit-outer-spin-button {\n    -webkit-appearance: none !important;\n  }\n\n  input[type="number"] {\n    -moz-appearance: textfield;\n  }\n\n  [type="search"] {\n    -webkit-appearance: textfield;\n    outline-offset: -2px;\n  }\n\n  [type="search"]::-webkit-search-decoration {\n    -webkit-appearance: none !important;\n  }\n\n  ::-webkit-file-upload-button {\n    -webkit-appearance: button;\n    font: inherit;\n  }\n\n  details {\n    display: block;\n  }\n\n  summary {\n    display: list-item;\n  }\n\n  template {\n    display: none;\n  }\n\n  [hidden] {\n    display: none !important;\n  }\n\n  html {\n    box-sizing: border-box;\n    font-family: sans-serif;\n  }\n\n  *,\n  *::before,\n  *::after {\n    box-sizing: border-box;\n  }\n\n  blockquote,\n  dl,\n  dd,\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6,\n  hr,\n  figure,\n  p,\n  pre {\n    margin: 0;\n  }\n\n  button {\n    background: transparent;\n    padding: 0;\n  }\n\n  fieldset {\n    margin: 0;\n    padding: 0;\n  }\n\n  ol,\n  ul {\n    margin: 0;\n    padding: 0;\n  }\n\n  html {\n    font-family: ',';\n    line-height: 1.5;\n    -webkit-font-smoothing: antialiased;\n    -webkit-text-size-adjust: 100%;\n    text-rendering: optimizelegibility;\n  }\n\n  hr {\n    border-top-width: 1px;\n  }\n\n  img {\n    border-style: solid;\n  }\n\n  textarea {\n    resize: vertical;\n  }\n\n  button,\n  [role="button"] {\n    cursor: pointer;\n  }\n\n  button::-moz-focus-inner {\n    border: 0 !important;\n  }\n\n  table {\n    border-collapse: collapse;\n  }\n\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n\n  a {\n    color: inherit;\n    text-decoration: inherit;\n  }\n\n  button,\n  input,\n  optgroup,\n  select,\n  textarea {\n    padding: 0;\n    line-height: inherit;\n    color: inherit;\n  }\n\n  pre,\n  code,\n  kbd,\n  samp {\n    font-family: ',";\n  }\n\n  img,\n  svg,\n  video,\n  canvas,\n  audio,\n  iframe,\n  embed,\n  object {\n    display: block;\n    vertical-align: middle;\n  }\n\n  img,\n  video {\n    max-width: 100%;\n    height: auto;\n  }\n"]);return p=function(){return n},n}var d=function(n){return Object(s.c)(p(),n.fonts.body,n.fonts.mono)};function m(){var n=l()(["\n      html {\n        line-height: 1.5;\n        color: ",";\n        background-color: ",";\n      }\n\n      /**\n      * Allow adding a border to an element by just adding a border-width.\n      */\n\n      *,\n      *::before,\n      *::after {\n        border-width: 0;\n        border-style: solid;\n        border-color: ",";\n      }\n\n      input:-ms-input-placeholder,\n      textarea:-ms-input-placeholder {\n        color: ",";\n      }\n\n      input::-ms-input-placeholder,\n      textarea::-ms-input-placeholder {\n        color: ",";\n      }\n\n      input::placeholder,\n      textarea::placeholder {\n        color: ",";\n      }\n    "]);return m=function(){return n},n}var h=function(n){return{light:{color:n.colors.gray[800],bg:void 0,borderColor:n.colors.gray[200],placeholderColor:n.colors.gray[400]},dark:{color:n.colors.whiteAlpha[900],bg:n.colors.gray[800],borderColor:n.colors.whiteAlpha[300],placeholderColor:n.colors.whiteAlpha[400]}}},v=function(n){var e=n.config,t=Object(f.a)().colorMode,o=function(n){var o=h(n),r=(e?e(n,o):h(n))[t],i=r.color,a=r.bg,c=r.borderColor,u=r.placeholderColor;return Object(s.c)(m(),i,a,c,u,u,u)};return Object(s.d)(s.a,{styles:function(n){return Object(s.c)([d(n),o(n)])}})},g=t("hfKm"),b=t.n(g),y=t("2Eek"),w=t.n(y),x=t("XoMD"),k=t.n(x),_=t("Jo+v"),z=t.n(_),A=t("4mXO"),O=t.n(A),P=t("pLtp"),C=t.n(P);function S(n,e,t){return e in n?b()(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}var E=t("uDoD");function K(n,e){var t=C()(n);if(O.a){var o=O()(n);e&&(o=o.filter((function(e){return z()(n,e).enumerable}))),t.push.apply(t,o)}return t}function j(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?K(Object(t),!0).forEach((function(e){S(n,e,t[e])})):k.a?w()(n,k()(t)):K(Object(t)).forEach((function(e){b()(n,e,z()(t,e))}))}return n}var V=j({},E.a,{colors:j({},E.a.colors,{brand:{900:"#1a365d",800:"#153e75",700:"#2a69ac"}}),fonts:{body:'"Helvetica Neue",Helvetica,Arial,sans-serif',heading:"titling-gothic-fb-wide, sans-serif",mono:"Menlo, monospace"}}),D=r.a.createElement;e.default=function(n){var e=n.Component,t=n.pageProps;return D(r.a.Fragment,null,D(a.a,null,D("link",{rel:"stylesheet",href:"https://use.typekit.net/jdf3knn.css"}),D("link",{rel:"apple-touch-icon",sizes:"180x180",href:"/apple-touch-icon.png"}),D("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/favicon-32x32.png"}),D("link",{rel:"icon",type:"image/png",sizes:"16x16",href:"/favicon-16x16.png"}),D("link",{rel:"manifest",href:"/site.webmanifest"}),D("title",null,"VK20 | Visualizing Democracy"),D("meta",{name:"description",content:"Visualizing Knowledge is a one-day conference that brings together a diverse group of practitioners to discuss data visualization from multiple perspectives. VK20 invites you into a collective exploration of democracy and the role of knowledge visualization in democracy.  "}),D("meta",{itemProp:"name",content:"VK20 | Visualizing Democracy"}),D("meta",{itemProp:"description",content:"Visualizing Knowledge is a one-day conference that brings together a diverse group of practitioners to discuss data visualization from multiple perspectives. VK20 invites you into a collective exploration of democracy and the role of knowledge visualization in democracy.  "}),D("meta",{itemProp:"image",content:"/meta-data.png"}),D("meta",{property:"og:url",content:"https://vizknowledge.aalto.fi"}),D("meta",{property:"og:type",content:"website"}),D("meta",{property:"og:title",content:"VK20 | Visualizing Democracy"}),D("meta",{property:"og:description",content:"Visualizing Knowledge is a one-day conference that brings together a diverse group of practitioners to discuss data visualization from multiple perspectives. VK20 invites you into a collective exploration of democracy and the role of knowledge visualization in democracy.  "}),D("meta",{property:"og:image",content:"/meta-data.png"}),D("meta",{name:"twitter:card",content:"summary_large_image"}),D("meta",{name:"twitter:title",content:"VK20 | Visualizing Democracy"}),D("meta",{name:"twitter:description",content:"Visualizing Knowledge is a one-day conference that brings together a diverse group of practitioners to discuss data visualization from multiple perspectives. VK20 invites you into a collective exploration of democracy and the role of knowledge visualization in democracy.  "}),D("meta",{name:"twitter:image",content:"/meta-data.png"})),D(c.a,{theme:V},D(v,null),D(e,t)))}},d04V:function(n,e,t){n.exports=t("0tVQ")},dL40:function(n,e,t){var o=t("Y7ZC");o(o.P+o.R,"Set",{toJSON:t("8iia")("Set")})},fGSI:function(n,e,t){var o=t("p0XB");n.exports=function(n){if(o(n)){for(var e=0,t=new Array(n.length);e<n.length;e++)t[e]=n[e];return t}}},hYAz:function(n,e,t){t("7m0m"),n.exports=t("WEpk").Object.getOwnPropertyDescriptors},lwAK:function(n,e,t){"use strict";var o=t("hfKm"),r=this&&this.__importStar||function(n){if(n&&n.__esModule)return n;var e={};if(null!=n)for(var t in n)Object.hasOwnProperty.call(n,t)&&(e[t]=n[t]);return e.default=n,e};o(e,"__esModule",{value:!0});var i=r(t("q1tI"));e.AmpStateContext=i.createContext({})},ttDY:function(n,e,t){n.exports=t("+iuc")},uplh:function(n,e,t){var o=t("ar/p"),r=t("mqlF"),i=t("5K7Z"),a=t("5T2Y").Reflect;n.exports=a&&a.ownKeys||function(n){var e=o.f(i(n)),t=r.f;return t?e.concat(t(n)):e}},xvv9:function(n,e,t){t("cHUd")("Set")}},[[0,1,2,0,4,3,10]]]);