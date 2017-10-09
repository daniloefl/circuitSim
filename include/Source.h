/*
 * Define sources.
 *
 */

#ifndef SOURCE_H
#define SOURCE_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <memory>
#include "Element.h"

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

#endif

