/*
 * Matrix implementation.
 *
 */

#include "Matrix.h"

#include <iostream>
#include <cmath>
#include "Constants.h"
#include <stdexcept>
#include <iomanip>

Matrix::Matrix(unsigned int rows, unsigned int columns) {
  if (rows == 0 || columns == 0) throw std::runtime_error("Matrix::Matrix: Invalid matrix size.");
  m_e = new double[rows*columns];
  m_r = rows;
  m_c = columns;
}

void Matrix::resize(unsigned int rows, unsigned int columns) {
  if (rows == 0 || columns == 0) throw std::runtime_error("Matrix::Matrix: Invalid matrix size.");
  delete [] m_e;
  m_e = new double[rows*columns];
  m_r = rows;
  m_c = columns;
}

Matrix::Matrix(const Matrix &b) {
  m_r = b.m_r;
  m_c = b.m_c;
  m_e = new double[m_r*m_c];
  for (unsigned i = 0; i < m_r*m_c; ++i) m_e[i] = b.m_e[i];
}


double &Matrix::operator() (unsigned int row, unsigned int column) {
  if (row >= m_r || column >= m_c) {
    throw std::runtime_error("Matrix::operator(): out of bounds.");
  }
  return m_e[row*m_c + column];
}
double Matrix::operator() (unsigned int row, unsigned int column) const {
  if (row >= m_r || column >= m_c) throw std::runtime_error("Matrix::operator(): out of bounds.");
  return m_e[row*m_c + column];
}

Matrix &Matrix::operator =(const Matrix &b) {
  delete [] m_e;
  m_r = b.m_r;
  m_c = b.m_c;
  m_e = new double[m_r*m_c];
  for (unsigned i = 0; i < m_r*m_c; ++i) m_e[i] = b.m_e[i];
  return *this;
}

bool Matrix::operator ==(const Matrix &b) const {
  if (m_r != b.m_r) return false;
  if (m_c != b.m_c) return false;
  for (unsigned i = 0; i < m_r*m_c; ++i) {
    if (std::isnan(m_e[i]) || std::isnan(b.m_e[i])) return false;
    if (std::fabs(m_e[i] - b.m_e[i]) > MAX_ERROR) return false;
  }
  return true;
}

bool Matrix::closeTo(const Matrix &b) const {
  if (m_r != b.m_r) return false;
  if (m_c != b.m_c) return false;
  for (unsigned i = 0; i < m_r*m_c; ++i) {
    if (std::isnan(m_e[i]) || std::isnan(b.m_e[i])) return false;
    if (std::fabs(m_e[i] - b.m_e[i]) > MAX_ERROR) return false;
  }
  return true;
}

void Matrix::random() {
  for (unsigned i = 0; i < m_r*m_c; ++i) {
    m_e[i] = (((((double) rand())/((double) RAND_MAX))*2) - 1)*100.0;
  }
}

void Matrix::multiplyRow(unsigned int row, double value) {
  for (unsigned i = 0; i < m_c; ++i) m_e[row*m_c + i] *= value;
}

void Matrix::multiplyAndSumRows(double factor, unsigned int origin, unsigned int target) {
  for (unsigned i = 0; i < m_c; ++i) m_e[target*m_c + i] += factor*m_e[origin*m_c + i];
}

void Matrix::swapRows(unsigned int origin, unsigned int target) {
  if (origin >= m_r || target >= m_r) throw std::runtime_error("Matrix::swapRows: Inexistent rows.");
  double tmp;
  for (unsigned i = 0; i < m_c; ++i) {
    tmp = m_e[origin*m_c + i];
    m_e[origin*m_c + i] = m_e[target*m_c + i];
    m_e[target*m_c + i] = tmp;
  }
}

void Matrix::copyRow(const Matrix &row, unsigned int i) {
  if (i >= m_r) throw std::runtime_error("Matrix::copyRow: Inexistent rows.");
  if (row.m_c != 1 || row.m_r != m_c) throw std::runtime_error("Matrix::copyRow: incompatible sizes.");
  for (unsigned k = 0; k < m_c; ++k) m_e[i*m_c + k] = row.m_e[k];
}

Matrix Matrix::solve(const Matrix &a, const Matrix &b) {
  if (a.m_r != a.m_c || b.m_c != 1 || b.m_r != a.m_r)
    throw std::runtime_error("Matrix::solve: Invalid matrix sizes.");

  Matrix copyCoef(a);
  Matrix result(b);

  // find pivot
  for (unsigned column = 0; column < copyCoef.m_c; ++column) {
    double largest = 0;
    unsigned row = copyCoef.m_r;
    // Find largest element in column, under row "column"
    for (unsigned i = column; i < copyCoef.m_r; ++i) {
      if (std::fabs(copyCoef.m_e[i*copyCoef.m_c + column]) > std::fabs(largest)) {
        largest = copyCoef.m_e[i*copyCoef.m_c + column];
        row = i;
      }
    }
    if (largest == 0) // all zeros in this column!
      throw std::runtime_error("Matrix::solve: found column with all zeros ... cannot solve using Gauss-Jordan.");
    if (row != column) {
      copyCoef.swapRows(column, row);
      result.swapRows(column, row);
    }
    row = column;
    // now element (row, row) != 0 and it is the largest
    // eliminate column "row" in each row
    for (unsigned j = 0; j < copyCoef.m_r; ++j) {
      if (j == row) continue;
      double factor = -copyCoef.m_e[j*copyCoef.m_c + row]/copyCoef.m_e[row*copyCoef.m_c + row];
      result.multiplyAndSumRows(factor, row, j);
      copyCoef.multiplyAndSumRows(factor, row, j);
    }
  }

  // Normalise rows
  for (unsigned i = 0; i < copyCoef.m_r; ++i) {
    result.m_e[i] /= copyCoef.m_e[i*copyCoef.m_c + i];
    copyCoef.m_e[i*copyCoef.m_c + i] = 1;
  }

  return result;
}


void Matrix::print() const {
  for (unsigned i = 0; i < m_r; ++i) {
    std::cout << "[ ";
    for (unsigned j = 0; j < m_c; ++j) {
      if ((*this)(i, j) >= 0)
        std::cout << " ";
      std::cout << std::left << std::setw(16) << std::scientific << std::setprecision(9) << (*this)(i, j) << " ";
    }
    std::cout << "]" << std::endl;
  }
}

void Matrix::zero() {
  for (unsigned i = 0; i < m_r*m_c; ++i) {
    m_e[i] = 0;
  }
}

Matrix::~Matrix() {
  delete [] m_e;
}

