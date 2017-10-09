/*
 * Define circuit element base class.
 *
 */

#ifndef ELEMENT_H
#define ELEMENT_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>

// Represents a single element
// All elements are daughters
class Element {
  public:
    std::string name;

    // current flows from node 1 to node 2
    // for the transistor: node 1 is collector and node 2 is the base
    unsigned int n1;
    unsigned int n2;

    Element();
    virtual ~Element();

    // add elements in matrix
    virtual void makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN);
};

typedef std::vector< std::shared_ptr<Element> > elementList;

#endif

