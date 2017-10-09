PYTHON_ADD_MODULE(circuitPy Node.cxx Element.cxx Source.cxx Passive.cxx Active.cxx DependentSource.cxx Circuit.cxx CircuitPy.cxx Matrix.cxx circuitPy.cxx)
target_link_libraries(circuitPy ${Boost_LIBRARIES} boost_python)

add_executable(circuitSim Node.cxx Element.cxx Source.cxx Passive.cxx Active.cxx DependentSource.cxx Circuit.cxx Matrix.cxx circuitSim.cxx )
target_link_libraries(circuitSim m)
