/*
 * Define circuit elements.
 *
 */

#ifndef CIRCUIT_H
#define CIRCUIT_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>

// Analysis type
enum analysisMethod {BE, GEAR};

// node definition
class Node {
  public:
  unsigned int      id;          // id of node in admittance matrix
  std::string       name;        // name in netlist
  Node(unsigned int _id = 0, const std::string &_name = "0");
  Node(const Node &n);
  ~Node();
};

typedef std::vector<Node> nodeList;

// Represents a single element
// All elements are daughters
class Element {
  public:
    std::string name;

    // current flows from node 1 to node 2
    // for the transistor: node 1 is collector and node 2 is the base
    unsigned int n1;
    unsigned int n2;

    Element();
    virtual ~Element();

    // add elements in matrix
    virtual void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

typedef std::vector< std::shared_ptr<Element> > elementList;

class Circuit {
  public:
    elementList element;
    nodeList node;

    Matrix table;

    unsigned int readLines;
    double tFinal;
    double dtSave;
    analysisMethod method;
    int nSteps;

    double time;
    unsigned int intStep;

    unsigned int addNode(Node n);
    unsigned int findNode(const std::string &name);
    void addElement(std::shared_ptr<Element> e);

    void readNetlist(const std::string &filename);

    Circuit();

    void simulate();
    void iteration(analysisMethod method, Matrix &VarInT, Matrix &VarInT0, Matrix *VarInT0MinusDeltaT, Matrix &Gm, Matrix &Is, Matrix &VarIterN, double deltaT, bool saveICInductor);

    void writeOut(const std::string &fname);

};

class Resistor : public Element {
  public:
    double R;
    Resistor(double value = 0);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) override;
};

class DCCurrentSource : public Element {
  public:
    double I;
    DCCurrentSource(double value = 0);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};
class SinCurrentSource : public Element {
  public:
    double dc, amplitude, freq, delay, atenuation, angle, nCycles;
    SinCurrentSource(double dc, double amplitude, double freq, double delay, double atenuation, double angle, double nCycles);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};
class PulseCurrentSource : public Element {
  public:
    double amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles;
    PulseCurrentSource(double amplitude1, double amplitude2, double delay, double tRise, double tFall, double tOn, double period, double nCycles);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class DCVoltageSource : public Element {
  public:
    double V;
    unsigned int extraNode;
    DCVoltageSource(double value = 0);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};
class SinVoltageSource : public Element {
  public:
    double dc, amplitude, freq, delay, atenuation, angle, nCycles;
    unsigned int extraNode;
    SinVoltageSource(double dc, double amplitude, double freq, double delay, double atenuation, double angle, double nCycles);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};
class PulseVoltageSource : public Element {
  public:
    double amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles;
    unsigned int extraNode;
    PulseVoltageSource(double amplitude1, double amplitude2, double delay, double tRise, double tFall, double tOn, double period, double nCycles);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class Transconductor : public Element {
  public:
    double value;
    unsigned int pos;
    unsigned int neg;
    Transconductor(double value, unsigned int pos, unsigned int neg);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class CurrentControlledCurrentSource : public Element {
  public:
    double value;
    unsigned int pos;
    unsigned int neg;
    unsigned int extraNode;
    CurrentControlledCurrentSource(double value, unsigned int pos, unsigned int neg);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class VoltageControlledVoltageSource : public Element {
  public:
    double value;
    unsigned int pos;
    unsigned int neg;
    unsigned int extraNode;
    VoltageControlledVoltageSource(double value, unsigned int pos, unsigned int neg);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class Transresistor : public Element {
  public:
    double value;
    unsigned int pos;
    unsigned int neg;
    unsigned int extraNode_source;
    unsigned int extraNode_external;
    Transresistor(double value, unsigned int pos, unsigned int neg);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class Capacitor : public Element {
  public:
    double value;
    double ic;
    Capacitor(double value, double ic = 0);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class Inductor : public Element {
  public:
    double value;
    double ic;
    double ICt;
    double ICT0MinusDeltaT;
    Inductor(double value, double ic = 0);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

class Diode : public Element {
  public:
    double Is;
    double Vt;
    Diode(double Is, double Vt);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

enum TransistorType {npn, pnp};

class Transistor : public Element {
  public:
    TransistorType type;
    double alpha, alphaRev, IsBE, VtBE, IsBC, VtBC;
    Transistor(TransistorType t, double alpha, double alphaRev, double IsBE, double VtBE, double IsBC, double VtBC);
    unsigned int emissorNode;
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

double readNumber(const std::string &s);

#endif

