#!/usr/bin/python
################################################################################
#      ____               __          __  _      _____ _       _               #
#     / __ \              \ \        / / | |    / ____| |     | |              #
#    | |  | |_ __   ___ _ __ \  /\  / /__| |__ | |  __| | ___ | |__   ___      #
#    | |  | | '_ \ / _ \ '_ \ \/  \/ / _ \ '_ \| | |_ | |/ _ \| '_ \ / _ \     #
#    | |__| | |_) |  __/ | | \  /\  /  __/ |_) | |__| | | (_) | |_) |  __/     #
#     \____/| .__/ \___|_| |_|\/  \/ \___|_.__/ \_____|_|\___/|_.__/ \___|     #
#           | |                                                                #
#           |_|                                                                #
#                                                                              #
#                            3D Object Converter                               #
#                               Version 1.0.1                                  #
#                                                                              #
#                              (c) 2010-2011 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           martin.christen@fhnw.ch                            #
################################################################################
#     Licensed under MIT License. Read the file LICENSE for more information   @
################################################################################

import urllib2
import sys
import os
import os.path
import tarfile
import re
import glob


if len(sys.argv) < 2:
   print('usage:\n')
   print('--source wavefront.obj')
   print('--calccenter')
   print('--flipxy')
   print('--integer')
   print('\nexample: obj2json.py --source bla.obj --calccenter')
   sys.exit()
   

filename = ""
bSource = 0
bCalccenter = 0
bFlipxy = 0
bInteger = 0

id = 1
lng = 0
lat = 0
elv = 0
texture = ""


   
for i in range(1,len(sys.argv)):
    if not(sys.argv[i].startswith('--')):
      if bSource == 1:
         filename = sys.argv[i]
    if sys.argv[i] == ('--source'):
        bSource = 1
    if sys.argv[i] == ('--calccenter'):
        bCalccenter = 1
    if sys.argv[i] == ('--flipxy'):
        bFlipxy = 1
    if sys.argv[i] == ('--integer'):
        bInteger = 1
 
 
if (bSource == 0):
    print('Error: please specify input file using --source parameter')
    sys.exit()
   
if (bSource):
    print('Source: ' + filename)
   
if (bCalccenter):
    print('calculating centroid...')
    
if (bFlipxy):
    print('flipping x and y!')
   
color = ",1,0,0,1" #set color


f = open(filename, "r")

#read type p,pt,pnt etc. recognizable on face definition "1"->p "1/2"->pn "1/1/1"->pnt "1//1"->pt
wholefile = f.read();

wholefile = re.sub("[ ]+"," ",wholefile)

test = re.search("\nf \d*/\d*/\d*",wholefile) # 1/2/1 -> pnt
if test:
    vertexsemantic = "pnt"

test1 = re.search("\nf \d*//\d*",wholefile) # 1//1 -> pn
if test1:
    vertexsemantic = "pn"
    print "conversion failed: vertexsemantic 'pn' is currently not supported"
    quit()

    
test2 = re.search("\nf \d*/\d* ",wholefile) #1/2 ->pt
if test2:
    vertexsemantic = "pt"

test3 = re.search("\nf \d* ",wholefile) # 1 -> p
if test3:
    vertexsemantic = "p"

#vertexsemantic is now defined. ------------------------------------------------
print "vertexsemantic found: "+vertexsemantic

f.seek(0); #sets the file cursor back

#set v ,vn, vt arrays
lines = f.readlines();
v = []    #vert coordinates
vt = []   #texture coordinate
vn = []   #normal coordinates
face = []
vertices = []
p = []
pt = []
pnt = []
idx = []
ilb = []
ilb2 = []

bHasNormals = 0
if vertexsemantic == "pnt":
   bHasNormals = 1

#for i in range(0,65000):
#    ilb.append(" ") #interleaved buffer

cnt = 0

for line in lines:
    if line[0:2] == "v ":
        rline = re.sub(r"\s+",",",line[1:-1]) 
        v.append(rline[1:])
    
    elif line[0:3] == "vn ":
        rline = re.sub(r"\s+",",",line[1:-1]) 
        vn.append(rline[2:])
        
    elif line[0:3] == "vt ":
        rline = re.sub(r"\s+",",",line[1:-1]) 
        vt.append(rline[2:])
        
    elif line[0:2] == "f ": #face definition
        vertices = line[2:-1].split() #splits every space
        for vert in vertices:
            if vertexsemantic == "p":
                ilb.append(v[int(vert)-1]+color)
                idx.append(cnt)
                cnt = cnt + 1
                
            elif vertexsemantic == "pt": #this means f 1/2    
                a = vert.split('/')
                ilb.append(v[int(a[0])-1]+","+(vt[int(a[1])-1]))
                idx.append(cnt)
                cnt = cnt + 1
                
            elif vertexsemantic == "pnt": #this means f 1/2/2  (note in wavefront it is: p/t/n and not pnt!)   
                a = vert.split('/')
                ilb.append((v[int(a[0])-1]+","+(vn[int(a[2])-1])+","+(vt[int(a[1])-1])))
                idx.append(cnt)
                cnt = cnt + 1
                
f.close();

cx = 0;
cy = 0;
cz = 0;



numelems = len(v);
part = 1.0 / float(numelems)
print ('Number of elements: ' + str(numelems))
for c in v:
    tokens = c.split(',')
    x = float(tokens[0])
    y = float(tokens[1])
    z = float(tokens[2])
    cx = cx + x * part;
    cy = cy + y * part;
    cz = cz + z * part;
if bInteger:
   cx = int(cx)
   cy = int(cy)
   cz = int(cz)    
print ('Center = (' + str(cx) + ', ' + str(cy) + ', ' + str(cz))
lng = cx
lat = cy
elv = cz
#now recreate ilb
for ilbiterator in ilb:
    tokens2 = ilbiterator.split(',')
    if len(tokens2) > 2:
        if bCalccenter:
            newx = float(tokens2[0]) - cx
            newy = float(tokens2[1]) - cy
            newz = float(tokens2[2]) - cz
        else:
            newx = float(tokens2[0])
            newy = float(tokens2[1])
            newz = float(tokens2[2])
        if bFlipxy:
            s = str(newy) + ',' + str(-newz) + ',' + str(newx)
        else:        
            s = str(newx) + ',' + str(newy) + ',' + str(newz)
        
        if (bHasNormals):
            normalx = float(tokens2[3])
            normaly = float(tokens2[4])
            normalz = float(tokens2[5])
            
            if bFlipxy:
                s = s + ',' + str(normaly) + ',' + str(-normalz) + ',' + str(normalx)
            else:        
                s = s + ',' + str(normalx) + ',' + str(normaly) + ',' + str(normalz)
            for i in range(6,len(tokens2)):
                s = s + ','
                s = s + tokens2[i]
        else:
            for i in range(3,len(tokens2)):
                s = s + ','
                s = s + tokens2[i]
        ilb2.append(s)
ilb = ilb2
ilb2 = []

k=0;   
#write to json format
name = filename.split('.')
g = open(name[0]+'.json',"w")
g.write("[")
while len(ilb)>0:
	print len(ilb)
	g.write("[{\n\"id\"  :  \""+str(id)+"\",")
	g.write("\n\"Center\"  :  ["+str(lng)+","+str(lat)+","+str(elv)+"],")
	g.write("\n\"DiffuseMap\"  :  \""+str(texture)+"\",")
	g.write("\n\"VertexSemantic\"  :  \""+vertexsemantic+"\",\n\"Vertices\"  :  [")
	k=0
	for x in ilb:
		k=k+1
		if(k>65000):
			break	
		if(x != " "):
			g.write("\t"+x+",\n")
			g.write("\t\t\t\t")
	
	for i in range(0,k):
		ilb.pop(0)
		
	g.seek(-7,1) #set cursor pos back to remove last ','
	g.write("],\n\"IndexSemantic\"  :  \"TRIANGLES\",\n\"Indices\"  :  [\t")
	i=0
	for x in idx:
		i+=1
		if(i>k):
			break
		g.write(str(int(x))+",")
		if i%3==0:
			g.write("\n\t\t\t\t")
			
	g.seek(-7,1) #set cursor pos back to remove last ','
	g.write("]}],")

g.seek(-1,1) #set cursor pos back to remove last ','
g.write("\n\n]")


print "conversion successfully finished..."


    
    


