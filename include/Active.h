/*
 * Define active elements.
 *
 */

#ifndef ACTIVE_H
#define ACTIVE_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>
#include "Element.h"

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

#endif

