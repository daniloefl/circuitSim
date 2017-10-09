/*
 * Implement node class.
 *
 */

#include "Node.h"

#include <string>

Node::Node(unsigned int _id, const std::string &_name) {
  id = _id;
  name = _name;
}

Node::Node(const Node &n) {
  id = n.id;
  name = n.name;
}

Node::~Node() {
}


