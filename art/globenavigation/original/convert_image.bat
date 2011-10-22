convert MoveWheel.tif -alpha On MoveWheel.png
convert YawPitchWheel.tif -alpha On YawPitchWheel.png
convert yaw_pitch_adjust.tif -alpha On yaw_pitch_adjust.png
convert movewheel_marker.tif -alpha On movewheel_marker.png
convert minus.tif -alpha On minus.png
convert minus_over.tif -alpha On minus_over.png
convert minus_clicked.tif -alpha On minus_clicked.png
convert plus.tif -alpha On plus.png
convert plus_over.tif -alpha On plus_over.png
convert plus_clicked.tif -alpha On plus_clicked.png
convert slider.tif -alpha On slider.png
convert slider_over.tif -alpha On slider_over.png
convert slider_clicked.tif -alpha On slider_clicked.png
convert slider_rail.tif -alpha On slider_rail.png
convert crosshair.tif -alpha On crosshair.png

bin\pngcrush MoveWheel.png ..\MoveWheel.png
bin\pngcrush minus.png ..\minus.png
bin\pngcrush minus_over.png ..\minus_over.png
bin\pngcrush minus_clicked.png ..\minus_clicked.png
bin\pngcrush plus.png ..\plus.png
bin\pngcrush plus_over.png ..\plus_over.png
bin\pngcrush plus_clicked.png ..\plus_clicked.png
bin\pngcrush slider.png ..\slider.png
bin\pngcrush slider_over.png ..\slider_over.png
bin\pngcrush slider_clicked.png ..\slider_clicked.png
bin\pngcrush slider_rail.png ..\slider_rail.png
bin\pngcrush movewheel_marker.png ..\movewheel_marker.png
bin\pngcrush YawPitchWheel.png ..\YawPitchWheel.png
bin\pngcrush yaw_pitch_adjust.png ..\yaw_pitch_adjust.png
bin\pngcrush crosshair.png ..\crosshair.png

del *.png

pause