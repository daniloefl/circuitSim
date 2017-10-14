from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse

from django.templatetags.static import static

# add the library to the Python PATH
import sys
import os
from django.conf import settings
sys.path.append(os.path.join(settings.STATIC_ROOT, 'circuitSim'));

# Import the library
import circuitPy

import numpy as np
import matplotlib
import matplotlib.pyplot as plt

from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure

import StringIO
import urllib, base64

def index(request):
    template = loader.get_template('circuitSim/index.html')
    return HttpResponse(template.render(request))

def findConnection(conn, key):
  for c in conn:
    if conn[c]["from"] == key:
      return c
    if conn[c]["to"] == key:
      return c
  return -1

class NoGndException(Exception):
    def __init__(self):
        pass
    def __str__(self):
        return "No ground node found!"


def findConnForNode(name, nodeName, conn):
  cList = []
  for c in conn:
    if conn[c]['to'] == name or conn[c]['from'] == name:
      cList.append(c)
  return cList

def connectNodes(node, name, nodeName, conn):
  if not name in nodeName:
    nodeName[name] = []
  nodeName[name].append(node)
  for c in findConnForNode(node, nodeName, conn):
    if not conn[c]['to'] in nodeName[name]:
      connectNodes(conn[c]['to'], name, nodeName, conn)
    if not conn[c]['from'] in nodeName[name]:
      connectNodes(conn[c]['from'], name, nodeName, conn)

def findNodeId(nname, nodeName):
  nid = ""
  for k in nodeName:
    if nname in nodeName[k]:
      nid = k
      break
  return str(nid)

def setupCircuit(circ, e, conn):
  nodeName = {}
  lastNodeNumber = 0
  # first find the ground
  foundGnd = False
  for ekey in e:
    if "GND" in ekey:
      foundGnd = True
      nname = ekey+"#N1"
      connectNodes(nname, '0', nodeName, conn)
  if not foundGnd:
    raise NoGndException


  # find empty nodes
  for ekey in e:
    if not 'E' in ekey:
      continue
    nname = ekey
    nid = findNodeId(nname, nodeName)
    cname = nid
    if nid == "":
      lastNodeNumber += 1
      cname = str(lastNodeNumber)
    connectNodes(nname, cname, nodeName, conn)
  nl = ""
  for ekey in e:
    name = ekey
    if "GND" in name:
      continue
    if "E" in name:
      continue
    if "R" in name:
      nl += "%s %s %s %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
      circ.addResistor(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
    if "V" in name:
      circ.addDCVoltageSource(str(name), findNodeId(name+"#N2", nodeName), findNodeId(name+"#N1", nodeName), float(e[name]['value']))
      nl += "%s %s %s %f\n" %(str(name), findNodeId(name+"#N2", nodeName), findNodeId(name+"#N1", nodeName), float(e[name]['value']))
    if "C" in name:
      circ.addCapacitor(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
      nl += "%s %s %s %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
  return [nodeName, nl]

def run(request):
  # Create the main object
  
  if request.method == "POST":
    import json
    data = json.loads(request.POST.get('data'))
    e = data['elements']
    conn = data['connections']
  else:
    e = request.GET["elements"];
    conn = request.GET["connections"];

  circ = circuitPy.Circuit()
  nodeName, nl = setupCircuit(circ, e, conn)
  nodeList = nodeName.keys()

  # Set simulation parameters
  tFinal = 1         # duration of simulation
  dt = 1e-2           # time step
  method = "BE"       # method can be BE or GEAR
  internalStep = 1    # number of steps before saving result
  circ.setSimulationParameters(tFinal, dt, method, internalStep)

  # run simulation
  circ.simulate()

  # get result in each time
  t = circ.getTimeList()
  n = {}
  maxVal = -9999
  minVal = 9999
  for node in nodeList:
    if node == "0":
      continue
    n[node] = circ.getNodeVoltages(node);
    if np.max(n[node]) > maxVal:
      maxVal = np.max(n[node])
    if np.min(n[node]) < minVal:
      minVal = np.min(n[node])
  maxVal += 0.2*maxVal
  
  f=plt.figure(figsize=(6,3))
  count = 0
  sty = ['b-', 'r-', 'g-', 'c-']
  for node in n:
    if node == "0":
      continue
    plt.plot(t, n[node], sty[count], linewidth=2, label = "Voltage in node "+node)
    count += 1
  plt.xlabel("Time [s]")
  plt.ylabel("Voltage [V]")
  plt.xlim([0, tFinal])
  plt.ylim([minVal, maxVal])
  plt.grid()
  plt.legend(loc = 'best')
  imgdata = StringIO.StringIO()
  f.savefig(imgdata)
  plt.close(f)
  imgdata.seek(0)  # rewind the data

  node_desc = ""
  for node in n:
    if node == "0":
      continue
    node_desc += "Node %s connected to: " % str(node)
    for i in range(0, len(nodeName[node])):
      node_desc += "%s" % str(nodeName[node][i])
      if i != len(nodeName[node])-1:
        node_desc += ","
    node_desc += "<br>"
  extra_text = "Simulation successful."
  data = {'img': urllib.quote(base64.b64encode(imgdata.buf)), 'node_description': node_desc, 'extra_text': extra_text, 'netlist': nl};
  return JsonResponse(data);
