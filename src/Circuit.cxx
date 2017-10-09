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

Element::Element() {
}

Element::~Element() {
}

void Element::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  throw std::runtime_error("Calling base-class Element to fill matrices: it does not represent a real element!");
}

void Resistor::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  
  if (n1 != 0)
    Gm(ni1, ni1) +=  1.0/R;
  if (n1 != 0 && n2 != 0)
    Gm(ni1, ni2) += -1.0/R;
  if (n1 != 0 && n2 != 0)
    Gm(ni2, ni1) += -1.0/R;
  if (n2 != 0)
    Gm(ni2, ni2) +=  1.0/R;
}

void DCCurrentSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  
  if (n1 != 0)
    Is(ni1,   0) += -I;
  if (n2 != 0)
    Is(ni2,   0) +=  I;
}

void SinCurrentSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;

  double I = 0;
  if ( (t < delay) ||
       (t > delay + (nCycles/freq))) {
    I = dc + amplitude*std::sin(M_PI*angle/180.0);
    } else {
    I = dc + amplitude*std::exp(-(t-delay)*atenuation)*std::sin(2*M_PI*freq*(t-delay) + (M_PI*angle/180.0));
  }
  
  if (n1 != 0)
    Is(ni1,   0) += -I;
  if (n2 != 0)
    Is(ni2,   0) +=  I;
}

void PulseCurrentSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;

  double I = 0;
  if ( (t < delay) || (t > delay + (nCycles*period))) {
    I = amplitude1;
  } else {
    double aux = period*(((t-delay)/period) - ( (double) ( std::floor((t-delay)/period)) ) );
    if ((aux) < tRise){
      if (tRise != 0)
        I = amplitude1 + ((amplitude2-amplitude1)/tRise)*(aux) ;
      else
        I = amplitude1;
    } else if (((aux) >= (tRise)) && ((aux) <= (tOn+tRise))) {
      I = amplitude2;
    } else if (((aux) > (tOn+tRise)) && ((aux) < (tRise+tOn+tFall))){
      if (tFall != 0)
        I = amplitude2 - ((amplitude2-amplitude1)/tFall)*(aux-tRise-tOn);
      else
        I = amplitude1;
    } else {
      I = amplitude1;
    }
  }
  
  if (n1 != 0)
    Is(ni1,   0) += -I;
  if (n2 != 0)
    Is(ni2,   0) +=  I;
}

void DCVoltageSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nie = extraNode-1;
  
  if (n1 != 0 && extraNode != 0)
    Gm(ni1, nie) +=  1;
  if (n2 != 0 && extraNode != 0)
    Gm(ni2, nie) += -1;
  if (n1 != 0 && extraNode != 0)
    Gm(nie, ni1) += -1;
  if (n2 != 0 && extraNode != 0)
    Gm(nie, ni2) +=  1;
  if (extraNode != 0)
    Is(nie,   0) += -V;
}

void SinVoltageSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nie = extraNode-1;

  double V = 0;
  if ( (t < delay) ||
       (t > delay + (nCycles/freq))) {
    V = dc + amplitude*std::sin(M_PI*angle/180.0);
    } else {
    V = dc + amplitude*std::exp(-(t-delay)*atenuation)*std::sin(2*M_PI*freq*(t-delay) + (M_PI*angle/180.0));
  }
  
  if (n1 != 0 && extraNode != 0)
    Gm(ni1, nie) +=  1;
  if (n2 != 0 && extraNode != 0)
    Gm(ni2, nie) += -1;
  if (n1 != 0 && extraNode != 0)
    Gm(nie, ni1) += -1;
  if (n2 != 0 && extraNode != 0)
    Gm(nie, ni2) +=  1;
  if (extraNode != 0)
    Is(nie,   0) += -V;
}

void PulseVoltageSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nie = extraNode-1;

  double V = 0;
  if ( (t < delay) || (t > delay + (nCycles*period))) {
    V = amplitude1;
  } else {
    double aux = period*(((t-delay)/period) - ( (double) ( std::floor((t-delay)/period)) ) );
    if ((aux) < tRise){
      if (tRise != 0)
        V = amplitude1 + ((amplitude2-amplitude1)/tRise)*(aux) ;
      else
        V = amplitude1;
    } else if (((aux) >= (tRise)) && ((aux) <= (tOn+tRise))) {
      V = amplitude2;
    } else if (((aux) > (tOn+tRise)) && ((aux) < (tRise+tOn+tFall))){
      if (tFall != 0)
        V = amplitude2 - ((amplitude2-amplitude1)/tFall)*(aux-tRise-tOn);
      else
        V = amplitude1;
    } else {
      V = amplitude1;
    }
  }
  
  if (n1 != 0 && extraNode != 0)
    Gm(ni1, nie) +=  1;
  if (n2 != 0 && extraNode != 0)
    Gm(ni2, nie) += -1;
  if (n1 != 0 && extraNode != 0)
    Gm(nie, ni1) += -1;
  if (n2 != 0 && extraNode != 0)
    Gm(nie, ni2) +=  1;
  if (extraNode != 0)
    Is(nie,   0) += -V;
}

void Transconductor::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nip = pos-1;
  unsigned int nin = neg-1;

  if (n1 != 0 && pos != 0)
    Gm(ni1, nip) +=  value;
  if (n1 != 0 && neg != 0)
    Gm(ni1, nin) += -value;
  if (n2 != 0 && pos != 0)
    Gm(ni2, nip) += -value;
  if (n2 != 0 && neg != 0)
    Gm(ni2, nin) +=  value;
}

void Transresistor::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nip = pos-1;
  unsigned int nin = neg-1;

  unsigned int nie1 = extraNode_external;
  unsigned int nie2 = extraNode_source;

  if (n1 != 0 && extraNode_source != 0)
    Gm(ni1, nie2)  +=  1;
  if (n2 != 0 && extraNode_source != 0)
    Gm(ni2, nie2)  += -1;

  if (pos != 0 && extraNode_external != 0)
    Gm(nip, nie1)  +=  1;
  if (neg != 0 && extraNode_external != 0)
    Gm(nin, nie1)  += -1;

  if (pos != 0 && extraNode_external != 0)
    Gm(nie1, nip)  += -1;
  if (neg != 0 && extraNode_external != 0)
    Gm(nie1, nin)  +=  1;

  if (n1 != 0 && extraNode_source != 0)
    Gm(nie2, ni1)  += -1;
  if (n2 != 0 && extraNode_source != 0)
    Gm(nie2, ni2)  +=  1;
  if (extraNode_external != 0 && extraNode_source != 0)
    Gm(nie2, nie1) += value;
}

void CurrentControlledCurrentSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nip = pos-1;
  unsigned int nin = neg-1;

  unsigned int nie = extraNode-1;

  if (n1 != 0 && extraNode != 0)
    Gm(ni1, nie)  +=  value;
  if (n2 != 0 && extraNode != 0)
    Gm(ni2, nie)  += -value;

  if (pos != 0 && extraNode != 0)
    Gm(nip, nie)  +=  1;
  if (neg != 0 && extraNode != 0)
    Gm(nin, nie)  += -1;

  if (pos != 0 && extraNode != 0)
    Gm(nie, nip)  += -1;
  if (neg != 0 && extraNode != 0)
    Gm(nie, nin)  +=  1;
}

void VoltageControlledVoltageSource::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  unsigned int nip = pos-1;
  unsigned int nin = neg-1;

  unsigned int nie = extraNode-1;

  if (n1 != 0 && extraNode != 0)
    Gm(ni1, nie)  +=  1;
  if (n2 != 0 && extraNode != 0)
    Gm(ni2, nie)  += -1;

  if (n1 != 0 && extraNode != 0)
    Gm(nie, ni1)  += -1;
  if (n2 != 0 && extraNode != 0)
    Gm(nie, ni2)  +=  1;

  if (pos != 0 && extraNode != 0)
    Gm(nie, nip)  +=  value;
  if (neg != 0 && extraNode != 0)
    Gm(nie, nin)  += -value;
}

void Capacitor::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  double charge = ic;
  double dV = 0;
  if (n1 != 0) dV +=  VarInT0(ni1, 0);
  if (n2 != 0) dV += -VarInT0(ni2, 0);

  if (!VarInT0MinusDT) {
    if (t > 0) charge = dV;

    if (n1 != 0)
      Is(ni1, 0)  +=  value*charge/deltaT;
    if (n2 != 0)
      Is(ni2, 0)  += -value*charge/deltaT;

    if (n1 != 0)
      Gm(ni1, ni1)  +=  value/deltaT;
    if (n1 != 0 && n2 != 0)
      Gm(ni1, ni2)  += -value/deltaT;
    if (n1 != 0 && n2 != 0)
      Gm(ni2, ni1)  += -value/deltaT;
    if (n2 != 0)
      Gm(ni2, ni2)  +=  value/deltaT;
  } else {
    double dVo = 0;
    if (n1 != 0) dVo +=  (*VarInT0MinusDT)(ni1, 0);
    if (n2 != 0) dVo += -(*VarInT0MinusDT)(ni2, 0);

    if (t > 0) charge = value*((4.0/3.0)*dV - (1.0/3.0)*dVo)/(2.0*deltaT/3.0);

    if (n1 != 0)
      Is(ni1, 0)  +=  charge;
    if (n2 != 0)
      Is(ni2, 0)  += -charge;

    if (n1 != 0)
      Gm(ni1, ni1)  +=  value/(2.0*deltaT/3.0);
    if (n1 != 0 && n2 != 0)
      Gm(ni1, ni2)  += -value/(2.0*deltaT/3.0);
    if (n1 != 0 && n2 != 0)
      Gm(ni2, ni1)  += -value/(2.0*deltaT/3.0);
    if (n2 != 0)
      Gm(ni2, ni2)  +=  value/(2.0*deltaT/3.0);
  }

}

void Inductor::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  double charge = ic;

  if (!VarInT0MinusDT) {
    if (t > 0) charge += (VarInT0(ni1, 0) - VarInT0(ni2, 0))/(value/deltaT);
    ICt = charge;

    if (n1 != 0)
      Is(ni1, 0)  += -charge;
    if (n2 != 0)
      Is(ni2, 0)  +=  charge;

    if (n1 != 0)
      Gm(ni1, ni1)  +=  deltaT/value;
    if (n1 != 0 && n2 != 0)
      Gm(ni1, ni2)  += -deltaT/value;
    if (n1 != 0 && n2 != 0)
      Gm(ni2, ni1)  += -deltaT/value;
    if (n2 != 0)
      Gm(ni2, ni2)  +=  deltaT/value;
  } else {
    if (t > 0) charge = (4.0/3.0)*(ic + ( (VarInT0(ni1, 0) - VarInT0(ni2, 0))/((3.0/2.0)*value/deltaT))) - (1.0/3.0)*((ICT0MinusDeltaT) + ( ((*VarInT0MinusDT)(ni1, 0) - (*VarInT0MinusDT)(ni2, 0))/((3.0/2.0)*value/deltaT)));
    ICt = charge;

    if (n1 != 0)
      Is(ni1, 0)  += -charge;
    if (n2 != 0)
      Is(ni2, 0)  +=  charge;

    if (n1 != 0)
      Gm(ni1, ni1)  +=  (2.0/3.0)*deltaT/value;
    if (n1 != 0 && n2 != 0)
      Gm(ni1, ni2)  += -(2.0/3.0)*deltaT/value;
    if (n1 != 0 && n2 != 0)
      Gm(ni2, ni1)  += -(2.0/3.0)*deltaT/value;
    if (n2 != 0)
      Gm(ni2, ni2)  +=  (2.0/3.0)*deltaT/value;
  }

}

void Diode::makeElements(Matrix &Gm, Matrix &IsM, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int ni1 = n1-1;
  unsigned int ni2 = n2-1;
  double Isaux = this->Is;
  double Vtaux = Vt;
  double G0,I0;

  double dV = 0;
  if (n1 != 0) dV +=   VarIterN(ni1, 0);
  if (n2 != 0) dV += - VarIterN(ni2, 0);
  if ( ((dV)/Vtaux) > THRESHOLD_V_VT ) {
    G0 = (Isaux/Vtaux)*std::exp(THRESHOLD_V_VT);
    I0 = Isaux*(std::exp(THRESHOLD_V_VT)-1.0) - G0*THRESHOLD_V_VT*Vtaux;
  } else {
    G0 = (Isaux/Vtaux)*std::exp(dV/Vtaux);
    I0 = Isaux*(std::exp(dV/Vtaux) - 1.0) - G0*dV;
  }

  if (n1 != 0)
    IsM(ni1, 0)  += -I0;
  if (n2 != 0)
    IsM(ni2, 0)  +=  I0;

  if (n1 != 0)
    Gm(ni1, ni1)  +=  G0;
  if (n1 != 0 && n2 != 0)
    Gm(ni1, ni2)  += -G0;
  if (n1 != 0 && n2 != 0)
    Gm(ni2, ni1)  += -G0;
  if (n2 != 0)
    Gm(ni2, ni2)  +=  G0;
}

void Transistor::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  unsigned int nic = n1-1;
  unsigned int nib = n2-1;
  unsigned int nie = emissorNode-1;
  double GBE, GBC, IBE, IBC;
  double nIsBE = IsBE, nIsBC = IsBC, nVtBE = VtBE, nVtBC = VtBC;

  if (type == pnp) {
    nIsBE = -IsBE;
    nIsBC = -IsBC;
    nVtBE = -VtBE;
    nVtBC = -VtBC;
  }

  double dVbe = 0;
  if (n2 != 0) dVbe +=   VarIterN(nib, 0);
  if (emissorNode != 0) dVbe += - VarIterN(nie, 0);
  if ( (dVbe/nVtBE) > THRESHOLD_V_VT ) {
    GBE = (nIsBE/nVtBE)*std::exp(THRESHOLD_V_VT);
    IBE = (nIsBE*(std::exp(THRESHOLD_V_VT)-1)) - (GBE*THRESHOLD_V_VT*nVtBE);
  } else {
    GBE = (nIsBE/nVtBE)*exp(dVbe/nVtBE);
    IBE = (nIsBE*(std::exp(dVbe/nVtBE)-1.0)) - (GBE*dVbe);
  }
  
  double dVbc = 0;
  if (n2 != 0) dVbc +=   VarIterN(nib, 0);
  if (n1 != 0) dVbc += - VarIterN(nic, 0);
  if ( (dVbc/nVtBC) > THRESHOLD_V_VT ) {
    GBC = (nIsBC/nVtBC)*std::exp(THRESHOLD_V_VT);
    IBC = (nIsBC*(std::exp(THRESHOLD_V_VT)-1)) - (GBC*THRESHOLD_V_VT*nVtBC);
  } else {
    GBC = (nIsBC/nVtBC)*std::exp(dVbc/nVtBC);
    IBC = (nIsBC*(std::exp(dVbc/nVtBC)-1)) - (GBC*dVbc);
  }
  
  if (n2 != 0)
    Is(nib, 0)  += -IBE;
  if (emissorNode != 0)
    Is(nie, 0)  +=  IBE;
  if (n2 != 0)
    Is(nib, 0)  += -IBC;
  if (n1 != 0)
    Is(nic, 0)  +=  IBC;

  if (n2 != 0)
    Is(nib, 0)  +=  alpha*IBE;
  if (n1 != 0)
    Is(nic, 0)  += -alpha*IBE;
  if (n2 != 0)
    Is(nib, 0)  +=  alphaRev*IBC;
  if (emissorNode != 0)
    Is(nie, 0)  += -alphaRev*IBC;
  
  if (n2 != 0)
    Gm(nib, nib)  +=  GBE;
  if (n2 != 0 && emissorNode != 0)
    Gm(nib, nie)  += -GBE;
  if (n2 != 0 && emissorNode != 0)
    Gm(nie, nib)  += -GBE;
  if (emissorNode != 0)
    Gm(nie, nie)  +=  GBE;

  if (n2 != 0)
    Gm(nib, nib)  +=  GBC;
  if (n2 != 0 && n1 != 0)
    Gm(nib, nic)  += -GBC;
  if (n2 != 0 && n1 != 0)
    Gm(nic, nib)  += -GBC;
  if (n1 != 0)
    Gm(nic, nic)  +=  GBC;

  if (n1 != 0 && n2 != 0)
    Gm(nic, nib)  +=  alpha*GBE;
  if (n1 != 0 && emissorNode != 0)
    Gm(nic, nie)  += -alpha*GBE;
  if (n2 != 0)
    Gm(nib, nib)  += -alpha*GBE;
  if (n2 != 0 && emissorNode != 0)
    Gm(nib, nie)  +=  alpha*GBE;

  if (n2 != 0 && emissorNode != 0)
    Gm(nie, nib)  +=  alphaRev*GBC;
  if (n1 != 0 && emissorNode != 0)
    Gm(nie, nic)  += -alphaRev*GBC;
  if (n2 != 0)
    Gm(nib, nib)  += -alphaRev*GBC;
  if (n2 != 0 && n1 != 0)
    Gm(nib, nic)  +=  alphaRev*GBC;

}

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

Node::Node(unsigned int _id, const std::string &_name) {
  id = _id;
  name = _name;
}

Node::Node(const Node &n) {
  id = n.id;
  name = n.name;
}

Node::~Node() {
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

Resistor::Resistor(double value) {
  R = value;
}

Transconductor::Transconductor(double _value, unsigned int _pos, unsigned int _neg) {
  value = _value;
  pos = _pos;
  neg = _neg;
}
CurrentControlledCurrentSource::CurrentControlledCurrentSource(double _value, unsigned int _pos, unsigned int _neg) {
  value = _value;
  pos = _pos;
  neg = _neg;
}

VoltageControlledVoltageSource::VoltageControlledVoltageSource(double _value, unsigned int _pos, unsigned int _neg) {
  value = _value;
  pos = _pos;
  neg = _neg;
}

Transresistor::Transresistor(double _value, unsigned int _pos, unsigned int _neg) {
  value = _value;
  pos = _pos;
  neg = _neg;
}

Capacitor::Capacitor(double _value, double _ic) {
  value = _value;
  ic = _ic;
}

Inductor::Inductor(double _value, double _ic) {
  value = _value;
  ic = _ic;
}

Diode::Diode(double _Is, double _Vt) {
  Is = _Is;
  Vt = _Vt;
}
  
Transistor::Transistor(TransistorType _t, double _alpha, double _alphaRev, double _IsBE, double _VtBE, double _IsBC, double _VtBC) {
  type = _t;
  alpha = _alpha;
  alphaRev = _alphaRev;
  IsBE = _IsBE;
  VtBE = _VtBE;
  IsBC = _IsBC;
  VtBC = _VtBC;
}

DCCurrentSource::DCCurrentSource(double value) {
  I = value;
}

SinCurrentSource::SinCurrentSource(double _dc, double _amplitude, double _freq, double _delay, double _atenuation, double _angle, double _nCycles) {
  dc = _dc;
  amplitude = _amplitude;
  freq = _freq;
  delay = _delay;
  atenuation = _atenuation;
  angle = _angle;
  nCycles = _nCycles;
}

PulseCurrentSource::PulseCurrentSource(double _amplitude1, double _amplitude2, double _delay, double _tRise, double _tFall, double _tOn, double _period, double _nCycles) {
  amplitude1 = _amplitude1;
  amplitude2 = _amplitude2;
  delay = _delay;
  tRise = _tRise;
  tFall = _tFall;
  tOn = _tOn;
  period = _period;
  nCycles = _nCycles;
}

DCVoltageSource::DCVoltageSource(double value) {
  V = value;
}

SinVoltageSource::SinVoltageSource(double _dc, double _amplitude, double _freq, double _delay, double _atenuation, double _angle, double _nCycles) {
  dc = _dc;
  amplitude = _amplitude;
  freq = _freq;
  delay = _delay;
  atenuation = _atenuation;
  angle = _angle;
  nCycles = _nCycles;
}

PulseVoltageSource::PulseVoltageSource(double _amplitude1, double _amplitude2, double _delay, double _tRise, double _tFall, double _tOn, double _period, double _nCycles) {
  amplitude1 = _amplitude1;
  amplitude2 = _amplitude2;
  delay = _delay;
  tRise = _tRise;
  tFall = _tFall;
  tOn = _tOn;
  period = _period;
  nCycles = _nCycles;
}

// Parse netlist
void Circuit::readNetlist(const std::string &filename) {
  std::ifstream f(filename.c_str());

  unsigned int countNodes = 0;

  readLines = 0;
  tFinal = 1;
  method = BE;

  addNode(Node(0, "0"));
  ++countNodes;

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
  intStep = 1;
  time = 0;
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


