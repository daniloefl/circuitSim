/*
 * Define passive elements.
 *
 */

#ifndef PASSIVE_H
#define PASSIVE_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>
#include "Element.h"

class Resistor : public Element {
  public:
    double R;
    Resistor(double value = 0);
    void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) override;
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

#endif

