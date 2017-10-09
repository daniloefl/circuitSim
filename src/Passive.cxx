/*
 * Implements the passive elements.
 *
 */

#include "Matrix.h"
#include "Element.h"
#include "Passive.h"

#include <string>
#include <cmath>
#include <exception>
#include <stdexcept>

Resistor::Resistor(double value) {
  R = value;
}

Capacitor::Capacitor(double _value, double _ic) {
  value = _value;
  ic = _ic;
}

Inductor::Inductor(double _value, double _ic) {
  value = _value;
  ic = _ic;
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
    double dV = 0;
    if (n1 != 0) dV +=  VarInT0(ni1, 0);
    if (n2 != 0) dV += -VarInT0(ni2, 0);
    if (t > 0) charge += dV/(value/deltaT);
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
    double dV = 0;
    if (n1 != 0) dV +=  VarInT0(ni1, 0);
    if (n2 != 0) dV += -VarInT0(ni2, 0);
    double dVo = 0;
    if (n1 != 0) dVo +=  (*VarInT0MinusDT)(ni1, 0);
    if (n2 != 0) dVo += -(*VarInT0MinusDT)(ni2, 0);
    if (t > 0) charge = (4.0/3.0)*(ic + (dV/((3.0/2.0)*value/deltaT))) - (1.0/3.0)*((ICT0MinusDeltaT) + ( dVo/((3.0/2.0)*value/deltaT)));
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


