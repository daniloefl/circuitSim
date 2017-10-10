#!/usr/bin/env python

# Tests Python interface of the circuit simulator


def main():

  # try to setup seaborn for a better style
  # comment out for the standard style
  try:
    import seaborn as sns
    #sns.set(style = "white", font_scale = 1.5)
    rcdark = {'axes.facecolor':'black', 'figure.facecolor':'black', 'axes.labelcolor': 'white', 'xtick.color': 'white', 'ytick.color': 'white', 'axes.edgecolor': 'white', 'text.color': 'white'}
    sns.set(style = "dark", font_scale = 1.5, rc = rcdark)
  except:
    pass

  # add the library to the Python PATH
  import sys
  sys.path.append('lib/')

  # Import the library
  import circuitPy
  # Create the main object
  c = circuitPy.Circuit()

  # Define the circuit below
  # node "0" is ground
  # 5 V pulse source
  c.addPulseVoltageSource("V1", "2", "0", 0, 5, 1, 0, 0, 1, 2, 4)
  #c.addDCVoltageSource("V1", "2", "0", 5)
  # add diode with default Is and Vt
  c.addDiode("D1", "1", "0", -1, -1)
  # 1 Ohm resistor
  c.addResistor("R1", "1", "0", 1.0)
  # 1 F capacitor
  c.addCapacitor("C1", "1", "2", 1.0)

  # Set simulation parameters
  tFinal = 20         # duration of simulation
  dt = 20e-3          # time step
  method = "GEAR"     # method can be BE or GEAR
  internalStep = 1    # number of steps before saving result
  c.setSimulationParameters(tFinal, dt, method, internalStep)

  # run simulation
  c.simulate()

  # get result in each time
  t = c.getTimeList()
  n1 = c.getNodeVoltages("1");
  n2 = c.getNodeVoltages("2");

  import numpy as np

  Ts = t[1] - t[0]
  print "Sampling freq.: ", 1/Ts
  k = np.arange(len(t))
  freq = k/(len(t)*Ts)

  freq = freq[0:len(freq)/2]
  fn1 = np.fft.fft(n1)
  fn1 = fn1[0:len(freq)]
  fn2 = np.fft.fft(n2)
  fn2 = fn2[0:len(freq)]

  import matplotlib.pyplot as plt
  f = plt.figure()
  plt.plot(t, n1, 'b-', linewidth=2, label = "Voltage in node 1")
  plt.plot(t, n2, 'g-', linewidth=2, label = "Voltage in node 2")
  plt.xlabel("Time [s]")
  plt.ylabel("Voltage [V]")
  plt.xlim([0, 20])
  plt.ylim([-6, 6])
  plt.grid()
  plt.legend(loc = 'best')
  plt.show()

  import numpy as np
  import matplotlib.pyplot as plt
  f, axarr = plt.subplots(2, sharex=True)
  axarr[0].plot(freq, np.absolute(fn1), 'b-', linewidth=2, label = "Node 1")
  axarr[0].plot(freq, np.absolute(fn2), 'g-', linewidth=2, label = "Node 2")
  axarr[0].set_ylabel("|FFT|")
  axarr[0].set_xlabel("")
  axarr[0].grid()
  axarr[0].legend(loc = 'best')
  axarr[1].plot(freq, np.angle(fn1), 'b-', linewidth=2, label = "Node 1")
  axarr[1].plot(freq, np.angle(fn2), 'g-', linewidth=2, label = "Node 2")
  axarr[1].set_ylabel("Angle(FFT)")
  axarr[1].set_xlabel("Frequency (Hz)")
  axarr[1].grid()
  axarr[1].legend(loc = 'best')
  plt.show()

if __name__ == '__main__':
  main()
