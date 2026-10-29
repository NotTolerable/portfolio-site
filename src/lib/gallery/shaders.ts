export const skyVertex = `varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const skyFragment = `
 uniform float time;uniform float depth;uniform vec2 resolution;uniform sampler2D auroraMap;uniform float ambientMotion;varying vec3 vDirection;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){return noise(p)*.55+noise(p*2.07+7.)*.28+noise(p*4.13+19.)*.12+noise(p*8.3)*.05;}
 void main(){
  vec3 d=normalize(vDirection);vec2 uv=gl_FragCoord.xy/resolution;
  float atmo=smoothstep(.50,.94,depth);
  float y=smoothstep(-.5,.8,d.y);
  vec3 c=mix(vec3(.002,.004,.008),vec3(.012,.024,.039),y);
  float n=fbm(d.xz*5.+time*.006);
  float beam=pow(max(0.,sin(d.x*10.+d.z*4.+n*2.+time*.01)),20.);
  c+=vec3(.016,.036,.049)*beam*smoothstep(-.2,.9,d.y)*(.28+atmo*.2);
  vec3 sky=mix(vec3(.025,.052,.088),vec3(.006,.015,.033),smoothstep(-.15,.8,d.y));
  float horizon=exp(-pow((d.y+.055)*8.,2.));
  sky+=vec3(.075,.113,.15)*horizon;
  sky+=vec3(.051,.036,.036)*exp(-pow((d.y+.08)*18.,2.));
  // A slowly drifting upper cloud deck: progressively visible on descent, never a flash.
  vec2 cloudUv=d.xz/(abs(d.y+.28)+.24)*1.1+vec2(time*.003,0.);
  float cloud=fbm(cloudUv+fbm(cloudUv*.4)*2.);
  float ridges=smoothstep(.43,.78,cloud)*(1.-smoothstep(-.4,.25,d.y));
  sky=mix(sky,vec3(.045,.076,.108)+horizon*vec3(.075,.092,.106),ridges*.62);
  c=mix(c,sky,atmo);
  float trail=texture2D(auroraMap,uv).r;
  float fold=sin(uv.x*7.+time*.04+noise(uv*vec2(4.,2.))*2.);
  float curtain=exp(-pow((uv.y-.8-fold*.07)*9.,2.));
  float fibers=.5+.5*sin(uv.x*90.+noise(uv*4.)*12.+time*.09);
  float plume=trail*(.5+noise(uv*vec2(8.,3.)+time*.02));
  c+=mix(vec3(.009,.028,.03),vec3(.021,.034,.05),atmo)*(curtain*fibers*.5+plume*2.5)*(1.-atmo*.6);
  // Stable distant stars replace the old fast meteor decoration.
  vec2 starUv=vec2(atan(d.z,d.x),asin(d.y))*310.;vec2 cell=floor(starUv);
  float star=step(.997,hash(cell))*exp(-length(fract(starUv)-.5)*14.);
  c+=vec3(.3,.43,.52)*star*(1.-atmo*.95);
  gl_FragColor=vec4(c,1.);
 }`;
export const snowVertex = `
uniform float time;uniform float moving;uniform float pixelRatio;uniform float atmosphere;attribute float seed;varying float alpha;
void main(){vec3 p=position;p.y=mod(p.y-time*(.14+seed*.24),85.)-42.5;p.x+=sin(time*.1+seed*80.)*.5;vec4 view=modelViewMatrix*vec4(p,1.);float size=(2.6+seed*7.2)*pixelRatio;gl_PointSize=clamp(size*32./max(2.,-view.z),.7,18.);alpha=(.20+seed*.40)*smoothstep(0.,4.,-view.z)*(1.-atmosphere*.75);gl_Position=projectionMatrix*view;}`;
export const snowFragment = `varying float alpha;void main(){float d=length(gl_PointCoord-.5)*2.;float core=exp(-d*d*7.);gl_FragColor=vec4(.69,.81,.87,alpha*core);}`;
export const gpuVertex = `
uniform float time;uniform float still;uniform float pixelRatio;uniform float assembly;uniform float departure;uniform vec3 cursor;attribute float seed;varying float energy;varying float opacity;
void main(){
 vec3 start=normalize(position+vec3(.001))*3.1;
 start+=vec3(sin(seed*82.),cos(seed*71.),sin(seed*45.))*(1.-assembly)*2.8;
 vec3 p=mix(start,position,assembly);
 p+=vec3(sin(seed*65.)*10.,seed*18.,cos(seed*73.)*8.)*departure;
 float wave=sin(p.y*.5+time*.8+seed*6.28)*.035*(1.-still);
 vec2 delta=p.xy-cursor.xy;float mouse=exp(-dot(delta,delta)*.15);
 float force=mouse*(1.-still);p.xy+=normalize(delta+vec2(.001))*force*.6;p.z+=wave+force*sin(seed*50.+time)*.6;
 energy=force;opacity=.65+.35*sin(seed*60.+time*.7);
 vec4 view=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp((1.2+seed*.7)*pixelRatio*25./max(1.,-view.z),.6,4.);gl_Position=projectionMatrix*view;
}`;
export const gpuFragment = `uniform float presence;varying float energy;varying float opacity;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 color=mix(vec3(.37,.8,.86),vec3(.65,.98,.93),energy);gl_FragColor=vec4(color,(.12+opacity*.18)*(1.-smoothstep(.1,.5,d))*presence);}`;
export const gradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    travel: { value: 0 },
    resolution: { value: { x: 1, y: 1 } },
  },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float time;uniform float travel;varying vec2 vUv;
float random(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 uv=vUv;vec2 shift=(uv-.5)*travel*.0025;vec3 c=texture2D(tDiffuse,uv).rgb;c.r=texture2D(tDiffuse,uv+shift).r;c.b=texture2D(tDiffuse,uv-shift).b;float vignette=1.-.26*pow(length((uv-.5)*1.4),1.5);c*=vignette;c+=(random(uv*1400.+mod(time,100.))-.5)*.0005;gl_FragColor=vec4(c,1.);}`,
};
