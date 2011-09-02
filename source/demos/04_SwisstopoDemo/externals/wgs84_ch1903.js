// Convert WGS lat/long (° dec) to CH y
function WGStoCHy(lat, lng) {

  // Converts degrees dec to sex
  lat = DECtoSEX(lat);
  lng = DECtoSEX(lng);

  // Converts degrees to seconds (sex)
  lat = DEGtoSEC(lat);
  lng = DEGtoSEC(lng);
  
  // Axiliary values (% Bern)
  var lat_aux = (lat - 169028.66)/10000;
  var lng_aux = (lng - 26782.5)/10000;
  
  // Process Y
  y = 600072.37 
     + 211455.93 * lng_aux 
     -  10938.51 * lng_aux * lat_aux
     -      0.36 * lng_aux * Math.pow(lat_aux,2)
     -     44.54 * Math.pow(lng_aux,3);
     
  return y;
}

// Convert WGS lat/long (° dec) to CH x
function WGStoCHx(lat, lng) {
  
  // Converts degrees dec to sex
  lat = DECtoSEX(lat);
  lng = DECtoSEX(lng);
  
  // Converts degrees to seconds (sex)
  lat = DEGtoSEC(lat);
  lng = DEGtoSEC(lng);
  
  // Axiliary values (% Bern)
  var lat_aux = (lat - 169028.66)/10000;
  var lng_aux = (lng - 26782.5)/10000;

  // Process X
  x = 200147.07
     + 308807.95 * lat_aux 
     +   3745.25 * Math.pow(lng_aux,2)
     +     76.63 * Math.pow(lat_aux,2)
     -    194.56 * Math.pow(lng_aux,2) * lat_aux
     +    119.79 * Math.pow(lat_aux,3);
 
  return x;
  
}


// Convert CH y/x to WGS lat
function CHtoWGSlat(y, x) {

  // Converts militar to civil and  to unit = 1000km
  // Axiliary values (% Bern)
  var y_aux = (y - 600000)/1000000;
  var x_aux = (x - 200000)/1000000;
  
  // Process lat
  lat = 16.9023892
       +  3.238272 * x_aux
       -  0.270978 * Math.pow(y_aux,2)
       -  0.002528 * Math.pow(x_aux,2)
       -  0.0447   * Math.pow(y_aux,2) * x_aux
       -  0.0140   * Math.pow(x_aux,3);
    
  // Unit 10000" to 1 " and converts seconds to degrees (dec)
  lat = lat * 100/36;
  
  return lat;
  
}

// Convert CH y/x to WGS long
function CHtoWGSlng(y, x) {

  // Converts militar to civil and  to unit = 1000km
  // Axiliary values (% Bern)
  var y_aux = (y - 600000)/1000000;
  var x_aux = (x - 200000)/1000000;
  
  // Process long
  lng = 2.6779094
        + 4.728982 * y_aux
        + 0.791484 * y_aux * x_aux
        + 0.1306   * y_aux * Math.pow(x_aux,2)
        - 0.0436   * Math.pow(y_aux,3);
     
  // Unit 10000" to 1 " and converts seconds to degrees (dec)
  lng = lng * 100/36;
     
  return lng;
  
}


// Convert SEX DMS angle to DEC
function SEXtoDEC(angle) {

  // Extract DMS
  var deg = parseInt( angle );
  var min = parseInt( (angle-deg)*100 );
  var sec = (((angle-deg)*100) - min) * 100;
  
  // Result in degrees sex (dd.mmss)
  return deg + (sec/60 + min)/60;
  
}

// Convert DEC angle to SEX DMS
function DECtoSEX(angle) {

  // Extract DMS
  var deg = parseInt( angle );
  var min = parseInt( (angle-deg)*60 );
  var sec =  (((angle-deg)*60)-min)*60;   

  // Result in degrees sex (dd.mmss)
  return deg + min/100 + sec/10000;
  
}

// Convert Degrees angle to seconds
function DEGtoSEC(angle) {

  // Extract DMS
  var deg = parseInt( angle );
  var min = parseInt( (angle-deg)*100 );
  var sec = (((angle-deg)*100) - min) * 100;
  
  // Result in degrees sex (dd.mmss)
  return sec + min*60 + deg*3600;
  
}

