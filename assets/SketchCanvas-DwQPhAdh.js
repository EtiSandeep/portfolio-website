import{r as i,j as o,c as ut}from"./react-D1MasUqb.js";import{C as ve,u as ue,a as V,V as Ue,d as v,M as F,B as ht,e as pt,m as He,f as Ke,Q as Ce,D as dt,P as qe,O as Ze,F as ft,b as mt}from"./rng-B_lquSDw.js";import{S as J,s as me,p as Oe,a as Z,b as Se}from"./main-CUNVykBE.js";import"./useQuality-B8FRyPIp.js";const q={paper:{ground:"#F4EDDC",groundShade:"#D8C9AC",stroke:"#1F1D1A",strokeSoft:"#4A443C",accent:"#1B4F91",accentWarm:"#A33822",keyLight:.82},slate:{ground:"#1B2320",groundShade:"#101614",stroke:"#EDE7D8",strokeSoft:"#B9B3A4",accent:"#8FC8E8",accentWarm:"#E5B96E",keyLight:.68}},gt={sun:"paper",moon:"slate"},X=["ground","groundShade","stroke","strokeSoft","accent","accentWarm"],Me=["keyLight"],yt=e=>{const r={};return X.forEach(t=>{r[t]=new ve(e[t])}),Me.forEach(t=>{r[t]=e[t]}),r},g=yt(q.paper),Ye={paper:Object.fromEntries(X.map(e=>[e,new ve(q.paper[e])])),slate:Object.fromEntries(X.map(e=>[e,new ve(q.slate[e])]))},Qe=e=>gt[e]??(q[e]?e:"paper");function xt(e,r){const t=Qe(e),n=q[t];X.forEach(s=>g[s].lerp(Ye[t][s],r)),Me.forEach(s=>{g[s]+=(n[s]-g[s])*r})}function vt(e){const r=Qe(e),t=q[r];X.forEach(n=>g[n].copy(Ye[r][n])),Me.forEach(n=>{g[n]=t[n]})}function je(e){e&&(e.uPaper&&e.uPaper.value.copy(g.ground),e.uPaperShade&&e.uPaperShade.value.copy(g.groundShade),e.uInk&&e.uInk.value.copy(g.stroke),e.uInkSoft&&e.uInkSoft.value.copy(g.strokeSoft),e.uAccent&&e.uAccent.value.copy(g.accent),e.uAccentWarm&&e.uAccentWarm.value.copy(g.accentWarm),e.uKeyLight&&(e.uKeyLight.value=g.keyLight))}const Te=()=>({uInk:{value:g.stroke.clone()},uPaper:{value:g.ground.clone()},uPaperShade:{value:g.groundShade.clone()},uAccent:{value:g.accent.clone()},uKeyLight:{value:g.keyLight}});function jt({theme:e}){const{scene:r}=ue(),t=i.useRef();return i.useLayoutEffect(()=>{vt(e)},[]),V((n,s)=>{xt(e,1-Math.exp(-2*Math.min(s,.1))),t.current&&t.current.copy(g.ground),r.backgroundIntensity=1}),o.jsx("color",{ref:t,attach:"background",args:["#F4EDDC"]})}const he=`
// Cheap value noise. Used to wobble lines rather than to shade anything, so it does not
// need to be smooth or expensive.
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/**
 * The bare surface: stock colour with its fibre showing. Solids fill themselves with this
 * too, so a drawing that has faded out is indistinguishable from the sheet behind it.
 */
vec3 paperTone(vec2 frag, vec3 paper, vec3 shade) {
  float fibre = valueNoise(frag * 0.9) * 0.5 + valueNoise(frag * 0.11) * 0.5;
  return mix(paper, shade, fibre * 0.30);
}

/**
 * One layer of hatching. Returns 1 on a stroke and 0 between strokes.
 * wobble bends the ruling so the strokes drift the way a hand would.
 */
float hatchLayer(vec2 frag, float angle, float spacing, float weight, float wobble) {
  float s = sin(angle), c = cos(angle);
  vec2 r = vec2(frag.x * c - frag.y * s, frag.x * s + frag.y * c);

  // Bend the line, and vary its thickness along its length, so strokes taper.
  r.y += (valueNoise(r * 0.012) - 0.5) * wobble;
  float thickness = weight * (0.72 + 0.56 * valueNoise(r.yx * 0.05));

  float d = abs(fract(r.y / spacing) - 0.5) * spacing;
  return 1.0 - smoothstep(thickness * 0.5, thickness * 0.5 + 0.9, d);
}

/**
 * Builds up tone from light (1 = lit, 0 = dark) using progressively more hatch layers.
 * Returns ink coverage in 0..1.
 */
float hatchTone(vec2 frag, float light, float scale) {
  float ink = 0.0;
  float sp = 7.0 * scale;

  if (light < 0.92) ink = max(ink, hatchLayer(frag, 0.72, sp, 1.15, 26.0) * smoothstep(0.92, 0.72, light));
  if (light < 0.68) ink = max(ink, hatchLayer(frag, -0.68, sp * 0.94, 1.2, 22.0) * smoothstep(0.68, 0.48, light));
  if (light < 0.44) ink = max(ink, hatchLayer(frag, 1.48, sp * 0.86, 1.25, 18.0) * smoothstep(0.44, 0.26, light));
  if (light < 0.22) ink = max(ink, hatchLayer(frag, 0.12, sp * 0.78, 1.35, 14.0) * smoothstep(0.22, 0.04, light));

  return clamp(ink, 0.0, 1.0);
}

/**
 * Distance falls off as the pen lifting: strokes thin out and the drawing dissolves back
 * into the sheet. It stands in for aerial perspective, and it keeps the set pieces of other
 * sections from crowding the one you are actually reading.
 */
float inkFade(float depth) {
  return 1.0 - smoothstep(16.0, 26.0, depth);
}
`,kt=`
uniform float uThickness;
uniform float uTime;

varying float vDepth;

${he}

void main() {
  // Vary the swell along the silhouette so the contour breathes like a drawn line.
  float jitter = 0.78 + 0.44 * valueNoise(position.xy * 2.4 + uTime * 0.05);
  vec3 swollen = position + normal * uThickness * jitter;
  vec4 mv = modelViewMatrix * vec4(swollen, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,wt=`
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uPaperShade;

varying float vDepth;

${he}

void main() {
  vec3 sheet = paperTone(gl_FragCoord.xy, uPaper, uPaperShade);
  gl_FragColor = vec4(mix(sheet, uInk, inkFade(vDepth)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,St=`
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vDepth;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,Mt=`
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uPaperShade;
uniform vec3 uAccent;
uniform float uScale;
uniform float uAccentMix;
uniform float uKeyLight;
uniform float uLightBias;   // + for a pale surface, - for a dark one

varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vDepth;

${he}

void main() {
  vec3 n = normalize(vNormalV);
  vec3 v = normalize(vViewDir);
  vec3 lightDir = normalize(vec3(0.55, 0.8, 0.65));

  // A flatter key leaves more of the form in hatching, which is how chalk behaves.
  float light = (1.0 - uKeyLight) + uKeyLight * max(dot(n, lightDir), 0.0);

  // Not everything is made of the same stuff. A whiteboard has to come out white, or
  // whatever is drawn on it is buried under the hatching of the board itself.
  light = clamp(light + uLightBias, 0.0, 1.0);

  // Darken toward the silhouette, which is where a pen would crowd its strokes.
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  light *= 1.0 - rim * 0.55;

  float ink = hatchTone(gl_FragCoord.xy, light, uScale) * inkFade(vDepth);

  vec3 stroke = mix(uInk, uAccent, uAccentMix);
  vec3 sheet = paperTone(gl_FragCoord.xy, uPaper, uPaperShade);

  gl_FragColor = vec4(mix(sheet, stroke, ink), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,bt=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Pt=`
uniform vec3 uPaper;
uniform vec3 uPaperShade;
uniform vec3 uInk;
uniform vec2 uResolution;

varying vec2 vUv;

${he}

void main() {
  vec2 frag = gl_FragCoord.xy;

  // Fibre: fine speckle plus a slower blotch, so it does not read as uniform noise.
  vec3 col = paperTone(frag, uPaper, uPaperShade);

  // Faint ruling, the way a notebook page carries a grid you barely register.
  vec2 grid = abs(fract(frag / 46.0) - 0.5);
  float rule = 1.0 - smoothstep(0.0, 0.02, min(grid.x, grid.y));
  col = mix(col, uInk, rule * 0.045);

  // Vignette, as though the sheet curves away at the corners.
  vec2 p = (frag / uResolution - 0.5) * 2.0;
  col = mix(col, uPaperShade, smoothstep(0.75, 1.7, dot(p, p)) * 0.5);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function Et(){const e=i.useRef(),r=i.useRef(),{size:t,viewport:n}=ue(),s=i.useMemo(()=>({uPaper:{value:g.ground.clone()},uPaperShade:{value:g.groundShade.clone()},uInk:{value:g.stroke.clone()},uResolution:{value:new Ue(t.width,t.height)}}),[t.width,t.height]);V(({camera:h})=>{je(r.current?.uniforms),e.current&&(e.current.position.copy(h.position),e.current.quaternion.copy(h.quaternion),e.current.translateZ(-30))});const a=n.width*12;return o.jsxs("mesh",{ref:e,frustumCulled:!1,renderOrder:-1,children:[o.jsx("planeGeometry",{args:[a,a]}),o.jsx("shaderMaterial",{ref:r,vertexShader:bt,fragmentShader:Pt,uniforms:s,depthWrite:!1})]})}const At=e=>e*e*e*(e*(e*6-15)+10),Rt=1.6,ge=J.map(e=>new v(e.anchor[0]+e.camOffset[0],e.anchor[1]+e.camOffset[1],e.anchor[2]+e.camOffset[2])),ae=J.map(e=>new v(...e.anchor)),Ie=J.map(e=>e.pieceSide),Le=J.map(e=>e.pieceLift??0),De=(e,r,t,n)=>{e.x=F.damp(e.x,r.x,t,n),e.y=F.damp(e.y,r.y,t,n),e.z=F.damp(e.z,r.z,t,n)};function zt({motion:e=1}){const r=ue(l=>l.size),t=i.useRef(new v().copy(ge[0])),n=i.useRef(new v().copy(ae[0])),s=i.useRef(new v().copy(ae[0])),a=i.useRef(0),h=i.useRef(!1);return V(({camera:l},d)=>{const p=Math.min(d,.1),u=J.length-1,c=F.clamp(me.station,0,u),f=Math.min(Math.floor(c),u-1),S=At(F.clamp(c-f,0,1));t.current.lerpVectors(ge[f],ge[f+1],S),n.current.lerpVectors(ae[f],ae[f+1],S);const x=r.width/Math.max(r.height,1),w=F.clamp(Rt/Math.max(x,.3),1,1.75);t.current.sub(n.current).multiplyScalar(w).add(n.current);const j=r.width>=1024?3:0,D=-F.lerp(Ie[f],Ie[f+1],S)*j;t.current.x+=D,n.current.x+=D;const O=x<1?1.2:0,b=F.lerp(Le[f],Le[f+1],S)+O;t.current.y+=b,n.current.y+=b;const T=F.clamp(Math.abs(me.velocity),0,4);t.current.x+=Oe.x*.6*e,t.current.y+=Oe.y*.4*e,t.current.z+=T*.45*e,h.current||(l.position.copy(t.current),s.current.copy(n.current),h.current=!0),De(l.position,t.current,3.2,p),De(s.current,n.current,4.5,p),l.lookAt(s.current);const k=F.clamp(-me.velocity*.02,-.06,.06)*e;a.current=F.damp(a.current,k,3,p),l.rotateZ(a.current);const G=46+T*2.2*e;Math.abs(l.fov-G)>.01&&(l.fov=F.damp(l.fov,G,4,p),l.updateProjectionMatrix())}),null}function y({children:e,geometry:r,thickness:t=.035,hatchScale:n=1,accent:s=0,lightBias:a=0,spin:h=.12,sway:l=1,...d}){const p=i.useRef(),u=i.useRef(),c=i.useRef(),f=i.useRef(null),S=i.useMemo(()=>({...Te(),uScale:{value:n},uAccentMix:{value:s},uLightBias:{value:a}}),[n,s,a]),x=i.useMemo(()=>{const{uInk:w,uPaper:j,uPaperShade:M}=Te();return{uInk:w,uPaper:j,uPaperShade:M,uThickness:{value:t},uTime:{value:0}}},[t]);return V(({clock:w})=>{const j=w.elapsedTime;p.current&&(f.current||(f.current=[p.current.rotation.x,p.current.rotation.y]),p.current.rotation.y=f.current[1]+j*h,p.current.rotation.x=f.current[0]+Math.sin(j*.35)*.12*l),je(u.current?.uniforms),je(c.current?.uniforms),c.current&&(c.current.uniforms.uTime.value=Math.floor(j*6)/6)}),o.jsxs("group",{ref:p,...d,children:[o.jsxs("mesh",{geometry:r,children:[e,o.jsx("shaderMaterial",{ref:u,vertexShader:St,fragmentShader:Mt,uniforms:S})]}),o.jsxs("mesh",{geometry:r,children:[e,o.jsx("shaderMaterial",{ref:c,vertexShader:kt,fragmentShader:wt,uniforms:x,side:ht})]})]})}function I({points:e,segments:r=48,jitter:t=.06,seed:n=1,passes:s=2,opacity:a=.7,accent:h=!1,closed:l=!1}){const d=i.useMemo(()=>{const u=new pt(e.map(c=>c instanceof v?c.clone():new v(...c)),l);return Array.from({length:s},(c,f)=>{const S=He(n*7919+f*104729),x=[];for(let w=0;w<=r;w++){const j=u.getPoint(w/r),M=Math.sin(w/r*Math.PI);j.x+=(S()-.5)*t*M,j.y+=(S()-.5)*t*M,j.z+=(S()-.5)*t*M,x.push(j)}return new Ke().setFromPoints(x)})},[e,r,t,n,s,l]),p=i.useRef([]);return V(()=>{const u=h?g.accent:g.stroke;p.current.forEach(c=>c&&c.color.copy(u))}),o.jsx("group",{children:d.map((u,c)=>o.jsx("line",{geometry:u,children:o.jsx("lineBasicMaterial",{ref:f=>{p.current[c]=f},transparent:!0,opacity:a*(c===0?1:.55),depthWrite:!1})},c))})}const We=1.95,K=[{key:"plan",angle:Math.PI/2,z:.35,size:.5},{key:"act",angle:0,z:-.3,size:.46,accent:.9},{key:"observe",angle:-Math.PI/2,z:.3,size:.5},{key:"reflect",angle:Math.PI,z:-.35,size:.44}],Ve=[{key:"t0",at:[2.95,.78,-.15],size:.22},{key:"t1",at:[3.2,-.04,.3],size:.26},{key:"t2",at:[2.9,-.86,-.1],size:.2}],Ge=new v(0,1,0),_e=e=>new v(Math.cos(e.angle)*We,Math.sin(e.angle)*We,e.z),$=(e,r,t,n)=>{const s=1-n;return new v(s*s*e.x+2*s*n*r.x+n*n*t.x,s*s*e.y+2*s*n*r.y+n*n*t.y,s*s*e.z+2*s*n*r.z+n*n*t.z)};function Ft({motion:e=1}){const r=i.useRef(),{edges:t,retry:n,spokes:s}=i.useMemo(()=>{const a=K.map(_e),h=K.map((x,w)=>{const j=a[w],M=a[(w+1)%K.length],D=M.clone().sub(j).normalize(),O=j.clone().add(D.clone().multiplyScalar(x.size+.22)),b=M.clone().sub(D.clone().multiplyScalar(K[(w+1)%K.length].size+.2)),T=O.clone().add(b).multiplyScalar(.5),k=T.clone().setZ(T.z).multiplyScalar(1);k.x+=T.x*.34,k.y+=T.y*.34;const G=$(O,k,b,1).sub($(O,k,b,.88)).normalize(),te=new Ce().setFromUnitVectors(Ge,G);return{key:x.key,a:O,control:k,b,path:[O.toArray(),$(O,k,b,.5).toArray(),b.toArray()],head:b.toArray(),quaternion:te.toArray(),seed:900+w}}),l=a[2],d=a[1],p=l.clone().add(new v(.42,.2,.2)),u=d.clone().add(new v(.05,-.62,.2)),c=new v(2.85,-2.75,.3),f=$(p,c,u,1).sub($(p,c,u,.86)).normalize(),S={path:[p.toArray(),$(p,c,u,.5).toArray(),u.toArray()],head:u.toArray(),quaternion:new Ce().setFromUnitVectors(Ge,f).toArray()};return{edges:h,retry:S,spokes:Ve.map(x=>({key:x.key,points:[d.clone().add(new v(.5,0,0)).toArray(),[(d.x+x.at[0])/2,(d.y+x.at[1])/2+.1,(d.z+x.at[2])/2],[x.at[0]-.3,x.at[1],x.at[2]]]}))}},[]);return V(({clock:a})=>{if(!r.current)return;const l=a.elapsedTime*.085*e%1*t.length,d=t[Math.min(Math.floor(l),t.length-1)],p=$(d.a,d.control,d.b,l-Math.floor(l));r.current.position.copy(p)}),o.jsxs("group",{position:Z("home"),rotation:[.12,-.28,0],scale:.92,children:[K.map(a=>o.jsx(y,{position:_e(a).toArray(),scale:a.size,spin:.09*e,sway:.5*e,thickness:.075,hatchScale:.82,accent:a.accent??0,children:o.jsx("dodecahedronGeometry",{args:[1,0]})},a.key)),t.map(a=>o.jsxs("group",{children:[o.jsx(I,{points:a.path,segments:44,jitter:.05,seed:a.seed,opacity:.6}),o.jsx("group",{quaternion:a.quaternion,position:a.head,children:o.jsx(y,{spin:0,sway:0,scale:.13,thickness:.14,hatchScale:.7,children:o.jsx("coneGeometry",{args:[1,2.1,10]})})})]},a.key)),o.jsx(I,{points:n.path,segments:52,jitter:.07,seed:977,opacity:.6,accent:!0}),o.jsx("group",{quaternion:n.quaternion,position:n.head,children:o.jsx(y,{spin:0,sway:0,scale:.13,thickness:.14,hatchScale:.7,accent:.9,children:o.jsx("coneGeometry",{args:[1,2.1,10]})})}),o.jsx("group",{ref:r,children:o.jsx(y,{spin:.6*e,scale:.17,thickness:.16,hatchScale:.6,accent:.9,children:o.jsx("octahedronGeometry",{args:[1,0]})})}),s.map(a=>o.jsx(I,{points:a.points,segments:24,jitter:.05,seed:990,passes:1,opacity:.4},a.key)),Ve.map(a=>o.jsx(y,{position:a.at,scale:a.size,spin:-.14*e,sway:.6*e,thickness:.11,hatchScale:.75,children:o.jsx("boxGeometry",{args:[1,1,1]})},a.key))]})}const Ct=(e,r,t=0)=>{const n=e/2,s=r/2;return[[-n,s,t],[-n*.34,s,t],[n*.34,s,t],[n,s,t],[n,s*.34,t],[n,-s*.34,t],[n,-s,t],[n*.34,-s,t],[-n*.34,-s,t],[-n,-s,t],[-n,-s*.34,t],[-n,s*.34,t]]},C=.075,Ot=[{at:[-1.25,.62,C],w:1.15,h:.6,seed:601},{at:[.5,.62,C],w:1.15,h:.6,seed:602,accent:!0},{at:[-.35,-.5,C],w:1.5,h:.66,seed:603}],Tt=[{points:[[-.66,.62,C],[-.3,.66,C],[-.09,.62,C]],seed:611},{points:[[.5,.3,C],[.3,-.02,C],[-.1,-.16,C]],seed:612},{points:[[-1.25,.3,C],[-1.1,-.02,C],[-.85,-.16,C]],seed:613}];function It({motion:e=1}){const r=i.useMemo(()=>Ot.map(t=>({...t,path:Ct(t.w,t.h,0)})),[]);return o.jsxs("group",{position:Z("about"),rotation:[.04,.3,0],children:[o.jsx(y,{position:[0,.45,0],spin:0,sway:.2*e,thickness:.024,hatchScale:1.35,lightBias:.62,children:o.jsx("boxGeometry",{args:[4,2.7,.12]})}),r.map(t=>o.jsx("group",{position:[t.at[0],t.at[1]+.45,t.at[2]],children:o.jsx(I,{points:t.path,closed:!0,segments:64,jitter:.03,seed:t.seed,opacity:.9,accent:t.accent})},t.seed)),Tt.map(t=>o.jsx(I,{points:t.points.map(([n,s,a])=>[n,s+.45,a]),segments:22,jitter:.035,seed:t.seed,passes:1,opacity:.8},t.seed)),o.jsx(y,{position:[0,-.99,.16],spin:0,sway:0,thickness:.02,hatchScale:1.5,lightBias:.2,children:o.jsx("boxGeometry",{args:[4,.12,.34]})}),o.jsx(y,{position:[-1.1,-.85,.2],rotation:[0,0,Math.PI/2],spin:0,sway:0,thickness:.02,hatchScale:1.6,accent:.7,children:o.jsx("cylinderGeometry",{args:[.06,.06,.62,12]})}),[-1.55,1.55].map(t=>o.jsx(y,{position:[t,-2.05,-.1],rotation:[.16,0,t<0?.07:-.07],spin:0,sway:0,thickness:.022,hatchScale:1.5,children:o.jsx("cylinderGeometry",{args:[.075,.075,2.1,12]})},t)),o.jsx(y,{position:[0,-2.5,-.05],spin:0,sway:0,thickness:.02,hatchScale:1.6,children:o.jsx("boxGeometry",{args:[3,.1,.1]})}),o.jsxs("group",{position:[2.55,-2.82,.5],scale:.72,children:[o.jsx(y,{spin:0,sway:0,thickness:.03,hatchScale:.95,children:o.jsx("cylinderGeometry",{args:[.4,.34,.72,32,1,!0]})}),o.jsx(y,{position:[.48,.02,0],spin:0,sway:0,thickness:.036,hatchScale:1.1,children:o.jsx("torusGeometry",{args:[.2,.058,12,28]})})]}),o.jsx(I,{points:Lt,jitter:.045,seed:623,opacity:.4})]})}const Lt=[[-3.2,-3.1,.4],[-1.1,-3.15,.4],[1.2,-3.06,.4],[3.3,-3.13,.4]],Dt=1.05;function Wt({motion:e=1}){const r=Se.experience,t=i.useMemo(()=>r.slice().reverse().map((s,a)=>{const h=a%2===0?-1:1,l=-2.6+a*Dt;return{key:`${s.role}-${s.period}`,position:[h*1.15,l,h*.35],rotation:[0,h*.28,h*.035],width:2.5-a*.06,current:a===r.length-1}}),[r]),n=i.useMemo(()=>t.map(s=>[s.position[0]*.55,s.position[1],s.position[2]*.5]),[t]);return o.jsxs("group",{position:Z("experience"),rotation:[0,.18,0],children:[t.map((s,a)=>o.jsx(y,{position:s.position,rotation:s.rotation,spin:0,sway:.35*e,thickness:.026,hatchScale:.95+a*.07,accent:s.current?.9:0,children:o.jsx("boxGeometry",{args:[s.width,.26,1.1]})},s.key)),o.jsx(I,{points:n,jitter:.09,seed:41,opacity:.55,segments:90}),o.jsx(y,{position:[n[n.length-1][0],n[n.length-1][1]+1.15,0],spin:.22*e,scale:.42,hatchScale:.85,accent:.75,children:o.jsx("octahedronGeometry",{args:[1,0]})})]})}function ke(){return ke=Object.assign?Object.assign.bind():function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var n in t)({}).hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e},ke.apply(null,arguments)}const ee=new v,be=new v,Vt=new v,Ne=new Ue;function Gt(e,r,t){const n=ee.setFromMatrixPosition(e.matrixWorld);n.project(r);const s=t.width/2,a=t.height/2;return[n.x*s+s,-(n.y*a)+a]}function _t(e,r){const t=ee.setFromMatrixPosition(e.matrixWorld),n=be.setFromMatrixPosition(r.matrixWorld),s=t.sub(n),a=r.getWorldDirection(Vt);return s.angleTo(a)>Math.PI/2}function Nt(e,r,t,n){const s=ee.setFromMatrixPosition(e.matrixWorld),a=s.clone();a.project(r),Ne.set(a.x,a.y),t.setFromCamera(Ne,r);const h=t.intersectObjects(n,!0);if(h.length){const l=h[0].distance;return s.distanceTo(t.ray.origin)<l}return!0}function Bt(e,r){if(r instanceof Ze)return r.zoom;if(r instanceof qe){const t=ee.setFromMatrixPosition(e.matrixWorld),n=be.setFromMatrixPosition(r.matrixWorld),s=r.fov*Math.PI/180,a=t.distanceTo(n);return 1/(2*Math.tan(s/2)*a)}else return 1}function $t(e,r,t){if(r instanceof qe||r instanceof Ze){const n=ee.setFromMatrixPosition(e.matrixWorld),s=be.setFromMatrixPosition(r.matrixWorld),a=n.distanceTo(s),h=(t[1]-t[0])/(r.far-r.near),l=t[1]-h*r.far;return Math.round(h*a+l)}}const we=e=>Math.abs(e)<1e-10?0:e;function Xe(e,r,t=""){let n="matrix3d(";for(let s=0;s!==16;s++)n+=we(r[s]*e.elements[s])+(s!==15?",":")");return t+n}const Ut=(e=>r=>Xe(r,e))([1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1]),Ht=(e=>(r,t)=>Xe(r,e(t),"translate(-50%,-50%)"))(e=>[1/e,1/e,1/e,1,-1/e,-1/e,-1/e,-1,1/e,1/e,1/e,1,1,1,1,1]);function Kt(e){return e&&typeof e=="object"&&"current"in e}const qt=i.forwardRef(({children:e,eps:r=.001,style:t,className:n,prepend:s,center:a,fullscreen:h,portal:l,distanceFactor:d,sprite:p=!1,transform:u=!1,occlude:c,onOcclude:f,castShadow:S,receiveShadow:x,material:w,geometry:j,zIndexRange:M=[16777271,0],calculatePosition:D=Gt,as:O="div",wrapperClass:b,pointerEvents:T="auto",...k},G)=>{const{gl:te,camera:P,scene:Pe,size:A,raycaster:Je,events:et,viewport:tt}=ue(),[E]=i.useState(()=>document.createElement(O)),pe=i.useRef(null),z=i.useRef(null),Ee=i.useRef(0),ne=i.useRef([0,0]),Y=i.useRef(null),de=i.useRef(null),U=l?.current||et.connected||te.domElement.parentNode,W=i.useRef(null),se=i.useRef(!1),re=i.useMemo(()=>c&&c!=="blending"||Array.isArray(c)&&c.length&&Kt(c[0]),[c]);i.useLayoutEffect(()=>{const R=te.domElement;c&&c==="blending"?(R.style.zIndex=`${Math.floor(M[0]/2)}`,R.style.position="absolute",R.style.pointerEvents="none"):(R.style.zIndex=null,R.style.position=null,R.style.pointerEvents=null)},[c]),i.useLayoutEffect(()=>{if(z.current){const R=pe.current=ut.createRoot(E);if(Pe.updateMatrixWorld(),u)E.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{const m=D(z.current,P,A);E.style.cssText=`position:absolute;top:0;left:0;transform:translate3d(${m[0]}px,${m[1]}px,0);transform-origin:0 0;`}return U&&(s?U.prepend(E):U.appendChild(E)),()=>{U&&U.removeChild(E),R.unmount()}}},[U,u]),i.useLayoutEffect(()=>{b&&(E.className=b)},[b]);const Ae=i.useMemo(()=>u?{position:"absolute",top:0,left:0,width:A.width,height:A.height,transformStyle:"preserve-3d",pointerEvents:"none"}:{position:"absolute",transform:a?"translate3d(-50%,-50%,0)":"none",...h&&{top:-A.height/2,left:-A.width/2,width:A.width,height:A.height},...t},[t,a,h,A,u]),nt=i.useMemo(()=>({position:"absolute",pointerEvents:T}),[T]);i.useLayoutEffect(()=>{if(se.current=!1,u){var R;(R=pe.current)==null||R.render(i.createElement("div",{ref:Y,style:Ae},i.createElement("div",{ref:de,style:nt},i.createElement("div",{ref:G,className:n,style:t,children:e}))))}else{var m;(m=pe.current)==null||m.render(i.createElement("div",{ref:G,style:Ae,className:n,children:e}))}});const H=i.useRef(!0);V(R=>{if(z.current){P.updateMatrixWorld(),z.current.updateWorldMatrix(!0,!1);const m=u?ne.current:D(z.current,P,A);if(u||Math.abs(Ee.current-P.zoom)>r||Math.abs(ne.current[0]-m[0])>r||Math.abs(ne.current[1]-m[1])>r){const _=_t(z.current,P);let L=!1;re&&(Array.isArray(c)?L=c.map(N=>N.current):c!=="blending"&&(L=[Pe]));const Q=H.current;if(L){const N=Nt(z.current,P,Je,L);H.current=N&&!_}else H.current=!_;Q!==H.current&&(f?f(!H.current):E.style.display=H.current?"block":"none");const oe=Math.floor(M[0]/2),st=c?re?[M[0],oe]:[oe-1,0]:M;if(E.style.zIndex=`${$t(z.current,P,st)}`,u){const[N,ze]=[A.width/2,A.height/2],fe=P.projectionMatrix.elements[5]*ze,{isOrthographicCamera:Fe,top:rt,left:ot,bottom:at,right:it}=P,ct=Ut(P.matrixWorldInverse),lt=Fe?`scale(${fe})translate(${we(-(it+ot)/2)}px,${we((rt+at)/2)}px)`:`translateZ(${fe}px)`;let B=z.current.matrixWorld;p&&(B=P.matrixWorldInverse.clone().transpose().copyPosition(B).scale(z.current.scale),B.elements[3]=B.elements[7]=B.elements[11]=0,B.elements[15]=1),E.style.width=A.width+"px",E.style.height=A.height+"px",E.style.perspective=Fe?"":`${fe}px`,Y.current&&de.current&&(Y.current.style.transform=`${lt}${ct}translate(${N}px,${ze}px)`,de.current.style.transform=Ht(B,1/((d||10)/400)))}else{const N=d===void 0?1:Bt(z.current,P)*d;E.style.transform=`translate3d(${m[0]}px,${m[1]}px,0) scale(${N})`}ne.current=m,Ee.current=P.zoom}}if(!re&&W.current&&!se.current)if(u){if(Y.current){const m=Y.current.children[0];if(m!=null&&m.clientWidth&&m!=null&&m.clientHeight){const{isOrthographicCamera:_}=P;if(_||j)k.scale&&(Array.isArray(k.scale)?k.scale instanceof v?W.current.scale.copy(k.scale.clone().divideScalar(1)):W.current.scale.set(1/k.scale[0],1/k.scale[1],1/k.scale[2]):W.current.scale.setScalar(1/k.scale));else{const L=(d||10)/400,Q=m.clientWidth*L,oe=m.clientHeight*L;W.current.scale.set(Q,oe,1)}se.current=!0}}}else{const m=E.children[0];if(m!=null&&m.clientWidth&&m!=null&&m.clientHeight){const _=1/tt.factor,L=m.clientWidth*_,Q=m.clientHeight*_;W.current.scale.set(L,Q,1),se.current=!0}W.current.lookAt(R.camera.position)}});const Re=i.useMemo(()=>({vertexShader:u?void 0:`
          /*
            This shader is from the THREE's SpriteMaterial.
            We need to turn the backing plane into a Sprite
            (make it always face the camera) if "transfrom"
            is false.
          */
          #include <common>

          void main() {
            vec2 center = vec2(0., 1.);
            float rotation = 0.0;

            // This is somewhat arbitrary, but it seems to work well
            // Need to figure out how to derive this dynamically if it even matters
            float size = 0.03;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec2 scale;
            scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
            scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

            bool isPerspective = isPerspectiveMatrix( projectionMatrix );
            if ( isPerspective ) scale *= - mvPosition.z;

            vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
            mvPosition.xy += rotatedPosition;

            gl_Position = projectionMatrix * mvPosition;
          }
      `,fragmentShader:`
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `}),[u]);return i.createElement("group",ke({},k,{ref:z}),c&&!re&&i.createElement("mesh",{castShadow:S,receiveShadow:x,ref:W},j||i.createElement("planeGeometry",null),w||i.createElement("shaderMaterial",{side:dt,vertexShader:Re.vertexShader,fragmentShader:Re.fragmentShader})))}),Zt=3.7,Be=["icosahedron","octahedron","tetrahedron","box","dodecahedron"],Yt=e=>{switch(e){case"octahedron":return o.jsx("octahedronGeometry",{args:[1,0]});case"tetrahedron":return o.jsx("tetrahedronGeometry",{args:[1,0]});case"box":return o.jsx("boxGeometry",{args:[1.4,1.4,1.4]});case"dodecahedron":return o.jsx("dodecahedronGeometry",{args:[1,0]});default:return o.jsx("icosahedronGeometry",{args:[1,0]})}};function Qt({motion:e=1,showLabels:r=!0}){const t=i.useMemo(()=>{const n=He(9187),s=Se.skills,a=s.length,h=Math.PI*(3-Math.sqrt(5));return s.map((l,d)=>{const p=1-d/(a-1)*2,u=Math.sqrt(Math.max(1-p*p,0)),c=h*d,f=new v(Math.cos(c)*u,p,Math.sin(c)*u).multiplyScalar(Zt*(.86+n()*.28)),S=n()>.68?.85:0;return{label:l,at:f,scale:.19+n()*.16,shape:Be[d%Be.length],spin:(n()-.5)*.5,accent:S,spoke:[[0,0,0],f.clone().multiplyScalar(.5),f.clone().multiplyScalar(.84)],seed:100+d}})},[]);return o.jsxs("group",{position:Z("skills"),children:[o.jsx(y,{spin:.09*e,scale:.9,hatchScale:.8,thickness:.04,children:o.jsx("icosahedronGeometry",{args:[1,1]})}),t.map(n=>o.jsxs("group",{children:[o.jsx(I,{points:n.spoke,segments:26,jitter:.12,seed:n.seed,opacity:.4,accent:n.accent>0}),o.jsxs("group",{position:n.at.toArray(),children:[o.jsx(y,{scale:n.scale,spin:n.spin*e,hatchScale:.75,thickness:.055,accent:n.accent,children:Yt(n.shape)}),r&&o.jsx(qt,{center:!0,position:[0,n.scale+.4,0],zIndexRange:[20,0],style:{pointerEvents:"none",userSelect:"none"},children:o.jsx("span",{className:"skill-star",children:n.label})})]})]},n.label))]})}const $e=[{position:[-1.85,1.25,.3],rotation:[.04,.34,-.05],size:[2.7,1.85]},{position:[1.75,1.55,-.4],rotation:[-.05,-.28,.06],size:[2.5,1.7]},{position:[-1.95,-1.45,-.2],rotation:[.06,.22,.04],size:[2.55,1.75]},{position:[1.9,-1.2,.45],rotation:[-.03,-.36,-.06],size:[2.65,1.8]}];function Xt({motion:e=1}){const r=i.useMemo(()=>Se.projects.slice(0,$e.length).map((t,n)=>({...$e[n],key:t.title,index:n})),[]);return o.jsx("group",{position:Z("projects"),rotation:[0,-.1,0],children:r.map(t=>o.jsxs("group",{position:t.position,rotation:t.rotation,children:[o.jsx(y,{spin:0,sway:.4*e,thickness:.022,hatchScale:1.25,accent:t.index===0?.8:0,children:o.jsx("boxGeometry",{args:[t.size[0],t.size[1],.075]})}),o.jsx(y,{position:[0,t.size[1]/2-.16,.11],spin:0,sway:0,scale:.1,thickness:.1,hatchScale:.6,accent:.95,children:o.jsx("sphereGeometry",{args:[1,14,12]})}),[.28,.02,-.24].map((n,s)=>o.jsx(I,{points:[[-t.size[0]/2+.32,n,.05],[0,n-.02,.05],[t.size[0]/2-(s===2?1.1:.32),n,.05]],segments:22,jitter:.035,seed:t.index*31+s,passes:1,opacity:.42},n))]},t.key))})}const ie=[0,0,1.75],ce=[0,0,-.9],le=[0,-.34,-.95],ye=[-1.1,.07,-.85],xe=[1.1,.07,-.85],Jt=()=>{const e=[[ie,ye,ce],[ie,ce,xe],[ie,le,ye],[ie,xe,le],[ce,ye,le],[ce,le,xe]],r=[0,-.05,.1],t=e.map(([s,a,h])=>{const l=[a[0]-s[0],a[1]-s[1],a[2]-s[2]],d=[h[0]-s[0],h[1]-s[1],h[2]-s[2]],p=[l[1]*d[2]-l[2]*d[1],l[2]*d[0]-l[0]*d[2],l[0]*d[1]-l[1]*d[0]],u=[(s[0]+a[0]+h[0])/3,(s[1]+a[1]+h[1])/3,(s[2]+a[2]+h[2])/3],c=[u[0]-r[0],u[1]-r[1],u[2]-r[2]];return p[0]*c[0]+p[1]*c[1]+p[2]*c[2]>0?[s,a,h]:[s,h,a]}),n=new Ke;return n.setAttribute("position",new ft(t.flat(2),3)),n.computeVertexNormals(),n};function en({motion:e=1}){const r=i.useMemo(()=>Jt(),[]),t=i.useRef(),n=i.useMemo(()=>[[-7.6,-1.8,1.6],[-5.4,2.2,-.4],[-2,4.3,.6],[2,4.5,.2],[5.6,2.4,1.2],[7.5,-1.4,.4]],[]);return V(({clock:s})=>{if(!t.current)return;const a=s.elapsedTime*.16*e,h=(a%1+1)%1,l=Math.min(Math.floor(h*(n.length-1)),n.length-2),d=h*(n.length-1)-l,p=n[l],u=n[l+1];t.current.position.set(p[0]+(u[0]-p[0])*d,p[1]+(u[1]-p[1])*d+Math.sin(a*12)*.05,p[2]+(u[2]-p[2])*d),t.current.rotation.y=Math.atan2(u[0]-p[0],u[2]-p[2]),t.current.rotation.z=-Math.sin(a*6.2)*.14,t.current.rotation.x=-(u[1]-p[1])*.28}),o.jsxs("group",{position:Z("contact"),children:[o.jsx("group",{ref:t,children:o.jsx(y,{geometry:r,spin:0,sway:0,scale:.95,thickness:.022,hatchScale:2.1,accent:.3})}),o.jsx(I,{points:n,segments:110,jitter:.07,seed:57,opacity:.22,passes:1}),o.jsx(y,{geometry:r,position:[-6.4,-2.9,-1.2],rotation:[.2,.9,.3],spin:0,sway:.6*e,scale:.72,thickness:.03,hatchScale:2.3}),o.jsx(y,{geometry:r,position:[6.5,-3.1,-.9],rotation:[-.15,-1.1,-.25],spin:0,sway:.5*e,scale:.64,thickness:.032,hatchScale:2.3})]})}function tn({theme:e,quality:r}){const{motion:t,tier:n}=r;return o.jsxs(o.Fragment,{children:[o.jsx(jt,{theme:e}),o.jsx(zt,{motion:t}),o.jsx(Et,{}),o.jsx(Ft,{motion:t}),o.jsx(It,{motion:t}),o.jsx(Wt,{motion:t}),o.jsx(Qt,{motion:t,showLabels:n!=="low"}),o.jsx(Xt,{motion:t}),o.jsx(en,{motion:t})]})}function an({theme:e,quality:r}){return o.jsx(mt,{dpr:r.dpr,camera:{fov:46,near:.1,far:140,position:[0,.4,9.5]},gl:{alpha:!1,antialias:!0,powerPreference:"high-performance",stencil:!1,depth:!0},children:o.jsx(i.Suspense,{fallback:null,children:o.jsx(tn,{theme:e,quality:r})})})}export{an as default};
