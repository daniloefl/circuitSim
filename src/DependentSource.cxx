/*
 * Implements dependent sources.
 *
 */

#include "Matrix.h"
#include "Circuit.h"

#include <string>
#include <cmath>
#include <exception>
#include <iomanip>
#include <stdexcept>
#include "DependentSource.h"

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

