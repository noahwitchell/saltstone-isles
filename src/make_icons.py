# Home-screen icon: the Puddle Jumper climbing right in front of a big low sunset sun, game-style cumulus along the
# horizon, and the sun's reflection broken up on the sea. Drawn smooth at high res, then knocked down to a 64 px grid
# with a small palette and an ink outline round the plane, and scaled back up with hard pixels.
import os,math,random
from PIL import Image,ImageDraw
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
S=1024;G=64;HOR=.68
hx=lambda h:tuple(int(h[i:i+2],16) for i in (1,3,5))
def lerpc(a,b,t):t=max(0,min(1,t));return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
INK=hx('#241c2e')
# ---- background: sky, sun, clouds, sea ----
bg=Image.new('RGB',(S,S));d=ImageDraw.Draw(bg)
stops=[(0,hx('#262a70')),(.3,hx('#6a52a0')),(.5,hx('#c46a9a')),(.6,hx('#ff9868')),(HOR,hx('#ffb070'))]
for y in range(int(S*HOR)+1):
  t=y/S
  for (a,ca),(b,cb) in zip(stops,stops[1:]):
    if a<=t<=b:d.line([(0,y),(S,y)],fill=lerpc(ca,cb,(t-a)/(b-a)));break
sx,sy,sr=.5*S,.66*S,.4*S
for y in range(int(sy-sr),int(S*HOR)+1):
  w=math.sqrt(max(0,sr*sr-(y-sy)**2));t=(y-(sy-sr))/(sr*1.6)
  d.line([(sx-w,y),(sx+w,y)],fill=lerpc(hx('#ffe08a'),hx('#ff9a4a'),t))
for y in range(int(S*HOR),S):
  t=(y-S*HOR)/(S*(1-HOR));d.line([(0,y),(S,y)],fill=lerpc(hx('#4a5a9a'),hx('#1f2a5c'),t))
# reflection: broken horizontal streaks of sun color, widest near the horizon, under the sun
random.seed(7)
y=S*HOR+14
while y<S-20:
  t=(y-S*HOR)/(S*(1-HOR));half=sr*(.85-t*.45);x=sx-half
  while x<sx+half:
    L=random.uniform(.06,.22)*S*(1-t*.4);g=random.uniform(.02,.08)*S
    if random.random()<.8:
      h=max(16,int(26*(1-t*.4)))
      d.rounded_rectangle([x,y,min(x+L,sx+half),y+h],radius=h//2,fill=lerpc(hx('#ffe08a'),hx('#ff9a4a'),t*.8+random.uniform(-.1,.1)))
    x+=L+g
  y+=random.uniform(44,60)*(1+t*.4)
for x0,x1,yy in [(.03,.15,HOR+.04),(.84,.96,HOR+.06),(.08,.18,HOR+.12),(.86,.97,HOR+.15)]:
  d.rounded_rectangle([x0*S,yy*S,x1*S,yy*S+12],radius=6,fill=hx('#9a5a90'))
# game-style cumulus: flat bases, puffs towering in the middle, lit warm on top, mauve underneath
def cloud(cx,base,w,h,seed):
  r=random.Random(seed);puffs=[]
  for k in range(9):
    u=(k/8-.5)*w;hh=h*(1-abs(u)/(w*.62))*r.uniform(.7,1.05);rad=max(h*.32,hh*.62)
    puffs.append((cx+u,base-hh*.55,rad))
  for px,py,pr in puffs:d.ellipse([px-pr,py-pr,px+pr,py+pr],fill=hx('#f2b6a8'))
  for px,py,pr in puffs:d.ellipse([px-pr*.86,py-pr*.98,px+pr*.86,py+pr*.7],fill=hx('#ffe2c8'))
  for px,py,pr in puffs[2:7]:d.ellipse([px-pr*.5,py-pr*.95,px+pr*.4,py-pr*.2],fill=hx('#fff4e6'))
  top=min(py+pr*.4 for px,py,pr in puffs)
  d.rounded_rectangle([cx-w*.6,base-h*.16,cx+w*.6,base+h*.08],radius=int(h*.1),fill=hx('#d88e9e'))   # flat shaded base
cloud(.08*S,.62*S,.32*S,.12*S,1)
cloud(.93*S,.6*S,.28*S,.11*S,2)
# repaint the sky below those cloud bases down to the low band, then the low band itself
cloud(.16*S,.672*S,.4*S,.07*S,3)
cloud(.88*S,.672*S,.34*S,.065*S,4)
d.rectangle([0,S*HOR-2,S,S*HOR+6],fill=hx('#ffd8a0'))
# ---- the plane, on its own layer ----
pl=Image.new('RGBA',(S,S),(0,0,0,0));p=ImageDraw.Draw(pl)
L=.74*S;cx,cy=.48*S,.4*S;ang=math.radians(16)
def T(pts):return [(cx+(x*math.cos(ang)-y*math.sin(ang))*L,cy-(x*math.sin(ang)+y*math.cos(ang))*L) for x,y in pts]
CREAM,CREAM2,RED,GLASS,DARK=hx('#f6ecd6'),hx('#d6c3a0'),hx('#d2493c'),hx('#46608a'),hx('#3a3440')
p.polygon(T([(-.47,.24),(-.40,.24),(-.29,.07),(-.46,.04)]),fill=RED)
p.polygon(T([(.44,.055),(.31,.075),(.19,.125),(-.06,.115),(-.45,.055),(-.45,.005),(-.05,-.075),(.22,-.09),(.44,-.065)]),fill=CREAM)
p.polygon(T([(.44,-.015),(.1,-.025),(-.42,.02),(-.42,.05),(.1,.02),(.44,.03)]),fill=RED)
p.polygon(T([(.27,.07),(.2,.11),(.06,.11),(.06,.04),(.25,.035)]),fill=GLASS)
p.polygon(T([(-.06,.11),(.26,.12),(.26,.17),(-.06,.16)]),fill=CREAM)
p.polygon(T([(.18,.12),(.26,.12),(.26,.17),(.18,.165)]),fill=RED)
p.polygon(T([(-.47,.035),(-.3,.045),(-.3,.07),(-.47,.06)]),fill=CREAM2)
p.line(T([(.13,-.07),(.05,.115)]),fill=DARK,width=12)
p.line(T([(.2,-.085),(.25,-.19)]),fill=DARK,width=14)
c=T([(.25,-.2)])[0];wr=.05*L;p.ellipse([c[0]-wr,c[1]-wr,c[0]+wr,c[1]+wr],fill=DARK)
p.polygon(T([(.44,.055),(.5,.03),(.5,-.04),(.44,-.065)]),fill=RED)
p.line(T([(.515,.15),(.515,-.16)]),fill=DARK,width=14)
# ---- down to the 64 px grid ----
small=bg.resize((G,G),Image.BOX).quantize(colors=44,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
ps=pl.resize((G,G),Image.BOX);px=ps.load();out=small.load()
mask=[[px[x,y][3]>110 for x in range(G)] for y in range(G)]
for y in range(G):
  for x in range(G):
    if not mask[y][x] and any(0<=x+dx<G and 0<=y+dy<G and mask[y+dy][x+dx] for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):out[x,y]=INK
for y in range(G):
  for x in range(G):
    if mask[y][x]:r,g_,b,a=px[x,y];k=255/a;out[x,y]=(min(255,int(r*k)),min(255,int(g_*k)),min(255,int(b*k)))
for name,size in [('docs/icon-v3-192.png',192),('docs/icon-v3-512.png',512),('docs/apple-touch-icon-v3.png',192)]:
  small.resize((size,size),Image.NEAREST).save(name)
os.makedirs('screenshots',exist_ok=True)
small.resize((640,640),Image.NEAREST).save('screenshots/Icon_v2_preview.png')
print('icons written')
