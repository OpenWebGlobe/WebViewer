#!/usr/bin/python
import urllib2
import sys
import os
import os.path
import tarfile
import re


filename = sys.argv[1]
print filename
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
for i in range(0,65000):
    ilb.append(" ") #interleaved buffer


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
                ilb[int(a[0])-1] = (v[int(vert)-1]+color)
                idx.append(vert)
                
            elif vertexsemantic == "pt": #this means f 1/2    
                a = vert.split('/')
                ilb[int(a[0])-1] = (v[int(a[0])-1]+","+(vt[int(a[1])-1]))
                idx.append(a[0])
                
            elif vertexsemantic == "pnt": #this means f 1/2/2    
                a = vert.split('/')
                ilb[int(a[0])-1] = (v[int(a[0])-1]+","+(vt[int(a[1])-1])+","+(vt[int(a[2])-1]))
                idx.append(a[0])
                
f.close();

id = input("type a unique model-id: ")
lng = input("center longitude: ")
lat = input("center latitude: ")
elv = input("center elevation: ")
texture = raw_input("texture url: ")


#write to json format
name = filename.split('.')
g = open(name[0]+'.json',"w")
g.write("{\n\"id\"  :  \""+str(id)+"\",")
g.write("\n\"Center\"  :  ["+str(lng)+","+str(lat)+","+str(elv)+"],")
g.write("\n\"DiffuseMap\"  :  \""+str(texture)+"\",")
g.write("\n\"VertexSemantic\"  :  \""+vertexsemantic+"\",\n\"Vertices\"  :  [")
for x in ilb:
    if(x != " "):
        g.write("\t"+x+",\n")
        g.write("\t\t\t\t")
g.seek(-7,1) #set cursor pos back to remove last ','
g.write("],\n\"IndexSemantic\"  :  \"TRIANGLES\",\n\"Indices\"  :  [\t")
i=0
for x in idx:
    i+=1
    g.write(str(int(x)-1)+",")
    if i%3==0:
        g.write("\n\t\t\t\t")
g.seek(-7,1) #set cursor pos back to remove last ','
g.write("]\n\n}")


print "conversion successfully finished..."


    
    


