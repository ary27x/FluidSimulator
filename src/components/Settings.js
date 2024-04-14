import React , {useState} from "react";
import "../styles/Settings.css"



export default function Settings(props)
{
    return (
        <React.Fragment>
            <div className="menuElement">
                Invert Color Scheme 
                <input type="checkbox" id = "colorInverter" className="menuElementCheckbox" checked = {props.colorInverted} onChange={() => {
                    props.setColorInverted(previousInversionState => !previousInversionState)
                }}/>
            </div>

            <div className="subMenuElement">
                Active Fluid Sources :
                    <div>
                        East Tunnel : <input type="checkbox"  className="menuElementCheckbox" checked = {props.tunnelState[0]}  onChange={() => {
                            props.setTunnelState([!props.tunnelState[0] , props.tunnelState[1]])
                        }} />
                    </div>
                    <div>
                        West Tunnel : <input type="checkbox"  className="menuElementCheckbox" checked = {props.tunnelState[1]}  onChange={() => {
                            props.setTunnelState([props.tunnelState[0] , !props.tunnelState[1]])
                        }} />
                    </div>
            </div>

            <div className="rangeMenu">
                Tunnel Diameter 

                <div className="rangeInput">
                    <input type="range" id="tunnelDiameter"  min="1" max="10" value = {props.tunnelDiameter} onChange = {(event) => {
                        props.setTunnelDiameter(event.target.value)
                    }}/>
                    </div>
                    <div>
                    <div className="rangeInputLabel">
                        <div>1</div>
                        <div>10</div>
                    </div>
                </div>
            </div>

            

            <div className="rangeMenu">
                Fluid Velocity 
                <div className="rangeInput">
                    <input type="range" id="tunnelDiameter"  min="2" max="15" value = {props.fluidVelocity} onChange={(event) => 
                    { props.setFluidVelocity(event.target.value) }} />
                    <div className="rangeInputLabel">
                        <div>1</div>
                        <div>10</div>
                    </div>
                </div>
            </div>
            
            <div className="rangeMenu">
                Gauss Siedel Iteration ⚠️  
                <div className="rangeInput">
                    <input type="range" id="gauss"  min="1" max="200" value = {props.gaussSeidelConstant} onChange={(event) => 
                    {
                        props.setGaussSeidelConstant(event.target.value)
                    }} />
                    <div className="rangeInputLabel">
                        <div>1</div>
                        <div>200</div>
                    </div>
                </div>
            </div>

            <div className="rangeMenu">
                Obstacle Type  
                    <select value ={props.obstacleType} onChange = {(event) =>{
                        if (event.target.value == "movable")
                            props.setGridIntersectionMode(false)
                        else
                            props.setGridIntersectionMode(true)
                        props.setObstacleType(event.target.value) 
                    } } id = "obsType">
                        <option value="movable">Movable Shapes</option>
                        <option value="single">Single Row Intersections</option>
                        <option value="multi">Multi Row Intersections</option>
                    </select>
            </div>

            <div className="menuElement">
                Obstacle Color  
                    <select value = {props.obstacleColor} onChange={(event) => {
                        props.setObstacleColor(event.target.value)
                    }}>
                        <option value="black">Black ⬛ </option>
                        <option value="white">White ⬜</option>
                        <option value="red"  >Red   🟥 </option>
                    </select>
            </div>
  
            <div className="menuElement">
                Obstacle Shape 
                <select value = {props.obstacleShape} onChange={(event) => {
                    props.setObstacleShape(event.target.value)
                }}>
                        <option value="circle">Circle </option>
                        <option value="square">Sqaure</option>
                    </select>
            </div>

            <div className="rangeMenu">
                Obstacle Size 
                <div className="rangeInput">
                    <input type="range" id="obsSize"  min="1" max="35" value = {props.obstacleSize} onChange={(event) => {
                        props.setObstacleSize(event.target.value)
                    }}/>
                    <div className="rangeInputLabel">
                        <div>1</div>
                        <div>35</div>
                    </div>
                </div>

              
            </div>

            <a href="https://github.com/ary27x"  style={{textDecoration  : "none"}}>
            <div className="bottom">
                made by ary27x
                </div>
                </a> 
        </React.Fragment>
    )
}
