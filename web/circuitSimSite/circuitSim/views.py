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

import bokeh.plotting
import bokeh.embed

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
  extra_text = ""
  node_desc = ""
  final_img = '''
<link rel="stylesheet" href="%s" type="text/css">
<script type="text/javascript" src="%s"></script>
''' % (static("circuitSim/bokeh-0.12.4.min.css"), static("circuitSim/bokeh-0.12.4.min.js"))
  
  e = {}
  conn = {}
  sim = {'tFinal': float(10), 'dt': float(1e-2), 'method': 'BE', 'internalStep': int(1)}
  try:
    if request.method == "POST":
      import json
      data = json.loads(request.POST.get('data'))
      e = data['elements']
      conn = data['connections']
      sim = data['simulation']
    else:
      raise "This should only be used with the POST method!"

    circ = circuitPy.Circuit()
    nodeName, nl = setupCircuit(circ, e, conn)
    nodeList = nodeName.keys()

    # Set simulation parameters
    tFinal = float(sim['tFinal'])              # duration of simulation
    dt = float(sim['dt'])                      # time step
    method = str(sim['method'])                # method can be BE or GEAR
    internalStep = int(sim['internalStep'])    # number of steps before saving result
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
  
    f = bokeh.plotting.figure()
    count = 0
    lc = ['blue', 'red', 'green', 'cyan', 'orange', 'magenta', 'pink', 'violet']
    for node in n:
      if node == "0":
        continue
      l = 'black'
      l = lc[count % len(lc)]
      f.line(t, n[node], line_color = l, line_width = 2, legend = "Voltage in node "+node)
      count += 1
    f.xaxis.axis_label = "Time [s]"
    f.yaxis.axis_label = "Voltage [V]"
    f.legend.location = "top_left"
    f.sizing_mode = "scale_width"
    script = ""
    div = ""
    script, div = bokeh.embed.components(f)
    final_img += script
    final_img += div

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
  except:
    extra_text = "Simulation failed!"
  data = {'img': final_img, 'node_description': node_desc, 'extra_text': extra_text, 'netlist': nl};
  return JsonResponse(data);
