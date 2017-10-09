/*
 * Define dependent sources.
 *
 */

#ifndef DEPENDENTSOURCE_H
#define DEPENDENTSOURCE_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>
#include "Element.h"

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

#endif

