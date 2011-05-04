@echo off

set COMPILATION_LEVEL=ADVANCED_OPTIMIZATIONS
set CLOSURE_LIBRARY=..\external\closure-library
set COMPILER_JAR=..\external\closure\compiler.jar
set PYTHON=C:\Python27\python.exe

if not exist ..\compiled mkdir ..\compiled

%PYTHON% %CLOSURE_LIBRARY%\closure\bin\build\depswriter.py ^
 --output_file=..\compiled\deps.js ^
 --root_with_prefix="%CLOSURE_LIBRARY%\closure\ ../" ^
 --root_with_prefix="..\source\ ../../../../source"

%PYTHON% %CLOSURE_LIBRARY%\closure\bin\build\closurebuilder.py ^
 --compiler_flags=--compilation_level=%COMPILATION_LEVEL% ^
 --compiler_flags=--create_source_map=..\compiled\owg-optimized.map ^
 --compiler_flags=--warning_level=VERBOSE ^
 --compiler_jar=%COMPILER_JAR% ^
 --namespace=owg.OpenWebGlobe ^
 --output_file=..\compiled\owg-optimized.js ^
 --output_mode=compiled ^
 --root=..\external\closure-library\ ^
 --root=..\source\
