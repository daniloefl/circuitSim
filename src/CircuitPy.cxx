/*
 * Interface with Python.
 *
 */

#include "CircuitPy.h"

#include <string>
#include <boost/python/list.hpp>

#include <Python.h>
using namespace boost;

CircuitPy::CircuitPy() {
  Py_Initialize();
}

python::list CircuitPy::getTimeList() {
  python::list x;
  double disp_t = 0;
  for (unsigned int kn = 0; kn < table.m_r; ++kn) {
    x.append(disp_t);
    disp_t += dtSave;
  }
  return x;
}
python::list CircuitPy::getNodeVoltages(const std::string &n) {
  python::list x;
  unsigned int k = findNode(n)-1;
  for (unsigned int kn = 0; kn < table.m_r; ++kn) {
    x.append(table(kn, k));
  }
  return x;
}


