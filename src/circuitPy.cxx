#include <boost/python.hpp>
#include <string>
#include "CircuitPy.h"

using namespace boost::python;

BOOST_PYTHON_MODULE(circuitPy)
{
  class_<CircuitPy>("Circuit", init<>())
    .def(init<>())
    .def("simulate", &CircuitPy::simulate)
    .def("setSimulationParameters", &CircuitPy::setSimulationParameters)
    .def("addResistor", &CircuitPy::addResistor)
    .def("addCapacitor", &CircuitPy::addCapacitor)
    .def("addInductor", &CircuitPy::addInductor)
    .def("addDCVoltageSource", &CircuitPy::addDCVoltageSource)
    .def("getTimeList", &CircuitPy::getTimeList)
    .def("getNodeVoltages", &CircuitPy::getNodeVoltages)
  ;
}

