# Home-screen icon: a big top-down cream-and-red plane on a sunset disc, drawn on a 32 px grid and scaled up with hard pixels.
import zlib,struct,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
N=32
INK=(36,28,46);CREAM=(246,236,214);CREAM2=(214,198,170);RED=(210,73,60);GLASS=(70,96,130);BG1=(42,40,84);BG2=(226,112,63);SUN=(255,211,107)
g=[[None]*N for _ in range(N)]
for y in range(N):
  for x in range(N):
    t=y/(N-1);c=tuple(int(BG1[i]+(BG2[i]-BG1[i])*t) for i in range(3))
    if (x-15.5)**2+(y-17)**2<11.5**2:c=SUN if (x-15.5)**2+(y-17)**2<10.5**2 else (255,180,90)
    g[y][x]=c
plane=set();col={}
def R(x0,y0,x1,y1,c):
  for y in range(y0,y1+1):
    for x in range(x0,x1+1):plane.add((x,y));col[(x,y)]=c
R(2,11,29,14,CREAM);R(2,14,29,14,CREAM2);R(2,11,4,14,RED);R(27,11,29,14,RED)   # wing with red tips
R(13,5,18,25,CREAM);R(14,9,17,10,GLASS)                                          # fuselage + windshield
R(14,4,17,5,RED);R(15,3,16,3,INK);R(10,2,21,2,INK)                              # spinner + prop
R(9,23,22,25,CREAM);R(9,23,10,25,RED);R(21,23,22,25,RED);R(15,21,16,27,RED)      # tailplane + fin
R(13,15,18,15,RED)                                                               # cheat line
for (x,y) in list(plane):
  for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
    p=(x+dx,y+dy)
    if p not in plane and 0<=p[0]<N and 0<=p[1]<N:g[p[1]][p[0]]=INK
for (x,y),c in col.items():g[y][x]=c
for (x,y) in [(x+1,y+1) for (x,y) in plane]:  # soft drop shadow
  if (x,y) not in plane and 0<=x<N and 0<=y<N and g[y][x]!=INK:g[y][x]=tuple(int(v*.7) for v in g[y][x])
def png(path,S):
  k=S//N;raw=b''
  for y in range(S):
    row=b'\x00'+b''.join(bytes(g[min(N-1,y//k)][min(N-1,x//k)]) for x in range(S));raw+=row
  ch=lambda t,d:struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
  open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',S,S,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw,9))+ch(b'IEND',b''))
png('docs/icon-192.png',192);png('docs/icon-512.png',512);png('docs/apple-touch-icon.png',192)
print('icons written')
