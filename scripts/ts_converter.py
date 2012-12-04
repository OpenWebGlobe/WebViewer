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
#                             TS File Converter                                #
#                               Version 0.0.1                                  #
#                                                                              #
#                              (c) 2010-2011 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           benjamin.loesch@fhnw.ch                            #
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
import pyproj



p1 = pyproj.Proj(init='epsg:21781')

p2 = pyproj.Proj(init='epsg:4326')


x1, y1 = p1(-92.199881,38.56694)

x2, y2 = pyproj.transform(p1,p2,x1,y1)


if len(sys.argv) < 2:
    print('usage:\n')
    print('--source wavefront.obj')
    print('--calccenter')
    print('--flipxy')
    print('--integer')
    print('--flipxz')
    print('\nexample: obj2json.py --source bla.obj --calccenter')
    sys.exit()


filename = ""
bSource = 0
bCalccenter = 0
bFlipxy = 0
bInteger = 0
bFlipxz = 0

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
    if sys.argv[i] == ('--flipxz'):
        bFlipxz = 1


if (bSource == 0):
    print('Error: please specify input file using --source parameter')
    sys.exit()

if (bSource):
    print('Source: ' + filename)

if (bCalccenter):
    print('calculating centroid...')

if (bFlipxy):
    print('flipping x and y!')

if (bFlipxz):
    print('flipping x and z!')

color = ",1,0,0,1" #set color


f = open(filename, "r")


wholefile = f.read();

wholefile = re.sub("[ ]+"," ",wholefile)


vertexsemantic = "pc";
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
indices = []
p = []
idx = []
ilb = []
ilb2 = []
cx = 0
cy = 0
cz = 0
color ='0,0,0,'
name = filename.split('.')
g = open(name[0]+'.json',"w")
g.write("[[");

cnt = 0

for line in lines:
    #line = line.rstrip()

    if(re.search("GOCAD ",line)):
        #make a new object
        vertices = []
        indices = []
        cx = 0
        cy = 0
        cz = 0

    if(re.search("color",line)):
        r = re.search("color",line)
        startchar = r.regs[0][1]+1
        color = re.sub(r"\s+",",",line[startchar:])


    if(re.search("VRTX",line)):
        r = re.search("VRTX \d* ",line)
        startchar = r.regs[0][1]+1
        vertex = re.sub(r"\s+",",",line[startchar:])
        vertices.append(vertex+color+'\n')

    if(re.search("TRGL",line)):
        r = re.search("TRGL ",line)
        startchar = r.regs[0][1]
        index = re.sub(r"\s+",",",line[startchar:])
        indices.append(index+'\n')

    if(re.search("END\n",line)):

        numelems = len(vertices);
        part = 1.0 / float(numelems)
        print ('Number of elements: ' + str(numelems))
        for c in vertices:
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

        p1 = pyproj.Proj(init='epsg:21781')
        #x1, y1 = p1(cz,cx)
        p2 = pyproj.Proj(init='epsg:4326')
        x2, y2 = pyproj.transform(p1,p2,cx,cy)

        lng = x2
        lat = y2
        elv = cz
        print ('Center = (' + str(lng) + ', ' + str(lat) + ', ' + str(elv)+')')


        #now recreate ilb
        for ilbiterator in vertices:
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
                    s = str(newy) + ',' + str(-newz) + ',' + str(newx)+','

                elif bFlipxz:
                    s = str(newx) + ',' + str(newy) + ',' + str(newz)+','
                else:
                    s = str(newy) + ',' + str(newz) + ',' + str(newx)+','


                for i in range(3,len(tokens2)):
                    s = s + tokens2[i]
                    if i<len(tokens2)-1:
                        s = s + ','

                ilb2.append(s)
        ilb = ilb2
        ilb2 = []


        for i in range(len(indices)):
            tokens2 = indices[i].split(',')
            if len(tokens2) > 2:
               a = int(tokens2[0]) - 1
               b = int(tokens2[1]) - 1
               c = int(tokens2[2]) - 1
            indices[i] = str(a)+','+str(b)+','+str(c)+',\n'
        #write to json format



        g.write("{\n\"id\"  :  \""+str(id)+"\",")
        g.write("\n\"Center\"  :  ["+str(lng)+","+str(lat)+","+str(elv)+"],")
        g.write("\n\"VisibilityDistance\"  :  "+str(100000000)+",")
        g.write("\n\"VertexSemantic\"  :  \""+vertexsemantic+"\",\n\"Vertices\"  :  [")
        for x in ilb:
            if(x != " "):
                g.write("\t"+x)
                g.write("\t\t\t\t")
        g.seek(-7,1) #set cursor pos back to remove last ','
        g.write("],\n\"IndexSemantic\"  :  \"TRIANGLES\",\n\"Indices\"  :  [\t")
        i=0
        for x in indices:
            i+=1
            g.write('\t\t\t\t'+x)

        g.seek(-3,1) #set cursor pos back to remove last ','
        g.write("]\n\n},")

g.seek(-1,1)
g.write("]]");
g.close()


print "conversion successfully finished..."






