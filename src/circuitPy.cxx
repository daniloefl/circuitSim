#include <boost/python.hpp>
#include <string>
#include "CircuitPy.h"

using namespace boost::python;

//BOOST_PYTHON_MEMBER_FUNCTION_OVERLOADS(circuit_overloads, addDiode, 3, 5)
//BOOST_PYTHON_MEMBER_FUNCTION_OVERLOADS(circuit_overloads, addTransistor, 4, 11)

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
    .def("addPulseVoltageSource", &CircuitPy::addPulseVoltageSource)
    .def("addSinVoltageSource", &CircuitPy::addSinVoltageSource)
    .def("addDiode", &CircuitPy::addDiode) //, circuit_overloads())
    .def("addTransistor", &CircuitPy::addTransistor) //, circuit_overloads())
    .def("getTimeList", &CircuitPy::getTimeList)
    .def("getNodeVoltages", &CircuitPy::getNodeVoltages)
  ;
}

