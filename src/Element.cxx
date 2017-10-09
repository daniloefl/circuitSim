/*
 * Implements the Element base class.
 *
 */

#include "Matrix.h"
#include "Element.h"

#include <string>
#include <exception>
#include <stdexcept>

Element::Element() {
}

Element::~Element() {
}

void Element::makeElements(Matrix &Gm, Matrix &Is, double deltaT, double t, Matrix &VarInT0, Matrix *VarInT0MinusDT, Matrix &VarIterN) {
  throw std::runtime_error("Calling base-class Element to fill matrices: it does not represent a real element!");
}


