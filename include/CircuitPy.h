/*
 * Define circuit.
 *
 */

#ifndef CIRCUITPY_H
#define CIRCUITPY_H

#include "Circuit.h"
#include <boost/python/list.hpp>
#include <string>

class CircuitPy : public Circuit {
  public:
    CircuitPy();

    boost::python::list getTimeList();
    boost::python::list getNodeVoltages(const std::string &n);
};

#endif

