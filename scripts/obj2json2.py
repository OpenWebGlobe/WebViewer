#!/usr/bin/python

from collections import defaultdict
from itertools import izip
import math
from optparse import OptionParser
import os.path
import re
import sys

import numpy
import Image
import glob


# http://code.activestate.com/recipes/442299-pack-multiple-images-of-different-sizes-into-one-i/

class PackNode(object):
    """
    Creates an area which can recursively pack other areas of smaller sizes into itself.
    """
    def __init__(self, area):
        #if tuple contains two elements, assume they are width and height, and origin is (0,0)
        if len(area) == 2:
            area = (0,0,area[0],area[1])
        self.area = area

    def __repr__(self):
        return "<%s %s>" % (self.__class__.__name__, str(self.area))

    def get_width(self):
        return self.area[2] - self.area[0]
    width = property(fget=get_width)

    def get_height(self):
        return self.area[3] - self.area[1]
    height = property(fget=get_height)

    def insert(self, area):
        if hasattr(self, 'child'):
            a = self.child[0].insert(area)
            if a is None: return self.child[1].insert(area)
            return a

        area = PackNode(area)
        if area.width <= self.width and area.height <= self.height:
            self.child = [None,None]
            self.child[0] = PackNode((self.area[0]+area.width, self.area[1], self.area[2], self.area[1] + area.height))
            self.child[1] = PackNode((self.area[0], self.area[1]+area.height, self.area[2], self.area[3]))
            return PackNode((self.area[0], self.area[1], self.area[0]+area.width, self.area[1]+area.height))


class Material(object):

    def __init__(self):
        self.image = None
        self.transform = numpy.identity(3)


def main(argv):
    parser = OptionParser()
    parser.add_option('-i', '--input', metavar='FILENAME', help='input object filename')
    parser.add_option('-d', '--directory', default='.', metavar='DIRECTORY', help='output directory')
    parser.add_option('-t', '--texture', default='mtl.jpg', metavar='FILENAME', help='texture image filename')
    parser.add_option('-m', '--mtllib', default='mtl.mtl', metavar='FILENAME', help='material library filename')
    parser.add_option('-o', '--obj', default='obj.obj', metavar='FILENAME', help='object filename')
    options, args = parser.parse_args(argv[1:])
    if options.input is None or options.input == '-':
        lines, dirname = list(sys.stdin), '.'
    else:
        lines, dirname = list(open(options.input)), os.path.dirname(options.input)
    fieldss = [re.split(r'\s+', line.rstrip()) if not line.startswith('#') else None for line in lines]
    # Parse material libraries
    materials, material = {}, None
    for fields in fieldss:
        if not fields:
            continue
        if fields[0] != 'mtllib':
            continue
        assert len(fields) == 2
        for mtllib_line in open(os.path.join(dirname, fields[1])):
            mtllib_fields = re.split(r'\s+', mtllib_line.rstrip())
            if mtllib_fields[0] == 'newmtl':
                assert len(mtllib_fields) == 2
                assert mtllib_fields[1] not in materials
                material = Material()
                materials[mtllib_fields[1]] = material
                continue
            if mtllib_fields[0] == 'map_Kd':
                assert len(mtllib_fields) == 2
                assert material is not None
                assert material.image is None
                material.image = Image.open(os.path.join(dirname, mtllib_fields[1]))
                continue
    # Determine the material used for each texture vertex
    material = None
    material_by_vti = {}
    for fields in fieldss:
        if not fields:
            continue
        if fields[0] == 'usemtl':
            assert len(fields) == 2
            material = materials[fields[1]]
            continue
        if fields[0] == 'f':
            assert materials is not None
            vtis = list(int(field.split('/')[1] or 0) for field in fields[1:])
            for vti in vtis:
                if vti not in material_by_vti:
                    material_by_vti[vti] = material
                else:
                    assert material_by_vti[vti] == material
            continue
    # Merge textures
    # TODO sort materials by image size
    area = sum(material.image.size[0] * material.image.size[1] for material in materials.values() if material.image is not None)
    size = 1 << int(math.ceil(math.log(math.sqrt(area)) / math.log(2)))
    while True:
        tree = PackNode((size, size))
        for material in materials.values():
            if material.image is None:
                continue
            material.uv = tree.insert(material.image.size)
            if material.uv is None:
                break
            material.transform = numpy.zeros((3, 3))
            material.transform[0][0] = float(material.uv.width) / size
            material.transform[0][2] = float(material.uv.area[0]) / size
            material.transform[1][1] = -float(material.uv.height) / size
            material.transform[1][2] = float(material.uv.area[3]) / size
            material.transform[2][2] = 1
        else:
            break
        size *= 2
    image = Image.new('RGB', (size, size))
    for key, material in materials.items():
        if material.image is not None:
            image.paste(material.image, material.uv.area)
    image.transpose(Image.FLIP_TOP_BOTTOM).save(os.path.join(options.directory, options.texture))
    # Write the material library
    mtllib = open(os.path.join(options.directory, options.mtllib), 'w')
    mtllib.write('newmtl mtl\r\n')
    mtllib.write('Ka 1 1 1\r\n')
    mtllib.write('Kd 1 1 1\r\n')
    mtllib.write('Ks 1 0 0\r\n')
    mtllib.write('map_Kd %s\r\n' % options.texture)
    mtllib.close()
    # Transform each texture vertex
    if options.obj is None or options.obj == '-':
        obj = sys.stdout
    else:
        obj = open(os.path.join(options.directory, options.obj), 'w')
    vti = 0
    for line, fields in izip(lines, fieldss):
        if not fields:
            obj.write(line)
            continue
        if fields[0] == 'mtllib':
            obj.write('mtllib %s\r\n' % options.mtllib)
            continue
        if fields[0] == 'vt':
            assert len(fields) == 3
            vti += 1
            vt = numpy.array([float(fields[1]), float(fields[2]), 1])
            vt = numpy.dot(material_by_vti[vti].transform, vt)
            obj.write('vt %f %f\r\n' % (vt[0], vt[1]))
            continue
        if fields[0] == 'usemtl':
            obj.write('usemtl mtl\r\n')
            continue
        obj.write(line)


if __name__ == '__main__':
    main(sys.argv)
