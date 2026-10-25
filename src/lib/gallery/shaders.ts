export const skyVertex = `varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const skyFragment = `
 uniform float time;uniform float depth;uniform vec2 resolution;uniform sampler2D auroraMap;uniform float ambientMotion;varying vec3 vDirection;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float meteor(vec2 uv,vec2 start,vec2 end,float phase){
  if(phase>1.15||ambientMotion<.5)return 0.;
  float t=phase/1.15;vec2 direction=normalize(end-start);vec2 head=mix(start,end,t);vec2 delta=uv-head;float along=dot(delta,direction);float segment=clamp(along,-.13,0.);float distance=length(delta-direction*segment);float tail=smoothstep(-.13,0.,along)*step(along,.006);float fade=sin(t*3.14159265);return (exp(-distance*distance*180000.)*.65+exp(-distance*distance*11000.)*.08)*tail*fade;
 }
 void main(){
  vec3 d=normalize(vDirection);vec2 uv=gl_FragCoord.xy/resolution;
  float y=smoothstep(-.65,.8,d.y);vec3 low=mix(vec3(.009,.022,.045),vec3(.001,.005,.009),depth);vec3 high=mix(vec3(.048,.105,.178),vec3(.006,.025,.033),depth);vec3 c=mix(low,high,y);
  float n=noise(d.xz*5.+time*.008);float beam=pow(max(0.,sin(d.x*12.+d.z*6.+n*1.8+time*.015)),18.);c+=vec3(.055,.11,.15)*beam*smoothstep(-.1,.9,d.y)*.35;c*=mix(.36,.12,depth);
  float trail=texture2D(auroraMap,uv).r;
  float fold=sin(uv.x*9.+time*.06+noise(uv*vec2(4.,2.))*2.);
  float curtain=exp(-pow((uv.y-.78-fold*.075)*10.,2.));
  float fibers=.55+.45*sin(uv.x*80.+noise(uv*4.)*12.+time*.12);
  float plume=trail*(.45+noise(uv*vec2(8.,3.)+time*.025));
  c+=mix(vec3(.009,.019,.03),vec3(.01,.04,.035),depth*.6+trail*.25)*(curtain*fibers*.24+plume*2.4);
  float star=meteor(uv,vec2(.92,.95),vec2(.45,.64),mod(time+12.,17.))+meteor(uv,vec2(.68,.9),vec2(.28,.7),mod(time+5.,23.));
  c+=vec3(.35,.55,.7)*star;
  gl_FragColor=vec4(c,1.);
 }`;
export const snowVertex = `
uniform float time;uniform float moving;uniform float pixelRatio;attribute float seed;varying float alpha;
void main(){vec3 p=position;p.y=mod(p.y-time*(.14+seed*.24),85.)-42.5;p.x+=sin(time*.1+seed*80.)*.5;vec4 view=modelViewMatrix*vec4(p,1.);float size=(3.+seed*9.8)*pixelRatio;gl_PointSize=clamp(size*28./max(2.,-view.z),.7,18.);alpha=(.34+seed*.6)*smoothstep(0.,4.,-view.z);gl_Position=projectionMatrix*view;}`;
export const snowFragment = `varying float alpha;void main(){float d=length(gl_PointCoord-.5)*2.;float core=exp(-d*d*7.);gl_FragColor=vec4(.69,.81,.87,alpha*core);}`;
export const cpuVertex = `
uniform float time;uniform float still;uniform float pixelRatio;uniform vec3 cursor;uniform vec3 swimmer;attribute float seed;varying float energy;varying float opacity;
void main(){vec3 p=position;float wave=sin(p.y*.5+time*.8+seed*6.28)*.06*(1.-still);vec2 delta=p.xy-cursor.xy;float mouse=exp(-dot(delta,delta)*.045);vec3 fd=p-swimmer;float wake=exp(-dot(fd,fd)*.035)*1.4;float force=max(mouse,wake)*(1.-still);p.xy+=normalize(delta+vec2(.001))*force*(1.+sin(time+seed*30.)*.3);p.z+=wave+force*sin(seed*50.+time)*1.4;energy=force;opacity=.5+.5*sin(seed*60.+time*.7);vec4 view=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp((1.3+seed*.8)*pixelRatio*23./(-view.z),.5,4.);gl_Position=projectionMatrix*view;}`;
export const cpuFragment = `varying float energy;varying float opacity;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 color=mix(vec3(.9,.95,1.),vec3(.26,.85,.79),energy);gl_FragColor=vec4(color,(.45+opacity*.35)*smoothstep(.5,.1,d));}`;
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
