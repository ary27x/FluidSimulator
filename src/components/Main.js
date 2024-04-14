import React , {useState} from "react";
import  "../styles/Settings.css";
import "../styles/Main.css"
import Screen from "./Screen";
import Settings from "./Settings";

export default function Main()
{
    const [colorInverted , setColorInverted] = useState(true)
    const [obstacleColor , setObstacleColor] = useState("white")
    const [obstacleSize , setObstacleSize] = useState(8)
    const [obstacleShape , setObstacleShape] = useState("circle")
    const [gaussSeidelConstant , setGaussSeidelConstant] = useState(100)
    const [tunnelDiameter , setTunnelDiameter] = useState(6.5)
    const [fluidVelocity , setFluidVelocity] = useState(9)
    const [tunnelState , setTunnelState] = useState([true , false]) // east tunnel , west tunnel
    const [gridIntersectionMode , setGridIntersectionMode] = useState(true)
    const [obstacleType , setObstacleType] = useState("single")
    
    return (
        <React.Fragment>
            <div id= "main-wrapper">
                <div id = "settings-wrapper">
                   <Settings 
                    colorInverted = {colorInverted}
                    setColorInverted = {setColorInverted}
                    obstacleColor = {obstacleColor}
                    setObstacleColor = {setObstacleColor}
                    obstacleSize = {obstacleSize}
                    setObstacleSize = {setObstacleSize}
                    obstacleShape = {obstacleShape}
                    setObstacleShape = {setObstacleShape}
                    gaussSeidelConstant = {gaussSeidelConstant}
                    setGaussSeidelConstant = {setGaussSeidelConstant}
                    tunnelDiameter = {tunnelDiameter}
                    setTunnelDiameter = {setTunnelDiameter}
                    fluidVelocity = {fluidVelocity}
                    setFluidVelocity = {setFluidVelocity}
                    tunnelState = {tunnelState}
                    setTunnelState = {setTunnelState}
                    obstacleType = {obstacleType}
                    setObstacleType = {setObstacleType}
                    setGridIntersectionMode = {setGridIntersectionMode}
                   />
                </div>
                <div id ="screen-wrapper">
                    <div className="frame-display" id = "frame-display">
                    Frame Rate : 30 FPS
                    </div>
                    <Screen
                    colorInverted = {colorInverted}
                    obstacleColor = {obstacleColor}
                    obstacleSize = {obstacleSize}
                    obstacleShape = {obstacleShape}
                    gaussSeidelConstant = {gaussSeidelConstant}
                    tunnelDiameter = {tunnelDiameter}
                    fluidVelocity = {fluidVelocity}
                    tunnelState = {tunnelState}
                    gridIntersectionMode = {gridIntersectionMode}
                    obstacleType = {obstacleType}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}