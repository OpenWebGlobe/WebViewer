try:
    import xml.etree.cElementTree as ElementTree
except ImportError:
    import xml.etree.ElementTree as ElementTree
import re
import sys
from zipfile import BadZipfile, ZipFile


def findall(s):
    et = ElementTree.parse(s)
    namespace = re.match(r'\{(.*)\}', et.getroot().tag).group(1)
    print 'Location:'
    for location in et.findall('//{%s}Location' % namespace):
        print '\tLatitude: %s' % location.find('{%s}latitude' % namespace).text
        print '\tLongitude: %s' % location.find('{%s}longitude' % namespace).text
        print '\tAltitude: %s' % location.find('{%s}altitude' % namespace).text
    print 'Orientation:'
    for orientation in et.findall('//{%s}Orientation' % namespace):
        print '\tRoll: %s' % orientation.find('{%s}roll' % namespace).text
        print '\tTilt: %s' % orientation.find('{%s}tilt' % namespace).text
        print '\tHeading: %s' % orientation.find('{%s}heading' % namespace).text


def main(argv):
    for arg in argv[1:]:
        try:
            zf = ZipFile(open(arg))
            for zi in zf.infolist():
                if re.search(r'\.kml\Z', zi.filename):
                    findall(zf.open(zi))
        except BadZipfile:
            findall(open(arg))


if __name__ == '__main__':
    main(sys.argv)
