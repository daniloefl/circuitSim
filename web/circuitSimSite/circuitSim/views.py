from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse

# add the library to the Python PATH
import sys
from django.conf import settings
sys.path.append(os.path.join(settings.STATIC_URL, 'circuitPy.so'))

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

def run(request):
  # Create the main object
  c = circuitPy.Circuit()
  if request.method == "POST":
    nl = request.POST["netlist"];
  else:
    nl = request.GET["netlist"];
  for line in nl.split('\n'):
    ll = line.split()
    if len(ll) == 0:
      break
    if "R" in ll[0]:
      c.addResistor(str(ll[0]), str(ll[1]), str(ll[2]), float(ll[3]));
    if 'V' in ll[0]:
      c.addDCVoltageSource(str(ll[0]), str(ll[1]), str(ll[2]), float(ll[3]));

  # Set simulation parameters
  tFinal = 1         # duration of simulation
  dt = 1e-2           # time step
  method = "BE"       # method can be BE or GEAR
  internalStep = 1    # number of steps before saving result
  c.setSimulationParameters(tFinal, dt, method, internalStep)

  # run simulation
  c.simulate()


  # get result in each time
  t = c.getTimeList()
  n = {}
  maxVal = -9999
  minVal = 9999
  for node in ["1"]:
    n[node] = c.getNodeVoltages(node);
    if np.max(n[node]) > maxVal:
      maxVal = np.max(n[node])
    if np.min(n[node]) < minVal:
      minVal = np.min(n[node])
  maxVal += 0.2*maxVal

  f=plt.figure(figsize=(6,3))
  count = 0
  sty = ['b-', 'r-', 'g-', 'c-']
  for node in n:
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

  data = {'img': urllib.quote(base64.b64encode(imgdata.buf))};
  return JsonResponse(data);
