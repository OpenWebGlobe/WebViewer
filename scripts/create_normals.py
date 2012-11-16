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
"""
    This is a script for calculating normals for existing json models with VertexSemantic PC
    A new json 3d model file will be created with normals and VertexSemantic PNC.
"""

import json
import sys
import numpy as np



if len(sys.argv) < 2:
    print('usage:\n')
    print('--source cube.json')
    print('\nexample: obj2json.py --source cube.json ')
    sys.exit()


filename = ""
bSource = 0
bflipnormals =0


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
    if sys.argv[i] == ('--flipnormals'):
        bflipnormals = 1


if (bSource == 0):
    print('Error: please specify input file using --source parameter')
    sys.exit()

if (bSource):
    print('Source: ' + filename)

if (bflipnormals):
    print('--flip normals')

f = open(filename, "r")
data = json.load(f)
f.close();


for k in range(len(data[0])):

    indices = data[0][k]['Indices']

    triangles = []
    for i in range(len(indices)/3):
        triangles.append([indices[i*3],indices[i*3+1],indices[i*3+2]])

    vertices = data[0][k]['Vertices']
    verts = []
    normals = []

    for i in range(len(vertices)/7): #diesrer
        verts.append([vertices[i*7],vertices[i*7+1],vertices[i*7+2],vertices[i*7+3],vertices[i*7+4],vertices[i*7+5],vertices[i*7+6]])
        normals.append([])



    for i in range(len(triangles)):
        p1 = verts[triangles[i][0]][0:3]
        p2 = verts[triangles[i][1]][0:3]
        p3 = verts[triangles[i][2]][0:3]

        a = np.array([p1[0],p1[1],p1[2]])
        b = np.array([p2[0],p2[1],p2[2]])
        c = np.array([p3[0],p3[1],p3[2]])
        n = np.cross(a-c,b-c)
        l = np.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2])
        if l>0:
            n /= l
        else:
            n /= 0.00001

        if bflipnormals:
            n[0] = -n[0]
            n[1] = -n[1]
            n[2] = -n[2]


        #split normals
        normals[triangles[i][0]].append(n);
        normals[triangles[i][1]].append(n);
        normals[triangles[i][2]].append(n);


    for i in range(len(normals)):
        normals[i] = np.mean(normals[i],axis=0)

    newverts = []
    for i in range(len(verts)):
        newverts.append(verts[i][0])    # Point X
        newverts.append(verts[i][1])    # Point Y
        newverts.append(verts[i][2])    # Point Z

        if(np.any(np.isnan(normals[i]))):
            normals[i] = [0,0,0]

        newverts.append(normals[i][0])  # Normal nX
        newverts.append(normals[i][1])  # Normal nY
        newverts.append(normals[i][2])  # Normal nZ

        newverts.append(verts[i][3])    # Color R
        newverts.append(verts[i][4])    # Color G
        newverts.append(verts[i][5])    # Color B
        newverts.append(verts[i][6])    # Color A


    data[0][k]['Vertices'] = newverts

    data[0][k]['VertexSemantic'] = 'pnc'

f = open(filename[:-5]+"_pnc.json", "w")

json.dump(data,f, sort_keys=True)

f.close()




print "conversion successfully finished..."






