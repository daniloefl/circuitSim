from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
from django.template import RequestContext

from django.templatetags.static import static

from django.views.decorators.csrf import ensure_csrf_cookie

# add the library to the Python PATH
import sys
import os
from django.conf import settings
sys.path.append(os.path.join(settings.STATIC_ROOT, 'circuitSim'));

# Import the library
import circuitPy

import numpy as np

import plotly.plotly as py
import plotly.graph_objs as go
import plotly.offline.offline as pyo

#import bokeh.plotting
#import bokeh.models
#import bokeh.embed

@ensure_csrf_cookie
def index(request):
    c = RequestContext(request).flatten()
    template = loader.get_template('circuitSim/index.html')
    return HttpResponse(template.render(c))

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
  nl = ""
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


  # connect nodes
  for ekey in e:
    for n in e[ekey]['nodes']:
      nname = ekey+"#"+str(n)
      nid = findNodeId(nname, nodeName)
      cname = nid
      if nid == "":
        lastNodeNumber += 1
        cname = str(lastNodeNumber)
      connectNodes(nname, cname, nodeName, conn)
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
      if e[name]['type'] == 'DC':
        circ.addDCVoltageSource(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value_dc']))
        nl += "%s %s %s DC %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value_dc']))
      elif e[name]['type'] == 'PULSE':
        circ.addPulseVoltageSource(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['amplitude1_pulse']), float(e[name]['amplitude2_pulse']), float(e[name]['delay_pulse']), float(e[name]['tRise_pulse']), float(e[name]['tFall_pulse']), float(e[name]['tOn_pulse']), float(e[name]['period_pulse']), float(e[name]['nCycles_pulse']) )
        nl += "%s %s %s PULSE %f %f %f %f %f %f %f %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['amplitude1_pulse']), float(e[name]['amplitude2_pulse']), float(e[name]['delay_pulse']), float(e[name]['tRise_pulse']), float(e[name]['tFall_pulse']), float(e[name]['tOn_pulse']), float(e[name]['period_pulse']), float(e[name]['nCycles_pulse']) )
      elif e[name]['type'] == 'SIN':
        circ.addSinVoltageSource(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['dc_sin']), float(e[name]['amplitude_sin']), float(e[name]['freq_sin']), float(e[name]['delay_sin']), float(e[name]['atenuation_sin']), float(e[name]['angle_sin']), float(e[name]['nCycles_sin']))
        nl += "%s %s %s SIN %f %f %f %f %f %f %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['dc_sin']), float(e[name]['amplitude_sin']), float(e[name]['freq_sin']), float(e[name]['delay_sin']), float(e[name]['atenuation_sin']), float(e[name]['angle_sin']), float(e[name]['nCycles_sin']))
    if "C" in name:
      circ.addCapacitor(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
      nl += "%s %s %s %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
    if "L" in name:
      circ.addInductor(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
      nl += "%s %s %s %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['value']))
    if "D" in name:
      circ.addDiode(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['Is']), float(e[name]['Vt']))
      nl += "%s %s %s %f %f\n" %(str(name), findNodeId(name+"#N1", nodeName), findNodeId(name+"#N2", nodeName), float(e[name]['Is']), float(e[name]['Vt']))
    if "Q" in name:
      circ.addTransistor(str(name), findNodeId(name+"#N2", nodeName), findNodeId(name+"#N3", nodeName), findNodeId(name+"#N1", nodeName), str(e[name]['type']), float(e[name]['alpha']), float(e[name]['alphaRev']), -1, -1, -1, -1)
      nl += "%s %s %s %s %s %f %f %f %f %f %f\n" %(str(name), findNodeId(name+"#N2", nodeName), findNodeId(name+"#N3", nodeName), findNodeId(name+"#N1", nodeName), str(e[name]['type']), float(e[name]['alpha']), float(e[name]['alphaRev']), float(e[name]['IsBE']), float(e[name]['VtBE']), float(e[name]['IsBC']), float(e[name]['VtBC']))
  return [nodeName, nl]

def run(request):
  # Create the main object
  extra_text = ""
  node_desc = ""
  final_img = """
    <script type="text/javascript">{plotlyjs}</script>
""".format(plotlyjs = pyo.get_plotlyjs())
  nl = ""
  #data = {'img': final_img, 'node_description': node_desc, 'extra_text': extra_text, 'netlist': nl};
  #return JsonResponse(data);

  e = {}
  conn = {}
  sim = {'tFinal': float(10), 'dt': float(1e-2), 'method': 'BE', 'internalStep': int(1), 'fft': False, 'nodes' : []}
  try:
    if request.method == "POST":
      import json
      data = json.loads(request.POST.get('data'))
    elif request.method == "GET":
      import json
      data = json.loads(request.GET.get('data'))
    e = data['elements']
    conn = data['connections']
    sim = data['simulation']


    circ = circuitPy.Circuit()
    nodeName, nl = setupCircuit(circ, e, conn)
    nodeList = []
    nodeListHuman = {}
    if len(sim['nodes']) == 0:
      nodeList = nodeName.keys()
    else: # read it from input
      for k in sim['nodes']:
        kstr = str(k)
        nid = findNodeId(kstr, nodeName)
        nodeList.append(nid)
        nodeListHuman[kstr] = nid


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
    fn = {}
    fnAbs = {}
    fnAng = {}
    Ts = t[1] - t[0]
    k = np.arange(len(t))
    freq = k/(len(t)*Ts)
    freq = freq[0:len(freq)/2]

    for nname in nodeListHuman:
      node = nodeListHuman[nname]
      if node == "0":
        n[nname] = [0.0 for i in range(0, len(t))]
        fn[nname] = [0.0 for i in range(0, len(freq))]
        fnAbs[nname] = [0.0 for i in range(0, len(freq))]
        fnAng[nname] = [0.0 for i in range(0, len(freq))]
        continue
      n[nname] = circ.getNodeVoltages(node);
      if (sim['fft']):
        fn[nname] = np.fft.fft(n[nname])
        fn[nname] = fn[nname][0:len(freq)]
        fnAbs[nname] = np.absolute(fn[nname])
        fnAng[nname] = np.angle(fn[nname])

    t = t[:-internalStep]
    for nname in nodeListHuman:
      node = nodeListHuman[nname]
      if node == "0":
        continue
      n[nname] = n[nname][:-internalStep]

    maxVal = -9999
    minVal = 9999
    maxValF = -9999
    minValF = 9999
    maxValFA = -9999
    minValFA = 9999
    for nname in nodeListHuman:
      node = nodeListHuman[nname]
      if node == "0":
        continue
      if np.max(n[nname]) > maxVal:
        maxVal = np.max(n[nname])
      if np.min(n[nname]) < minVal:
        minVal = np.min(n[nname])
      if (sim['fft']):
        if np.max(fnAbs[nname]) > maxValF:
          maxValF = np.max(fnAbs[nname])
        if np.min(fnAbs[nname]) < minValF:
          minValF = np.min(fnAbs[nname])
        if np.max(fnAng[nname]) > maxValFA:
          maxValFA = np.max(fnAng[nname])
        if np.min(fnAng[nname]) < minValFA:
          minValFA = np.min(fnAng[nname])
    maxVal += 0.2*maxVal
    maxValF += 0.2*maxValF
    maxValFA += 0.2*maxValFA
    minVal -= 0.01*np.abs(maxVal)
    if minValF <= 0:
      minValF = 1e-3*maxValF
    if minValFA <= 0:
      minValFA = 1e-3*maxValFA

    count = 0
    if (not sim['fft']):
      data = []
      layout = dict(title = '',
              #autosize=True,
              #width=500,
              height=500,
              xaxis = dict(title = 'Time [s]'),
              yaxis = dict(title = 'Voltage [V]'),
              )
      for nname in n:
        data.append(go.Scatter(x = t, y = n[nname], mode = 'lines', name = nname))
        count += 1
      fig = dict(data = data, layout = layout)
      plot_html = pyo.plot(fig, output_type = 'div', include_plotlyjs=False)
      final_img += plot_html
    else:
      data = []
      layout = dict(title = '',
              #autosize=True,
              #width=500,
              height=500,
              xaxis = dict(title = 'Frequency [Hz]'),
              yaxis = dict(title = '|FFT| [V]'),
              )
      count = 0
      for nname in n:
        data.append(go.Scatter(x = freq, y = fnAbs[nname], mode = 'lines', name = nname))
        count += 1
      fig = dict(data = data, layout = layout)
      plot_html = pyo.plot(fig, output_type = 'div', include_plotlyjs=False)
      final_img += plot_html

      data = []
      layout = dict(title = '',
              #autosize=True,
              #width=500,
              height=500,
              xaxis = dict(title = 'Frequency [Hz]'),
              yaxis = dict(title = 'Angle(FFT) [rad]'),
              )
      count = 0
      for nname in n:
        data.append(go.Scatter(x = freq, y = fnAng[nname], mode = 'lines', name = nname))
        count += 1
      fig = dict(data = data, layout = layout)
      plot_html = pyo.plot(fig, output_type = 'div', include_plotlyjs=False)
      final_img += plot_html

    node_desc = "Net list:<br>"+nl.replace("\n", "<br>")
    extra_text = "Simulation successful."
  except:
    node_desc = "Net list:<br>"+nl.replace("\n", "<br>")
    extra_text = "Simulation failed!"
  data = {'img': final_img, 'node_description': node_desc, 'extra_text': extra_text, 'netlist': nl};
  return JsonResponse(data);
