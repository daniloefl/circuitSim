/*
 * Declare matrix structure.
 *
 */

#ifndef MATRIX_H
#define MATRIX_H

#include "Constants.h"

class Matrix {
  public:
    // Matrix contents
    double *m_e;
    // number of rows
    unsigned int m_r;
    // number of columns
    unsigned int m_c;

    // constructor
    Matrix(unsigned int rows = 1, unsigned int columns = 1);
    Matrix(const Matrix &a);

    void resize(unsigned int rows, unsigned int columns);

    // access element in matrix
    double &operator() (unsigned int row, unsigned int column);
    double operator() (unsigned int row, unsigned int column) const;

    // assignment operator
    Matrix &operator =(const Matrix &a);

    // compares this matrix with b and returns true if all elements differ
    // by less than MAX_ERROR
    bool operator ==(const Matrix &b) const;
    bool closeTo(const Matrix &b) const;

    // fill matrix with random elements
    void random();

    // multiplies row by value
    void multiplyRow(unsigned int row, double value);

    // multiplies row origin by factor and adds it to target
    void multiplyAndSumRows(double factor, unsigned int origin, unsigned int target);

    // swap rows origin and target
    void swapRows(unsigned int origin, unsigned int target);

    // copy the transpose of row matrix "row" to row i in this matrix
    void copyRow(const Matrix &row, unsigned int i);

    // implements Gauss-Jordan for A*x = B
    static Matrix solve(const Matrix &A, const Matrix &b);

    void print() const;

    // set all elements to zero
    void zero();

    // destructor
    ~Matrix();
};

#endif

