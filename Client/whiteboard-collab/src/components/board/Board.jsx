import React from "react";
import io from 'socket.io-client';
import './style.css'

class Board extends React.Component
{
    constructor(props)
    {
        super(props);
        this.socket.on("canvas-data",function(data){
            var image = new Image();
            var canvas = document.querySelector('#board');
            var ctx = canvas.getContext('2d');
            image.onload = function(){
                ctx.drawImage(image,0,0);
            };
            image.src = data;
        })
    }

    timeout;

    socket= io.connect("http://localhost:3000");

    ctx;

    componentDidMount(){
        this.drawoncanvas();
    }

    componentWillReceiveProps(nP){
        this.ctx.strokeStyle=nP.color;
        this.ctx.lineWidth=nP.size;
    }

    drawoncanvas()
    {
        var canvas = document.querySelector('#board');
        this.ctx = canvas.getContext('2d');
        var ctx=this.ctx
    
        var sketch = document.querySelector('#sketch');
        var sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));
    
        var mouse = {x: 0, y: 0};
        var last_mouse = {x: 0, y: 0};
        canvas.addEventListener('mousemove', function(e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;
    
            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);
        ctx.lineWidth = this.props.size;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.props.color;
    
        canvas.addEventListener('mousedown', function(e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);
    
        canvas.addEventListener('mouseup', function() {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        var root=this;
    
        var onPaint = function() {
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            if(root.timeout != undefined) clearTimeout(root.timeout);
            root.timeout = setTimeout(function(){
                var base64ImageData = canvas.toDataURL("image/png");
                root.socket.emit("canvas-data", base64ImageData);
            }, 1000)
        };
    }

    render()
    {
        return(
            <div id="sketch">
                <canvas className="board" id="board"></canvas>
            </div>
        );
    }

}

export default Board