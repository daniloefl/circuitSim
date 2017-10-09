/*
 * CLI interface.
 *
 */


#include <string>
#include <iostream>
#include <ctime>
#include <fstream>

#include "Matrix.h"
#include "Circuit.h"
#include "Constants.h"

int main(int argc, char **argv) {
  Circuit c;

  if (argc != 3) {
    std::cout << "Usage: " << argv[0] << " [netlist file] [output file]" << std::endl;
    return 0;
  }

  c.readNetlist(argv[1]);
  c.simulate();
  c.writeOut(argv[2]);

  return 0;
}

