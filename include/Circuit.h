/*
 * Define circuit.
 *
 */

#ifndef CIRCUIT_H
#define CIRCUIT_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>
#include "Element.h"
#include "Node.h"

// Analysis type
enum analysisMethod {BE, GEAR};

class Circuit {
  public:
    elementList element;
    nodeList node;

    Matrix table;

    unsigned int readLines;
    double tFinal;
    double dtSave;
    analysisMethod method;
    int nSteps;

    double time;
    unsigned int intStep;

    unsigned int addNode(Node n);
    unsigned int findNode(const std::string &name);
    void addElement(std::shared_ptr<Element> e);

    void readNetlist(const std::string &filename);

    Circuit();

    void simulate();
    void iteration(analysisMethod method, Matrix &VarInT, Matrix &VarInT0, Matrix *VarInT0MinusDeltaT, Matrix &Gm, Matrix &Is, Matrix &VarIterN, double deltaT, bool saveICInductor);

    void writeOut(const std::string &fname);

};

double readNumber(const std::string &s);

#endif

