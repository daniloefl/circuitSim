PYTHON_ADD_MODULE(circuitPy Node.cxx Element.cxx Source.cxx Passive.cxx Active.cxx DependentSource.cxx Circuit.cxx CircuitPy.cxx Matrix.cxx circuitPy.cxx)
target_link_libraries(circuitPy ${Boost_LIBRARIES} boost_python)

add_custom_command(TARGET circuitPy POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:circuitPy> ${CMAKE_CURRENT_BINARY_DIR}/../web/circuitSimSite/circuitSim/static/circuitSim/
)

add_executable(circuitSim Node.cxx Element.cxx Source.cxx Passive.cxx Active.cxx DependentSource.cxx Circuit.cxx Matrix.cxx circuitSim.cxx )
target_link_libraries(circuitSim m)
