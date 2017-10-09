/*
 * Define circuit nodes.
 *
 */

#ifndef NODE_H
#define NODE_H

#include "Constants.h"
#include "Matrix.h"
#include <string>
#include <vector>
#include <list>
#include <memory>

// node definition
class Node {
  public:
  unsigned int      id;          // id of node in admittance matrix
  std::string       name;        // name in netlist
  Node(unsigned int _id = 0, const std::string &_name = "0");
  Node(const Node &n);
  ~Node();
};

typedef std::vector<Node> nodeList;

#endif

