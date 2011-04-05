// Generator JavaScript strings of shaders

#include <fstream>
#include <iostream>
#include <vector>
#include <string>


void Generate(const std::string& sShader, std::ofstream& ojs)
{
   std::string vertexshader = sShader + ".vert";
   std::string fragmentshader = sShader + ".frag";
   std::string javascript = sShader + ".js";
   std::ifstream ivs;
   std::ifstream ifs;

   

  

   ivs.open(vertexshader.c_str());

   if (ivs.good() && ojs.good())
   {
      ojs << "\n";
      ojs << "src_vertexshader_" << sShader << "= \"";

      while (!ivs.eof())
      {
         char c = ivs.get();
         if (!ivs.eof())
         {
            if (c != 0x0d && c!=0x0a)
            {
               ojs << c;
            }

            if (c==0x0a)
            {
               ojs << "\\n";
            }
         }
      }

      ojs << "\";";
   }


   ifs.open(fragmentshader.c_str());

   if (ifs.good() && ojs.good())
   {
      ojs << "\n";
      ojs << "src_fragmentshader_" << sShader << "= \"";

      while (!ifs.eof())
      {
         char c = ifs.get();
         if (!ifs.eof())
         {
            if (c != 0x0d && c!=0x0a)
            {
               ojs << c;
            }

            if (c==0x0a)
            {
               ojs << "\\n";
            }
         }
      }

      ojs << "\";\n\n";
   }
}


int main(void)
{
   std::ofstream ojs;
   ojs.open("output.js");

   std::vector<std::string> vFiles;
   vFiles.push_back("P");
   vFiles.push_back("PC");
   vFiles.push_back("PNCT");
   vFiles.push_back("PNT");
   vFiles.push_back("PT");

   for (size_t i=0;i<vFiles.size();i++)
   {
      Generate(vFiles[i], ojs);
   }

   return 0;
}