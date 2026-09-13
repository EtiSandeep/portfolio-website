import{q as p,t as k}from"./useQuality-B8FRyPIp.js";import{r as i,j as e,c as T}from"./react-D1MasUqb.js";import{C as E,u as N,V as w,a as A,m as F,A as M,b as B,c as C}from"./rng-B_lquSDw.js";const S={void:"#05070A",shadow:"#0A0F15",smoke:"#141B23",beam:"#F4EEE1",amber:"#E7B271",ember:"#C8462E",emberText:"#E0674C",title:"#F6F3ED",caption:"#A2AAB4",dim:"#8E96A1"},R=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,z=`
precision highp float;

uniform vec3 uVoid;
uniform vec3 uShadow;
uniform vec3 uSmoke;
uniform vec3 uBeam;
uniform vec3 uAmber;
uniform float uTime;
uniform float uAspect;
uniform vec2 uDrift;      // pointer parallax, -1..1
uniform float uExposure;
uniform vec2 uResolution;

varying vec2 vUv;

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

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += valueNoise(p) * amp;
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}

/**
 * One shaft. Cast from a source off the edge of frame, spreading as it travels, thinning as
 * it goes, and broken up by haze drifting across it — which is the part that sells it as air
 * rather than a gradient.
 */
float shaft(vec2 p, vec2 origin, float angle, float spread, float reach, float haze) {
  vec2 d = p - origin;
  float dist = length(d);
  if (dist < 0.0001) return 1.0;

  float a = atan(d.y, d.x) - angle;
  a = atan(sin(a), cos(a));   // wrap to -pi..pi so the shaft never seams

  // Across the shaft: a wedge with an actual boundary.
  //
  // A Gaussian was the obvious choice and it is the wrong one. Widen it and the frame turns
  // milky; narrow it and there is nothing to see. What makes a shaft read is that it *ends*
  // somewhere — light and not-light with a soft but definite line between — so the profile
  // is a flat core falling off over the outer half of its width.
  float width = spread * (1.0 + dist * 0.08);
  float across = 1.0 - smoothstep(width * 0.45, width, abs(a));

  // Along it: light runs out.
  float along = exp(-dist / reach);

  // Haze drifting through the beam, slower and larger than the grain that comes later.
  // Sampled with the aspect put back so it does not stretch on a wide frame.
  vec2 flow = vec2(uTime * 0.013, uTime * -0.006);
  float dust = 0.62 + 0.55 * fbm(p * vec2(uAspect, 1.0) * 3.4 + flow + origin * 3.0);
  dust = mix(1.0, dust, haze);

  return across * along * dust;
}

void main() {
  // Screen space, from gl_FragCoord — deliberately not from vUv.
  //
  // The quad this runs on is sized generously so it always covers the frustum, which means
  // its uvs span only the middle fraction of 0..1 on screen. Reading position from them
  // silently confines the whole image to a sliver of its own coordinate space: light placed
  // at the edges of frame simply never gets evaluated. Framebuffer coordinates do not care
  // how big the geometry is.
  //
  // And in the *unit* frame, not an aspect-corrected one. Correcting for aspect keeps angles
  // true but lets the composition slide: the same beam that rakes down the outer third of a
  // laptop marches straight through the middle of a phone. Placing it in fractions of the
  // frame keeps the picture the same shape everywhere and only bends the angles, which for
  // stylised light is the trade worth making.
  vec2 p = gl_FragCoord.xy / uResolution - 0.5;
  p += uDrift * 0.035;

  // The ground state stays essentially black. Most of a title frame is unlit, and the light
  // only reads as light because there is so little of it.
  float lift = smoothstep(-0.75, 0.7, p.y);
  vec3 col = mix(uVoid, uShadow, lift * 0.75);
  col = mix(col, uSmoke, smoothstep(0.45, 1.05, lift) * 0.3);

  // The sources sit just off the edge of frame, not far outside it. Put them further away
  // and all that crosses the picture is the beam's weak tail, which reads as a gradient
  // rather than as light coming from somewhere.
  //
  // Where the light goes is a composition decision, not a lighting one.
  //
  // Two hard shafts come down the outer thirds and leave a dark corridor through the middle
  // for the type to stand in. That gives the frame somewhere to be dramatic without ever
  // putting light behind a line of small copy — which is the fight that cannot be won by
  // tuning, only by moving the light.
  float wander = sin(uTime * 0.05) * 0.05;
  // Two compositions, crossfaded on the shape of the frame.
  //
  // Wide: shafts down the outer thirds, a dark corridor for centred type. Narrow: the same
  // light kept overhead, because a phone frame has no room beside type that runs nearly
  // edge to edge — there the only clear ground is above it.
  float wide = smoothstep(1.0, 1.5, uAspect);

  float left  = shaft(p, vec2(-0.70, 0.58), -1.093 + wander, 0.090, 1.20, 0.92);
  float right = shaft(p, vec2(0.76, 0.58), -2.114 - wander, 0.082, 1.15, 0.92);

  float browA = shaft(p, vec2(-0.74, 0.54), -0.13 + wander, 0.10, 1.4, 0.9);
  float browB = shaft(p, vec2(0.76, 0.58), -3.02 - wander, 0.085, 1.3, 0.9);

  // A shallow rake across the very top, so the corridor has a ceiling. Kept above the
  // eyebrow line rather than through it — amber behind small caption type is the one place
  // this grade runs out of contrast.
  float top = shaft(p, vec2(-0.80, 0.46), -0.10, 0.07, 1.5, 0.85);

  col += uBeam * left * 0.55 * wide;
  col += uBeam * right * 0.44 * wide;
  col += uBeam * browA * 0.5 * (1.0 - wide);
  col += uAmber * browB * 0.34 * (1.0 - wide);
  col += uAmber * top * mix(0.26, 0.19, wide);

  // The anamorphic streak. A horizontal smear off the brightest part of the frame, and cold,
  // because that is what the coating on a scope lens does to a hot highlight. It is one cue
  // and it does more to say "shot on a lens" than any amount of extra light would.
  vec3 cool = vec3(0.44, 0.64, 1.0);
  float hot = max(max(left, right), max(browA, browB));
  float streakY = 0.19 + sin(uTime * 0.05) * 0.02;
  float streak = exp(-abs(p.y - streakY) * 64.0) * exp(-abs(abs(p.x) - 0.34) * 2.6);
  col += cool * streak * hot * 0.75;

  // Fall-off to the corners. The frame should feel like it has edges.
  float r = dot(p, p) * 3.4;
  col *= 1.0 - smoothstep(0.06, 0.9, r) * 0.94;

  col *= uExposure;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,P=["void","shadow","smoke","beam","amber","ember","title","caption","dim"],m=Object.fromEntries(P.map(t=>[t,new E(S[t])])),_=()=>({uVoid:{value:m.void.clone()},uShadow:{value:m.shadow.clone()},uSmoke:{value:m.smoke.clone()},uBeam:{value:m.beam.clone()},uAmber:{value:m.amber.clone()}});function V({motion:t=1}){const a=i.useRef(),n=i.useRef(),{size:o,viewport:h}=N(),l=i.useRef(new w),v=i.useMemo(()=>({..._(),uTime:{value:0},uAspect:{value:o.width/Math.max(o.height,1)},uDrift:{value:new w},uExposure:{value:1},uResolution:{value:new w(o.width,o.height)}}),[]);A(({camera:r,clock:c,gl:f,pointer:d},s)=>{if(!n.current)return;const g=n.current.uniforms;g.uTime.value=c.elapsedTime,g.uAspect.value=o.width/Math.max(o.height,1),f.getDrawingBufferSize(g.uResolution.value);const j=Math.min(s,.1);l.current.x+=(d.x-l.current.x)*j*1.4*t,l.current.y+=(d.y-l.current.y)*j*1.4*t,g.uDrift.value.copy(l.current),a.current&&(a.current.position.copy(r.position),a.current.quaternion.copy(r.quaternion),a.current.translateZ(-40))});const u=h.width*16;return e.jsxs("mesh",{ref:a,frustumCulled:!1,renderOrder:-1,children:[e.jsx("planeGeometry",{args:[u,u]}),e.jsx("shaderMaterial",{ref:n,vertexShader:R,fragmentShader:z,uniforms:v,depthWrite:!1,depthTest:!1})]})}const G=`
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aSeed;
attribute float aScale;

varying float vGlow;
varying float vSeed;

void main() {
  vec3 pos = position;

  // A slow convection: everything rises and wanders, nothing repeats on a beat you can see.
  float t = uTime * 0.045;
  pos.y += sin(t * 0.9 + aSeed * 6.283) * 0.55 + t * 0.35;
  pos.x += sin(t * 0.7 + aSeed * 12.9) * 0.42;
  pos.z += cos(t * 0.6 + aSeed * 9.4) * 0.38;

  // Recirculate rather than run out, so the field never empties.
  pos.y = mod(pos.y + 9.0, 18.0) - 9.0;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // Only motes actually crossing the key catch anything. A field that all glows is snow.
  float inBeam = smoothstep(-2.5, 4.0, pos.y - pos.x * 0.55);
  inBeam *= inBeam;
  float depth = smoothstep(26.0, 6.0, -mv.z);
  vGlow = inBeam * depth;
  vSeed = aSeed;

  gl_PointSize = uSize * aScale * uPixelRatio * (9.0 / max(-mv.z, 3.0));
  gl_Position = projectionMatrix * mv;
}
`,D=`
uniform vec3 uBeam;
uniform vec3 uAmber;
uniform float uTime;

varying float vGlow;
varying float vSeed;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d) * 4.0;
  if (r > 1.0) discard;

  // Soft core, long tail — a mote is mostly halo.
  float alpha = pow(1.0 - r, 2.2);

  // A slow twinkle, out of phase per mote, so the field breathes.
  float flicker = 0.72 + 0.28 * sin(uTime * 1.6 + vSeed * 31.4);

  vec3 col = mix(uBeam, uAmber, fract(vSeed * 7.13) * 0.7);

  gl_FragColor = vec4(col, alpha * vGlow * flicker * 0.5);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function W({count:t=1400,motion:a=1,pixelRatio:n=1.5}){const o=i.useRef(),{positions:h,seeds:l,scales:v}=i.useMemo(()=>{const r=F(20260913),c=new Float32Array(t*3),f=new Float32Array(t),d=new Float32Array(t);for(let s=0;s<t;s++)c[s*3]=(r()-.5)*34,c[s*3+1]=(r()-.5)*18,c[s*3+2]=-r()*26-1,f[s]=r(),d[s]=.3+r()*r()*1.5;return{positions:c,seeds:f,scales:d}},[t]),u=i.useMemo(()=>({uTime:{value:0},uSize:{value:11},uPixelRatio:{value:n},uBeam:{value:m.beam.clone()},uAmber:{value:m.amber.clone()}}),[n]);return A(({clock:r})=>{o.current&&(o.current.uniforms.uTime.value=r.elapsedTime*a)}),e.jsxs("points",{frustumCulled:!1,children:[e.jsxs("bufferGeometry",{children:[e.jsx("bufferAttribute",{attach:"attributes-position",args:[h,3]}),e.jsx("bufferAttribute",{attach:"attributes-aSeed",args:[l,1]}),e.jsx("bufferAttribute",{attach:"attributes-aScale",args:[v,1]})]}),e.jsx("shaderMaterial",{ref:o,vertexShader:G,fragmentShader:D,uniforms:u,transparent:!0,depthWrite:!1,blending:M})]})}function q({quality:t}){const{motion:a,particles:n,dpr:o}=t,h=Array.isArray(o)?o[1]:1.5;return e.jsxs(e.Fragment,{children:[e.jsx(V,{motion:a}),e.jsx(W,{count:n,motion:a,pixelRatio:h})]})}function I({quality:t}){return e.jsx(B,{style:{position:"fixed",inset:0},dpr:t.dpr,camera:{fov:38,near:.1,far:140,position:[0,0,12]},gl:{alpha:!1,antialias:!0,powerPreference:"high-performance",stencil:!1},onCreated:({gl:a})=>{a.toneMapping=C,a.toneMappingExposure=1.05},children:e.jsx(i.Suspense,{fallback:null,children:e.jsx(q,{quality:t})})})}const x=12,y=(t,a=2)=>String(t).padStart(a,"0");function O({reel:t="01",slate:a="MAIN TITLE",children:n}){const o=i.useRef(null);return i.useEffect(()=>{let h=0,l=0;const v=performance.now(),u=r=>{if(h=requestAnimationFrame(u),r-l<1e3/x||(l=r,!o.current))return;const c=(r-v)/1e3,f=Math.floor(c*x)%x,d=Math.floor(c)%60,s=Math.floor(c/60)%60;o.current.textContent=`01:${y(s)}:${y(d)}:${y(f)}`};return h=requestAnimationFrame(u),()=>cancelAnimationFrame(h)},[]),e.jsxs("div",{className:"frame",children:[e.jsx("div",{className:"frame-weave",children:n}),e.jsx("div",{className:"frame-grain","aria-hidden":"true"}),e.jsx("div",{className:"frame-vignette","aria-hidden":"true"}),e.jsxs("div",{className:"bar bar--top","aria-hidden":"true",children:[e.jsxs("span",{className:"burn burn--left",children:[e.jsx("i",{className:"dot"})," REEL ",t]}),e.jsx("span",{className:"burn burn--right",children:"SCOPE 2.39:1"})]}),e.jsxs("div",{className:"bar bar--bottom","aria-hidden":"true",children:[e.jsx("span",{className:"burn burn--left",ref:o,children:"01:00:00:00"}),e.jsx("span",{className:"burn burn--right",children:a})]})]})}const b=t=>({initial:{opacity:0,y:6},animate:{opacity:1,y:0},transition:{duration:.001,delay:t}}),U=t=>({initial:{scaleX:0},animate:{scaleX:1},transition:{duration:.5,delay:t,ease:[.16,1,.3,1]}});function L(){return e.jsxs("div",{className:"card",children:[e.jsx(p.p,{...b(.2),className:"card-above",children:"A portfolio in six reels"}),e.jsx(p.h1,{className:"card-name",initial:{opacity:0,letterSpacing:"0.62em",filter:"blur(6px)"},animate:{opacity:1,letterSpacing:"0.045em",filter:"blur(0px)"},transition:{duration:1.5,delay:.45,ease:[.16,1,.3,1]},children:"Sandeep Eti"}),e.jsx(p.span,{...U(1.2),className:"card-rule","aria-hidden":"true"}),e.jsxs(p.p,{...b(1.45),className:"card-role",children:["Principal Engineer ",e.jsx("em",{children:"·"})," Solution Architect"]}),e.jsxs(p.p,{...b(1.7),className:"card-stack",children:[".NET platforms ",e.jsx("em",{children:"—"})," cloud infrastructure ",e.jsx("em",{children:"—"})," the AI systems layered on top"]}),e.jsxs(p.div,{...b(2),className:"card-actions",children:[e.jsx("a",{className:"key",href:"#work",children:"View the work"}),e.jsx("a",{className:"key key--ghost",href:"#contact",children:"Get in touch"})]})]})}function $(){const t=k();return e.jsxs(O,{reel:"01",slate:"Main title",children:[e.jsx(I,{quality:t}),e.jsx(L,{})]})}Object.entries(S).forEach(([t,a])=>{document.documentElement.style.setProperty(`--${t}`,a)});T.createRoot(document.getElementById("cinema-root")).render(e.jsx(i.StrictMode,{children:e.jsx($,{})}));
