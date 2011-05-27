#!/usr/bin/python
import urllib2
import sys
import os
import os.path
import tarfile
import re

pause
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
ilb = [] #interleaved buffer

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
                idx.append(vert)
                
            elif vertexsemantic == "pt": #this means f 1/2    
                a = vert.split('/')
                ilb.append(v[int(a[0])-1]+","+(vt[int(a[1])-1]))
                idx.append(a[0])
            elif vertexsemantic == "pnt": #this means f 1/2/2    
                a = vert.split('/')
                ilb.append(v[int(a[0])-1]+","+(vt[int(a[1])-1])+","+(vt[int(a[2])-1]))
                idx.append(a[0])
                
f.close();


#write to json format
g = open('test.json',"w")
g.write("{\n\"VertexSemantic\"  :  \""+vertexsemantic+"\",\n\"Vertices\"  :  [")
for x in ilb:
    g.write("\t"+x+",\n")
    g.write("\t\t\t\t")
g.seek(-7,1) #set cursor pos back to remove last ','
g.write("],\n\"IndexSemantic\"  :  \"TRIANGLES\",\n\"Indices\"  :  [\t")
i=0
for x in idx:
    i+=1
    g.write(x+",")
    if i%3==0:
        g.write("\n\t\t\t\t")
g.seek(-7,1) #set cursor pos back to remove last ','
g.write("]\n\n}")


print "conversion successfully finished..."


    
    


