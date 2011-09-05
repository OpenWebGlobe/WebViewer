kmz-extract-location.py
-----------------------

This script extracts the <Location> and <Orientation> tags from KML and KMZ
documents.  It is designed to be used as part of the conversion change from
KML/Collada data to OpenWebGlobe JSON data.  Syntax:

	kmz-extract-location.py filename

`filename` can either be a KML document or a KMZ file.

Example output:

	$ kmz-extract-location.py PSEA_model.kmz
	Location:
		Latitude: 46.5177948548
		Longitude: 6.5625981894
		Altitude: 396.00
	Orientation:
		Roll: 0.00
		Tilt: 0.00
		Heading: -0.64
