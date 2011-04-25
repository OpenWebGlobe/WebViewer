import os
import os.path
import glob
     
path = '../source/core'

files = []
command = "java -jar ../external/closure/compiler.jar "  

for infile in glob.glob( os.path.join(path, '*.js') ):
        files.append(infile)

for infile in glob.glob( os.path.join(path+"/layer", '*.js') ):
        files.append(infile)
     
for infile in glob.glob( os.path.join(path+"/nodes", '*.js') ):
        files.append(infile)                 
 

for i in range(1,len(files)) :
    command = command + "--js="
    command = command + files[i]
    command = command + " "
    
command = command + "--js_output_file=../compiled/owg.js"  
command = os.path.normcase(command)

f = open('compile.bat', 'w')
f.write(command)
f.write('\npause\n')

print('Finished.')        