# circuitSim

This project simulates an electronic circuit by solving the system's equations.
It can use the backward Euler or the GEAR 2nd order methods for integration.
It implements non-linear elements using the Newton-Raphson approximation.

It has a Web interface, which requires Django, a Python interface and a text-mode standalone interface.

The linear elements it implements are:
  * resistor;
  * capacitor;
  * inductor;
  * current and voltage sources with the following signal shapes:
    * DC;
    * sinusoid (with delay and attenuation);
    * pulse;
  * current source controlled by voltage in another node;
  * current source controlled by current in another branch;
  * voltage source controlled by voltage in another node;
  * voltage source controlled by current in another branch.

It also supports the following non-linear elements:
  * diodes (allows specification of Is and Vt);
  * bipolar transistors using the Ebers-Moll model (both NPN and PNP junctions supported).

The program can be compiled as follows:

```
cmake .
make
```

There are two ways of performing the simulation. One can use Python to define the circuit and collect the
results of the simulation for plotting, ore one can use a standalone executable to read a net list with the circuit definition
and then get the result as a text file with the voltages in each node at each time point.

# Web interface

A Web interface is available, on which Django is used on the server-side and JavaScript is used
on the client. The server-side component communicates with the Python interface to perform the simulation.

To install the Web interface, one must have Python, the Boost Python libraries and Django installed.
To get the requirements in Ubuntu (substitute `python` with `python3` and `pip` with `pip3` to use Python 3 instead;
one can also remove `--user` and use `sudo -H pip install bokeh` for a global installation):

```
sudo apt-get install libboost-python-dev libboost-python python libpython-dev python-pip python-django cmake
pip install --user bokeh==0.12.10
```

First compile the Python interface. This will also copy the library `circuitPy.so` produced in the lib directory to
the static area of the web interface (`web/circuitSimSite/circuitSim/static/circuitSim`):

```
cmake .
make circuitPy
```

Then go to the web directory, copy the static libraries to the correct position using collectstatic and run the Django test server:

```
cd web/circuitSimSite
python manage.py collectstatic
python manage.py runserver
```

You can now access the Web interface in `localhost:8000`, in your browser.

# Python interface

The Python interface requires Boost with the BoostPython libraries.
To compile only the Python interface:

```
cmake .
make circuitPy
```

The Python interface can be easily accessed if the lib directory is added in the PYTHONPATH.
One can load the library as follows:

```
import circuitPy
```

And one can create an instance of `circuitPy.Circuit`, which can then be used to perform the simulation.
As an example, try executing the following script in Python:

```
./examples/testRC.py
```

For a more complex example:
```
./examples/testRCPulse.py
```

The same example in testRCPulse.py can be simulated in the standalone tool using the net list in
examples/rc.net.

# Standalone executable

`bin/circuitSim` can be executed as follows:

```
bin/circuitSim input.dat output.dat
```

The input file is expected in a standard net list format. The first line is ignored and lines
starting with `*` are ignored. Each line not starting with a dot (and that is not blank or a comment) is
assumed to indicate an element. The format expected is:

```
ElementName    node1    node2    [extra]
```

The element type is specified by the letter by which the element name starts. The letter to type association is shown below.
The node names can be anything that does not involve space.
For two-legged components, the current flows from node 1 to node 2.
For the diode and transistor, if Is and Vt are not specified, their standard values of 3.7751345e-14 A and 25 mV are taken.
For the transistor, the non transistor is the default, if it is not specified and the default alpha and alpha reverse are 0.99 and 0.5.
All values are in Volts, Ampères, Farad, Henry, Ohms, but every number can use the suffix m, u, n, p, K, Meg for milli, micro, nano, pico, Kilo, and Mega.
The voltage and current controlled sources, take the voltage or current
between n+ and n- and multiply it by "factor" to get the value of current or voltage to be emitted in them.
None of the specifications here are case sensitive.


| Type                              | First letter of element name | Specification format                                                         |
|-----------------------------------|------------------------------|------------------------------------------------------------------------------|
| Resistor                          | R                            | Rname n1 n2                                                                  |
| Current source                    | I                            | Iname n1 n2 current                                                          |
| Voltage source                    | V                            | Vname n1 n2 voltage                                                          |
| Voltage-controlled current source | G                            | Gname n1 n2 n+ n- factor                                                     |
| Current-controlled current source | F                            | Fname n1 n2 n+ n- factor                                                     |
| Voltage-controlled voltage source | E                            | Ename n1 n2 n+ n- factor                                                     |
| Current-controlled voltage source | H                            | Hname n1 n2 n+ n- factor                                                     |
| Capacitor                         | C                            | Cname n1 n2 capacitance [ic=initialVoltage]                                  |
| Inductor                          | L                            | Lname n1 n2 inductance [ic=initialCurrent]                                   |
| Diode                             | D                            | Dname n1 n2 [Is Vt]                                                          |
| Transistor                        | Q                            | Qname nBase nCollector nEmissor [npn\|pnp alpha alphaRev IsBE VtBE IsBC VtBC] |

The output file is suitable to be used in Gnuplot for visualisation.
Each row indicates a time period. The first column indicates the time (in seconds). Other columns show the value of the voltage in each one of the nodes
in the input file. The current in auxiliary nodes are also shown and they are indicated by the fact that they end in "#j".
One can plot the results by running Gnuplot and typing the following to plot the voltage in column 2 versus time (column 1):

```
plot 'out.dat' using 1:2
```


