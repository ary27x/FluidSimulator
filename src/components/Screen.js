import React , {useState , useEffect} from "react";
import "../styles/Screen.css";
import {setupSimulation, update, preSetupInitialization, settingsInitialization, setObstacle, changeTunnelDiameter , startDrag , drag , endDrag , changeFluidVelocity , handleTunnelState , handleObstacleType} from "./Fluid.js"
export default function Screen(props)
{  
    useEffect(() => {
        const screenData = document.getElementById("screen-wrapper").getBoundingClientRect()
        preSetupInitialization(screenData.height , screenData.width)
        settingsInitialization(
            props.colorInverted , 
            props.obstacleColor , 
            props.obstacleSize , 
            props.obstacleShape , 
            props.gaussSeidelConstant,
            props.tunnelDiameter,
            props.fluidVelocity,
            props.tunnelState,
            props.obstacleType
            )
        setupSimulation();
	    update();
    } , [])

    useEffect(() => {
        settingsInitialization(
            props.colorInverted , 
            props.obstacleColor , 
            props.obstacleSize , 
            props.obstacleShape  ,
            props.gaussSeidelConstant,
            props.tunnelDiameter,
            props.fluidVelocity,
            props.tunnelState,
            props.obstacleType
            )
        setObstacle()
        changeFluidVelocity()
        changeTunnelDiameter()
        handleTunnelState()
        } , [props.colorInverted , props.obstacleColor , props.obstacleSize , props.obstacleShape , props.gaussSeidelConstant , props.tunnelDiameter , props.fluidVelocity , props.tunnelState])
    

    useEffect(() => {
        settingsInitialization(
            props.colorInverted , 
            props.obstacleColor , 
            props.obstacleSize , 
            props.obstacleShape  ,
            props.gaussSeidelConstant,
            props.tunnelDiameter,
            props.fluidVelocity,
            props.tunnelState,
            props.obstacleType
            )
        handleObstacleType()
        setObstacle()
    }, [props.obstacleType])

    return (
        <React.Fragment>
            	<canvas id="fluid-simulator-canvas" 
                onMouseDown={(event) => 
                {
                    if (!props.gridIntersectionMode)
                        startDrag(event.clientX, event.clientY);
                }}
                onMouseUp={() => 
                    {
                        if (!props.gridIntersectionMode)
                                endDrag();
                    }}
                onMouseMove={(event) => 
                {
                    if (!props.gridIntersectionMode)
                        drag(event.clientX, event.clientY);
                }}

                ></canvas>

        </React.Fragment>
    )
}