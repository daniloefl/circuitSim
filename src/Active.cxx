/*
 * Implements active components.
 *
 */

#include "Matrix.h"
#include "Active.h"

#include <string>
#include <cmath>
#include <exception>
#include <stdexcept>

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


