# circuitSim

This project simulates an electronic circuit by solving the system's equations.
It can use the backward Euler or the GEAR 2nd order methods for integration.
It implements non-linear elements using the Newton-Raphson approximation.

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

This will generate the executable in `bin/circuitSim`, which can be executed as follows:

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
| Transistor                        | Q                            | Qname nBase nCollector nEmissor [npn|pnp alpha alphaRev IsBE VtBE IsBC VtBC] |

The output file is suitable to be used in Gnuplot for visualisation.
Each row indicates a time period. The first column indicates the time (in seconds). Other columns show the value of the voltage in each one of the nodes
in the input file. The current in auxiliary nodes are also shown and they are indicated by the fact that they end in "#j".
One can plot the results by running Gnuplot and typing the following to plot the voltage in column 2 versus time (column 1):

```
plot 'out.dat' using 1:2
```

