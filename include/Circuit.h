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
    unsigned int countNodes;

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

    void setSimulationParameters(double _tFinal, double _dtSave, const std::string &_method, unsigned int intStep);
    void addResistor(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double R);
    void addCapacitor(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double C);
    void addInductor(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double L);
    void addDCVoltageSource(const std::string &name, const std::string &nodeName1, const std::string &nodeName2, double V);

};

double readNumber(const std::string &s);

#endif

