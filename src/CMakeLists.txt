#PYTHON_ADD_MODULE(circuitSim Circuito.c  Constantes.c  gerarEstampas.c  Matriz.c  orcut.c)
#target_link_libraries(circuitSim ${Boost_LIBRARIES} boost_python)

add_executable(circuitSim Node.cxx Element.cxx Source.cxx Passive.cxx Active.cxx DependentSource.cxx Circuit.cxx Matrix.cxx circuitSim.cxx)
target_link_libraries(circuitSim m)
