#include <boost/python.hpp>
#include <string>
#include "Circuit.h"

using namespace boost::python;

BOOST_PYTHON_MODULE(circuitPy)
{
  class_<Circuit>("Circuit", init<>())
    .def(init<>())
    .def("simulate", &Circuit::simulate)
    .def("setSimulationParametersr", &Circuit::setSimulationParameters)
    .def("addResistor", &Circuit::addResistor)
    .def("addCapacitor", &Circuit::addCapacitor)
    .def("addInductor", &Circuit::addInductor)
    .def("addDCVoltageSource", &Circuit::addDCVoltageSource)
  ;
}

