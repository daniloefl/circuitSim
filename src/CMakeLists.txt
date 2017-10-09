#PYTHON_ADD_MODULE(circuitSim Circuito.c  Constantes.c  gerarEstampas.c  Matriz.c  orcut.c)
#target_link_libraries(circuitSim ${Boost_LIBRARIES} boost_python)

add_executable(circuitSim Circuit.cxx Matrix.cxx circuitSim.cxx)
target_link_libraries(circuitSim m)
