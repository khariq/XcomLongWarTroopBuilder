import urllib2
from urllib import urlretrieve
import os

def ReadTechs(outFolder, href):
	catalog = urllib2.urlopen(href).read();
	start = catalog.find("<span class=\"mw-headline\" id=\"Analysis_Projects\">Analysis Projects</span>");
	end = catalog.find("<span class=\"mw-headline\" id=\"See_also\">See also</span>");

	page = catalog[start:end];

	start = page.find("<table class=\"wikitable\">");
	
	while (start >= 0) :
		end = page.find("</table>");
		table = page[start, emd];
		

