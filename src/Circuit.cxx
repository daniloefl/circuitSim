/*
 * Implementa funcoes para trabalhar com circuitos.
 *
 */

#include "Matrix.h"
#include "Circuit.h"

#include <string>
#include <iostream>
#include <cmath>
#include <fstream>
#include <algorithm>
#include <sstream>
#include <exception>
#include <ctime>
#include <iomanip>
#include <stdexcept>

#include "Node.h"
#include "Element.h"
#include "Passive.h"
#include "Active.h"
#include "Source.h"
#include "DependentSource.h"

unsigned int Circuit::addNode(Node n) {
  node.push_back(n);
  return node.size()-1;
}

unsigned int Circuit::findNode(const std::string &name) {
  unsigned int i = 0;
  for(; i < node.size(); ++i) {
    if (node[i].name == name) return i;
  }
  return node.size();
}

void Circuit::addElement(std::shared_ptr<Element> e) {
  element.push_back(e);
}

// trim from start (in place)
inline void ltrim(std::string &s, int c = ' ') {
  s.erase(s.begin(), std::find_if(s.begin(), s.end(), [c](int ch) {
    return ch != c;
  }));
}
// trim from end (in place)
inline void rtrim(std::string &s, int c = ' ') {
  s.erase(std::find_if(s.rbegin(), s.rend(), [c](int ch) {
    return ch != c;
  }).base(), s.end());
}

// trim from both ends (in place)
inline void trim(std::string &s) {
  rtrim(s, '\n');
  ltrim(s, ' ');
  rtrim(s, ' ');
  std::replace(s.begin(), s.end(), '(', ' ');
  std::replace(s.begin(), s.end(), ')', ' ');
  ltrim(s, ' ');
  rtrim(s, ' ');
  std::transform(s.begin(), s.end(), s.begin(), ::tolower);
}

void Circuit::addResistor(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double R) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
  std::shared_ptr<Element> e;
  e.reset(new Resistor(R));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  addElement(e);
}

void Circuit::addCapacitor(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double C) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
      
  std::shared_ptr<Element> e;
  e.reset(new Capacitor(C));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  addElement(e);
}

void Circuit::addInductor(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double L) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
      
  std::shared_ptr<Element> e;
  e.reset(new Inductor(L));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  addElement(e);
}

void Circuit::addDCVoltageSource(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double V) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
  unsigned int new_node = addNode(Node(countNodes++, name+"#j"));
  std::shared_ptr<Element> e;
  e.reset(new DCVoltageSource(V));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  dynamic_cast<DCVoltageSource *>(e.get())->extraNode = new_node;
  addElement(e);
}

void Circuit::addSinVoltageSource(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double dc, double amplitude, double freq, double delay, double atenuation, double angle, double nCycles) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
  unsigned int new_node = addNode(Node(countNodes++, name+"#j"));
  std::shared_ptr<Element> e;
  e.reset(new SinVoltageSource(dc, amplitude, freq, delay, atenuation, angle, nCycles));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  dynamic_cast<SinVoltageSource *>(e.get())->extraNode = new_node;
  addElement(e);
}

void Circuit::addPulseVoltageSource(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double amplitude1, double amplitude2, double delay, double tRise, double tFall, double tOn, double period, double nCycles) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
  unsigned int new_node = addNode(Node(countNodes++, name+"#j"));
  std::shared_ptr<Element> e;
  e.reset(new PulseVoltageSource(amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  dynamic_cast<PulseVoltageSource *>(e.get())->extraNode = new_node;
  addElement(e);
}

void Circuit::addDiode(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double Is, double Vt) {
  unsigned int node1_itr = findNode(nodeName1);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeName1;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeName2);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeName2;
    node2_itr = addNode(node2);
  }
  if (Is < 0) Is = DIODE_STD_IS;
  if (Vt < 0) Vt = DIODE_STD_VT;
  std::shared_ptr<Element> e;
  e.reset(new Diode(Is, Vt));
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  addElement(e);
}

void Circuit::addTransistor(const std::string &name, const std::string &nodeNameB, const std::string &nodeNameC, const std::string &nodeNameE, const std::string &type, double alpha, double alphaRev, double IsBE, double VtBE, double IsBC, double VtBC) {
  unsigned int node1_itr = findNode(nodeNameB);
  if (node1_itr == node.size()) { // this node does not yet exist: add it
    Node node1;
    node1.id = countNodes++;
    node1.name = nodeNameB;
    node1_itr = addNode(node1);
  }
  unsigned int node2_itr = findNode(nodeNameC);
  if (node2_itr == node.size()) { // this node does not yet exist: add it
    Node node2;
    node2.id = countNodes++;
    node2.name = nodeNameC;
    node2_itr = addNode(node2);
  }
  unsigned int emissor_node = findNode(nodeNameE);
  if (emissor_node == node.size()) { // add it if it does not exist
    Node enode(countNodes++, nodeNameE);
    emissor_node = addNode(enode);
  }
  TransistorType t = npn;
  if (type == "pnp" || type == "PNP") t = pnp;
  if (alpha < 0) alpha = TRANSISTOR_STD_ALPHA;
  if (alphaRev < 0) alphaRev = TRANSISTOR_STD_ALPHA_REV;
  if (IsBE < 0) IsBE = DIODE_STD_IS;
  if (VtBE < 0) VtBE = DIODE_STD_VT;
  if (IsBC < 0) IsBC = DIODE_STD_IS;
  if (VtBC < 0) VtBC = DIODE_STD_VT;
  std::shared_ptr<Element> e;
  e.reset(new Transistor(t, alpha, alphaRev, IsBE, VtBE, IsBC, VtBC));
  dynamic_cast<Transistor *>(e.get())->emissorNode = emissor_node;
  e->n1 = node1_itr;
  e->n2 = node2_itr;
  e->name = name;
  addElement(e);
}

void Circuit::setSimulationParameters(double _tFinal, double _dtSave, const std::string &_method, unsigned int _intStep) {
  tFinal = _tFinal;
  dtSave = _dtSave;
  method = BE;
  if (_method == "gear") method = GEAR;
  intStep = _intStep;
}

// Parse netlist
void Circuit::readNetlist(const std::string &filename) {
  std::ifstream f(filename.c_str());

  readLines = 0;
  tFinal = 1;
  method = BE;

  std::string tmpC;

  std::string s;
  while (f) {
    std::getline(f, s);
    ++readLines;
    if (readLines == 1) continue; // ignore the first line
    trim(s);
    if (s.size() == 0) continue;
    if (s.at(0) == '*') continue; // comment

    if (s.at(0) == '.') { // command
      std::stringstream ss(s);
      std::string com;
      ss >> com;
      if (com.substr(0, 5) != ".tran") continue; // we only understand command "tran"
      // we are now in command tran
      ss >> tmpC; tFinal = readNumber(tmpC);
      if (tFinal == 0) throw std::runtime_error("Circuit::readNetlist: final time is zero!");
      ss >> tmpC; dtSave = readNumber(tmpC);
      if (dtSave == 0) throw std::runtime_error("Circuit::readNetlist: delta T is zero!");
      ss >> com;
      if (com == "gear") method = GEAR;
      ss >> intStep;
      if (intStep == 0) intStep = 1;
    } else { // assume this is a circuit element
      std::stringstream ss(s);
      std::string name, nodeName1, nodeName2;
      ss >> name >> nodeName1 >> nodeName2;
      unsigned int node1_itr = findNode(nodeName1);
      if (node1_itr == node.size()) { // this node does not yet exist: add it
        Node node1;
        node1.id = countNodes++;
        node1.name = nodeName1;
        node1_itr = addNode(node1);
      }
      unsigned int node2_itr = findNode(nodeName2);
      if (node2_itr == node.size()) { // this node does not yet exist: add it
        Node node2;
        node2.id = countNodes++;
        node2.name = nodeName2;
        node2_itr = addNode(node2);
      }
      
      std::shared_ptr<Element> e;
      std::string tmp_str;
      switch (name.at(0)) {
        case 'r': // resistor
        {
          ss >> tmpC;
          e.reset(new Resistor(readNumber(tmpC)));
          break;
        }
        case 'i': // independent current source
        {
          ss >> tmp_str;
          if (tmp_str == "dc") {
            ss >> tmpC;
            e.reset(new DCCurrentSource(readNumber(tmpC)));
          } else if (tmp_str == "sin") {
            double dc, amplitude, freq, delay, atenuation, angle, nCycles;
            ss >> tmpC; dc = readNumber(tmpC);
            ss >> tmpC; amplitude = readNumber(tmpC);
            ss >> tmpC; freq = readNumber(tmpC);
            ss >> tmpC; delay = readNumber(tmpC);
            ss >> tmpC; atenuation = readNumber(tmpC);
            ss >> tmpC; angle = readNumber(tmpC);
            ss >> tmpC; nCycles = readNumber(tmpC);
            e.reset(new SinCurrentSource(dc, amplitude, freq, delay, atenuation, angle, nCycles));
          } else if (tmp_str == "pulse") {
            double amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles;
            ss >> tmpC; amplitude1 = readNumber(tmpC);
            ss >> tmpC; amplitude2 = readNumber(tmpC);
            ss >> tmpC; delay = readNumber(tmpC);
            ss >> tmpC; tRise = readNumber(tmpC);
            ss >> tmpC; tFall = readNumber(tmpC);
            ss >> tmpC; tOn = readNumber(tmpC);
            ss >> tmpC; period = readNumber(tmpC);
            ss >> tmpC; nCycles = readNumber(tmpC);
            e.reset(new PulseCurrentSource(amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles));
          }
        }
          break;
        case 'v': // independent potential source
        {
          ss >> tmp_str;
          unsigned int new_node = addNode(Node(countNodes++, name+"#j"));
          if (tmp_str == "dc") {
            ss >> tmpC;
            e.reset(new DCVoltageSource(readNumber(tmpC)));
            dynamic_cast<DCVoltageSource *>(e.get())->extraNode = new_node;
          } else if (tmp_str == "sin") {
            double dc, amplitude, freq, delay, atenuation, angle, nCycles;
            ss >> tmpC; dc = readNumber(tmpC);
            ss >> tmpC; amplitude = readNumber(tmpC);
            ss >> tmpC; freq = readNumber(tmpC);
            ss >> tmpC; delay = readNumber(tmpC);
            ss >> tmpC; atenuation = readNumber(tmpC);
            ss >> tmpC; angle = readNumber(tmpC);
            ss >> tmpC; nCycles = readNumber(tmpC);
            e.reset(new SinVoltageSource(dc, amplitude, freq, delay, atenuation, angle, nCycles));
            dynamic_cast<SinVoltageSource *>(e.get())->extraNode = new_node;
          } else if (tmp_str == "pulse") {
            double amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles;
            ss >> tmpC; amplitude1 = readNumber(tmpC);
            ss >> tmpC; amplitude2 = readNumber(tmpC);
            ss >> tmpC; delay = readNumber(tmpC);
            ss >> tmpC; tRise = readNumber(tmpC);
            ss >> tmpC; tFall = readNumber(tmpC);
            ss >> tmpC; tOn = readNumber(tmpC);
            ss >> tmpC; period = readNumber(tmpC);
            ss >> tmpC; nCycles = readNumber(tmpC);
            e.reset(new PulseVoltageSource(amplitude1, amplitude2, delay, tRise, tFall, tOn, period, nCycles));
            dynamic_cast<PulseVoltageSource *>(e.get())->extraNode = new_node;
          }
        }
          break;
        case 'g': // voltage controlled current source
        {
          std::string external_name_pos, external_name_neg;
          ss >> external_name_pos;
          unsigned int external_node_pos = findNode(external_name_pos);
          if (external_node_pos == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_pos);
            external_node_pos = addNode(enode);
          }
          ss >> external_name_neg;
          unsigned int external_node_neg = findNode(external_name_neg);
          if (external_node_neg == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_neg);
            external_node_neg = addNode(enode);
          }
          double value;
          ss >> tmpC; value = readNumber(tmpC);
          e.reset(new Transconductor(value, external_node_pos, external_node_neg));
        }
          break;
        case 'f': // current controlled current source
        {
          std::string external_name_pos, external_name_neg, name_extra;
          ss >> external_name_pos;
          unsigned int external_node_pos = findNode(external_name_pos);
          if (external_node_pos == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_pos);
            external_node_pos = addNode(enode);
          }
          ss >> external_name_neg;
          unsigned int external_node_neg = findNode(external_name_neg);
          if (external_node_neg == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_neg);
            external_node_neg = addNode(enode);
          }
          double value;
          ss >> tmpC; value = readNumber(tmpC);
          e.reset(new CurrentControlledCurrentSource(value, external_node_pos, external_node_neg));
          name_extra = (external_name_pos+"#")+external_name_neg;
          Node enode(countNodes++, name_extra);
          unsigned int node_extra = addNode(enode);
          dynamic_cast<CurrentControlledCurrentSource*>(e.get())->extraNode = node_extra;
        }
          break;
        case 'e': // voltage controlled voltage source
        {
          std::string external_name_pos, external_name_neg, name_extra;
          ss >> external_name_pos;
          unsigned int external_node_pos = findNode(external_name_pos);
          if (external_node_pos == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_pos);
            external_node_pos = addNode(enode);
          }
          ss >> external_name_neg;
          unsigned int external_node_neg = findNode(external_name_neg);
          if (external_node_neg == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_neg);
            external_node_neg = addNode(enode);
          }
          double value;
          ss >> tmpC; value = readNumber(tmpC);
          name_extra = (name+"#j");
          Node enode(countNodes++, name_extra);
          unsigned int node_extra = addNode(enode);
          e.reset(new VoltageControlledVoltageSource(value, external_node_pos, external_node_neg));
          dynamic_cast<VoltageControlledVoltageSource *>(e.get())->extraNode = node_extra;
        }
          break;
        case 'h': // current controlled voltage source
        {
          std::string external_name_pos, external_name_neg, name_extra;
          ss >> external_name_pos;
          unsigned int external_node_pos = findNode(external_name_pos);
          if (external_node_pos == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_pos);
            external_node_pos = addNode(enode);
          }
          ss >> external_name_neg;
          unsigned int external_node_neg = findNode(external_name_neg);
          if (external_node_neg == node.size()) { // add it if it does not exist
            Node enode(countNodes++, external_name_neg);
            external_node_neg = addNode(enode);
          }
          double value;
          ss >> tmpC; value = readNumber(tmpC);

          e.reset(new Transresistor(value, external_node_pos, external_node_neg));

          std::string name_external = (external_name_pos+"#")+external_name_neg;
          std::string name_source = name+"#j";
          dynamic_cast<Transresistor *>(e.get())->extraNode_external = addNode(Node(countNodes++, name_external));
          dynamic_cast<Transresistor *>(e.get())->extraNode_source = addNode(Node(countNodes++, name_source));
        }
          break;
        case 'c': // capacitor
        {
          double value;
          double ic_value = 0;
          ss >> tmpC; value = readNumber(tmpC);
          std::string ic = "";
          ss >> ic;
          if (ic.substr(0, 3) == "ic=") ic_value = readNumber(ic.substr(3));
          e.reset(new Capacitor(value, ic_value));
        }
          break;
        case 'l': // inductor
        {
          double value;
          double ic_value = 0;
          ss >> tmpC; value = readNumber(tmpC);
          std::string ic = "";
          ss >> ic;
          if (ic.substr(0, 3) == "ic=") ic_value = readNumber(ic.substr(3));
          e.reset(new Inductor(value, ic_value));
        }
          break;
        case 'd': // diode
        {
          double Is, Vt;
          Is = DIODE_STD_IS;
          Vt = DIODE_STD_VT;
          std::string tmp = "";
          ss >> tmp;
          if (tmp != "") {
            Is = readNumber(tmp);
            tmp = "";
            ss >> tmp;
            if (tmp != "") Vt = readNumber(tmp);
          }
          e.reset(new Diode(Is, Vt));
        }
          break;
        case 'q': // transistor
        {
          std::string emissor_node_name;
          ss >> emissor_node_name;
          unsigned int emissor_node = findNode(emissor_node_name);
          if (emissor_node == node.size()) { // add it if it does not exist
            Node enode(countNodes++, emissor_node_name);
            emissor_node = addNode(enode);
          }
          TransistorType t = npn;
          std::string tmp;
          ss >> tmp;
          if (tmp == "pnp") t = pnp;
          double alpha, alphaRev, IsBE, VtBE, IsBC, VtBC; 
	  alpha = TRANSISTOR_STD_ALPHA;
	  alphaRev = TRANSISTOR_STD_ALPHA_REV;
	  IsBE = DIODE_STD_IS;
	  VtBE = DIODE_STD_VT;
	  IsBC = DIODE_STD_IS;
	  VtBC = DIODE_STD_VT;
          tmp = "";
          ss >> tmp;
          if (tmp != "") {
            alpha = readNumber(tmp);
            tmp = "";
            ss >> tmp;
            if (tmp != "") {
              alphaRev = readNumber(tmp);
              tmp = "";
              ss >> tmp;
              if (tmp != "") {
                IsBE = readNumber(tmp);
                tmp = "";
                ss >> tmp;
                if (tmp != "") {
                  VtBE = readNumber(tmp);
                  tmp = "";
                  ss >> tmp;
                  if (tmp != "") {
                    IsBC = readNumber(tmp);
                    tmp = "";
                    ss >> tmp;
                    if (tmp != "") {
                      VtBC = readNumber(tmp);
                    }
                  }
                }
              }
            }
          }
          e.reset(new Transistor(t, alpha, alphaRev, IsBE, VtBE, IsBC, VtBC));
          dynamic_cast<Transistor *>(e.get())->emissorNode = emissor_node;
        }
          break;
        default:
          break;
      }
      e->n1 = node1_itr;
      e->n2 = node2_itr;
      e->name = name;
      addElement(e);
    }
  }

  f.close();
}

// read number converting units
double readNumber(const std::string &s) {
  double tmp;
  char *endptr;

  tmp = std::strtod(s.c_str(), &endptr);
  int p = (int) (endptr - s.c_str());
  std::string unit = s.substr(p);
  if (unit == "m") tmp *= 1e-3;
  else if (unit == "u") tmp *= 1e-6;
  else if (unit == "n") tmp *= 1e-9;
  else if (unit == "p") tmp *= 1e-12;
  else if (unit == "K") tmp *= 1e3;
  else if (unit == "Meg") tmp *= 1e6;

  return tmp;
}

Circuit::Circuit() {
  countNodes = 0;
  intStep = 1;
  time = 0;
  method = BE;
  tFinal = 1; // 1 second
  dtSave = 1e-3; // save each 1 ms
  addNode(Node(0, "0"));
  ++countNodes;
}

void Circuit::simulate() {

  double dt;
  unsigned int step;
  unsigned int nSave;


  if ( (dtSave == 0) || (intStep == 0) )
    throw std::runtime_error("Invalid configuration.");

  if (node.size() < 2)
    throw std::runtime_error("Only one node!");

  dt = dtSave/((double) intStep);

  // Numero de gravacoes
  // Soma 1 por causa do tempo = 0
  // Soma mais 1 por um BUG no arredondamento ...
  nSave = ((unsigned int) std::floor(tFinal/dtSave)) + 2;

  table.resize(nSave, node.size()-1);
  Matrix Gm(node.size()-1, node.size()-1);
  Matrix Is(node.size()-1, 1);

  // In T, iter. N
  Matrix VarIterN(node.size()-1, 1);
  // In T, iter. N+1
  Matrix VarInT(node.size()-1, 1);
  // In T0, last iter.
  Matrix VarInT0(node.size()-1, 1);
  VarInT0.zero();
  VarInT.zero();
  VarIterN.zero();

  // In T0 - delta T, last iter. (only for GEAR)
  Matrix VarInT0MinusDeltaT(node.size()-1, 1);
  VarInT0MinusDeltaT.zero();

  // Set seed
  std::srand(std::time(NULL));

  // calculate initial condition
  // step with dt/1000
  // Quando o argumento VariaveisEmT0 de gerarEstampas eh NULL,
  // entende-se que queremos calcular a condicao inicial ...
  time = 0;
  step = 0;

  // with the BE method, VarInT0MinusDeltaT is not changed
  iteration(BE, VarInT, VarInT0, 0x0, Gm, Is, VarIterN, dt/1e3, 1);
  table.copyRow(VarInT, 0);

  time += dt; ++step;

  if (method == GEAR) {
    // In the GEAR method, we need to know the state in t0 - dt before the next iteration
    // So, do the first two iterations in BE
    VarInT0MinusDeltaT = VarInT0;
    iteration(BE, VarInT, VarInT0, 0x0, Gm, Is, VarIterN, dt, 1);
    if (intStep == 1)
      table.copyRow(VarInT, 1);
    time += dt; ++step;
  }

  // Main loop
  while (time <= tFinal) {

    iteration(method, VarInT, VarInT0, &VarInT0MinusDeltaT, Gm, Is, VarIterN, dt, 0);

    // Now VarInT0 are the variables in the current time
    if ( step % intStep == 0) { // save it each dtSave
      table.copyRow(VarInT, (unsigned int) (step/intStep));
    }

    time += dt;
    ++step;
  }
}

// Se (salvaICIndutor = 1 e o metodo eh BE) OU (o metodo eh GEAR), salvamos IC(t0-dt) no indutor, senao ignoramos ela!
void Circuit::iteration(analysisMethod method, Matrix &VarInT, Matrix &VarInT0, Matrix *VarInT0MinusDeltaT, Matrix &Gm, Matrix &Is, Matrix &VarIterN, double deltaT, bool saveICInductor) {

  unsigned int convTest;
  unsigned int step;
  char aprox;

  convTest = 0;
  do {

    step = 0;
    if (convTest == 0) { // for the first iteration, use variables in the previous time
      VarInT0 = VarInT;
    } else { // randomise
      VarInT.random();
    }

    do {
      VarIterN = VarInT;

      Gm.zero();
      Is.zero();
      
      // Generate Gm and Is
      if (method == BE) {
        for (auto &e : element) {
          e->makeElements(Gm, Is, deltaT, time, VarInT0, 0x0, VarIterN);
        }
      } else {
        for (auto &e : element) {
          e->makeElements(Gm, Is, deltaT, time, VarInT0, VarInT0MinusDeltaT, VarIterN);
        }
      }
 
      // Solve system
      VarInT = Matrix::solve(Gm, Is);

      ++step; // N = N + 1
      
    } while (((!(VarInT.closeTo(VarIterN))) && (step < MAX_ITER)));

    if (step < MAX_ITER) // if this ended before the max. number of iterations, there was convergence
      break;

    ++convTest;
  } while (convTest < MAX_CONVERGENCE_TEST);

  if (convTest >= MAX_CONVERGENCE_TEST) {
    throw std::runtime_error("No convergence.");
  }

  // Convergence and the last solution is in VarInT!

  // copy current solution to the one in T0
  if (method == GEAR)
    *VarInT0MinusDeltaT = VarInT0;

  VarInT0 = VarInT;

  // store new initial condition for inductors
  for (auto & e : element) {
    Inductor *l = dynamic_cast<Inductor *>(e.get());
    if (!l) continue;
    if ((saveICInductor && method == BE) || method == GEAR)
      l->ICT0MinusDeltaT = l->ic;
    l->ic = l->ICt;
  }
}

void Circuit::writeOut(const std::string &fname) {
  std::ofstream fout(fname.c_str());
  fout << "# Output" << std::endl;
  fout << "#" << std::endl;
  fout << "# ";
  for (unsigned int kn = 0; kn < node.size(); ++kn) {

    if (kn == 0) {
      fout << std::left << std::setw(16) << "Time ";
    } else {
      Node *n = &(node[kn]);
      fout << std::left << std::setw(16) << n->name << " ";
    }
  }
  fout << std::endl;

  double disp_t = 0;
  for (unsigned int k = 0; k < table.m_r; ++k) {
    fout << std::left << std::setw(16) << std::scientific << std::setprecision(9) << disp_t;
    fout << " ";
    for (unsigned int kn = 0; kn < table.m_c; ++kn) {
      fout << std::left << std::setw(16) << std::scientific << std::setprecision(9) << table(k, kn);
      fout << " ";
    }
    fout << std::endl;
    disp_t += dtSave;
  }
  fout.close();
}

