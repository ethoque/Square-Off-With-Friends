import React from 'react';
import './board.css'
import square from "./square";
import io from 'socket.io-client';
const url = "https://squares-server.herokuapp.com/"
export default class Board extends React.Component{
    constructor(props){
        super(props);
        
        this.height = window.innerHeight-20;
        this.width = window.innerHeight;
        this.gridSize = 6;
        this.cell = this.width/(this.gridSize + 2);
        this.border = this.cell/15;
        this.dot = this.border
        this.sqObjects = []
        this.playerOneTurn = true
        this.currentPlayer = "p1"
        this.highlighted = []
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.gameOver = 0;
        this.perimeter = false;
        this.canClick = true;
        this.disabled = true;
    }

    updateCanvas(){
        this.ctx = this.refs.canvas.getContext('2d');
        this.ctx.fillStyle = "grey"
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.border;
        this.ctx.textAlign ="center";
        this.ctx.textBaseline = "middle";
        this.canvBox = this.refs.canvas.getBoundingClientRect();
    }

    getX(col){
        return (this.cell * (col+1)) ;
    }

    getY(row){
        return (this.cell * (row+1)) ;
    }

    drawBoard(count){
        this.ctx.fillStyle = "grey"
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.border;
        this.ctx.fillRect(10,10,this.width,this.height)
        this.ctx.strokeRect(10,10,this.width,this.height)
        this.ctx.fillStyle = "blue"

        for( let i = 0; i < this.gridSize+1; i++){
            for(let j = 0; j < this.gridSize+1;j++){
                this.ctx.fillRect(this.getX(j),this.getY(i),this.dot,this.dot)
                if(i<this.gridSize && j<this.gridSize && count < 1){
                    let sq = new square();
                    sq.createSquare(this.getX(j),this.getY(i),this.cell,this.cell,(i*this.gridSize)+j)
                    this.sqObjects.push(sq)
                }
            }
        }
    }

    drawText(text, x, y, color, size) {
        this.ctx.fillStyle = color;
        this.ctx.font = size + "px serif";
        this.ctx.fillText(text, x, y);
    }

    drawScores(){
        let p1Col = this.whichTurn("p1",!this.playerOneTurn)
        let p2Col = this.whichTurn("p2",this.playerOneTurn)
        this.drawText("Player 1", this.width/4,this.height/20,p1Col,50)
        this.drawText("Player 2", this.width*.75,this.height/20,p2Col,50)
        if(this.disabled === true){
            this.drawText("Spectating", this.width/2,this.height/20,"Black",30)
        }
        if (this.gameOver > 0){
            this.gameOver--;
            if(this.scoreP1 === this.scoreP2){
                this.drawText("TIE! The score was:", this.width/2,this.height/3,"Black",90)
                this.drawText(this.scoreP1, this.width/3,this.height/2,this.whichTurn("p1",false),70)
                this.drawText(this.scoreP2, this.width*.66,this.height/2,this.whichTurn("p2",false),70)
            }
            if(this.scoreP1 > this.scoreP2){
                this.drawText("Player 1 WINS! The score was:", this.width/2,this.height/3,"Black",60)
                this.drawText(this.scoreP1, this.width/3,this.height/2,this.whichTurn("p1",false),70)
                this.drawText(this.scoreP2, this.width*.66,this.height/2,this.whichTurn("p2",false),70)
            }
            else if(this.scoreP2 > this.scoreP1){
                this.drawText("Player 2 WINS! The score was:", this.width/2,this.height/3,"Black",60)
                this.drawText(this.scoreP1, this.width/3,this.height/2,this.whichTurn("p1",false),70)
                this.drawText(this.scoreP2, this.width*.66,this.height/2,this.whichTurn("p2",false),70)
            }

            if(this.gameOver === 0){
                this.wipe()
            }
        }
    }

    wipe(){
        this.sqObjects = []
        this.playerOneTurn = true
        this.currentPlayer = "p1"
        this.scoreP1 = 0;
        this.scoreP2 = 0;
 
        this.drawBoard(0)
        if(this.perimeter){
            this.fillPerimeter(this.perimeter)
        }
    }

    drawSquares(){
        for(let i = 0; i<this.sqObjects.length; i++){
            this.sqObjects[i].drawSides(this);
            this.sqObjects[i].drawFill(this);
        }
    }
    drawLine(x1,y1,x2,y2,color){
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1,y1);
        this.ctx.lineTo(x2,y2);
        this.ctx.stroke();
    }

    whichTurn(player,hover){
        if(player === "p1"){
            if(hover){
                return "#FF7F7F"
            }
            return "red"
        }
        else if(player === "p2"){
            if(hover){
                return "teal"
            }
            return "blue"
        }
        else{
            return "black"
        }
    }

    componentDidMount(){
        let roomId = window.location.href
        let i = 0
        for(i = roomId.length-1; i>0; i--){
            if(roomId.charAt(i) === '/'){
                break;
            }
        }
        roomId = roomId.substring(roomId.length,i+1)
        this.updateCanvas()
        this.drawBoard(0);
        this.refs.canvas.addEventListener("mousemove", this.highlightGrid.bind(this))
        this.refs.canvas.addEventListener("click", this.click.bind(this))
        this.fillPerimeter(this.perimeter);
        this.connection = io(url, { transports : ['websocket'], query: {roomId} });
        this.connection.on("moveEvent", (data => {
            let filledSq = false;
            console.log(data)

            for(let i = 0; i< data.length; i++){
                if(this.sqObjects[data[i][0]].selectSide(this,data[i][1])){
                    filledSq = true;
                }
            }
            this.handleFill(filledSq)
        }))

        this.connection.on("changePlayer", () => {
            this.canClick = false;
        })

        this.connection.on("disable", () => {
            this.disabled = true;
        })

        this.connection.on("restart", () => {
            this.wipe();
        })

        this.connection.on("enable", () => {
            this.disabled = false;
        })

        this.connection.on("playerOne", () => {
            this.canClick = true;
        })

        setInterval(() => {
            this.drawBoard(1);
            this.drawSquares();
            this.drawScores();
        }, 1000/30);
    }

    fillPerimeter(state){
        if(!state){
            return
        }
        let rows = this.gridSize
        for(let i = 0; i<rows;i++){
            this.sqObjects[i].borderTop = {owner: "game", selected: true}
            this.sqObjects[i].amountOfSides = 1;
        }
        for(let i = 0; i<this.sqObjects.length; i++){
            if(i%rows === 0){
                this.sqObjects[i].borderLeft = {owner: "game", selected: true}
                this.sqObjects[i].amountOfSides = 1;
            }
            if(i%rows === rows-1){
                this.sqObjects[i].borderRight = {owner: "game", selected: true}
                this.sqObjects[i].amountOfSides = 1;
            }
            if(i>=this.sqObjects.length-rows){
                this.sqObjects[i].borderBottom = {owner: "game", selected: true}
                this.sqObjects[i].amountOfSides = 1;
            }
        }
        this.sqObjects[0].amountOfSides = 2;
        this.sqObjects[this.gridSize-1].amountOfSides = 2;
        this.sqObjects[this.sqObjects.length-1].amountOfSides = 2;
        this.sqObjects[this.sqObjects.length-this.gridSize].amountOfSides = 2;
    }

    highlightSide(x,y){
        for(let i = 0; i<this.sqObjects.length; i++){
            this.sqObjects[i].currentHighlight = null
        }
        this.highlighted = []
        for(let i = 0; i<this.sqObjects.length; i++){
            if(this.sqObjects[i].contains(x,y)){
                let side = this.sqObjects[i].highlightSide(x,y,this);
                this.borderSide = null;
                if(side !== null){
                    this.highlighted.push([this.sqObjects[i].index,side])

                    var input = this.sqObjects[i].index
                    if(side === "TOP"){
                        var topSquare = input-this.gridSize
                        if(topSquare >= 0){
                            this.highlighted.push([topSquare,"BOT"])
                        }
                    }
                    else if(side === "BOT"){
                        var bottomSquare = input+this.gridSize
                        if(bottomSquare<this.sqObjects.length){
                            this.highlighted.push([bottomSquare,"TOP"])
                        }
                    }
                    else if(side === "LEFT"){
                        var leftSquare = input-1
                        if(leftSquare >= 0 && input%this.gridSize !== 0){
                            this.highlighted.push([leftSquare,"RIGHT"])
                        }
                    }
                    else if(side === "RIGHT"){
                        var rightSquare = input+1
                        if(rightSquare < this.sqObjects.length && input%this.gridSize !== this.gridSize-1){
                            this.highlighted.push([rightSquare,"LEFT"])
                        }
                    }
                }
                break;
            }
        }
    }

    click(e){
        if(this.gameOver !== 0 || this.canClick === false || this.disabled === true){
            return;
        }
        
        if(this.highlighted.length === 0){
            return;
        }
        let data = []
        let filledSq = false;
        for(let i = 0; i<this.highlighted.length; i++){
            data.push([this.highlighted[i][0],this.highlighted[i][1]])
            if(this.sqObjects[this.highlighted[i][0]].selectSide(this,this.highlighted[i][1])){
                filledSq = true;
            }
        }
        this.handleFill(filledSq)
        this.connection.emit("moveEvent", data)
        this.highlighted = []

    }

    handleFill(filledSq){
        if(filledSq){
            if(this.scoreP1 + this.scoreP2 === (this.gridSize*this.gridSize)){
                this.gameOver = 5 * 30;
            }
        } else{
            this.playerOneTurn = !this.playerOneTurn
            this.canClick = !this.canClick
            if(this.currentPlayer === "p1"){
                this.currentPlayer = "p2"
            }
            else{
                this.currentPlayer = "p1"
            }
        }
    }


    highlightGrid(e){
        this.canvBox = this.refs.canvas.getBoundingClientRect();
        if(this.gameOver !== 0 || this.canClick === false || this.disabled === true){
            return
        }
        let x = e.clientX - this.canvBox.left;
        let y = e.clientY - this.canvBox.top; 

        this.highlightSide(x,y);
    }


    render(){
        return(
            //canvas is blurry when set through css doc?
            <canvas ref="canvas" height={window.innerHeight} width={window.innerWidth}/>
        )
    }
}