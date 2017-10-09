/*
 * Implements sources.
 *
 */

#include "Matrix.h"
#include "Source.h"

#include <string>
#include <cmath>
#include <exception>
#include <stdexcept>

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

