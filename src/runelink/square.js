import React from "react";

export default class square extends React.Component{
    
    createSquare(x,y,w,h,index){
        this.w = w;
        this.h = h;
        this.top = y;
        this.bottom = y+h;
        this.left = x;
        this.right = x+w;
        this.index = index;
        this.filled = false;
        this.borderLeft = {owner: null, selected: false}
        this.borderRight = {owner: null, selected: false}
        this.borderTop = {owner: null, selected: false}
        this.borderBottom = {owner: null, selected: false}
        this.player = "unclaimed"
        this.currentHighlight = null;
        this.amountOfSides = 0;


        this.contains = (x,y) => {
            return x >= this.left && x < this.right && y >= this.top && y<this.bottom
        }

        this.drawFill = (obj) => {
            if(this.player === "unclaimed"){
                return;
            }

            obj.ctx.fillStyle = obj.whichTurn(this.player,true)
            obj.ctx.fillRect(
                this.left+(obj.border*1.5),this.top+(obj.border*1.5),
                this.w - obj.border*1.9, this.h-obj.border*1.9
            )
        }

        this.drawSide = (side,color,obj) => {
            if(side === "BOT"){
                obj.drawLine(3+this.left,3+this.bottom,3+this.right,3+this.bottom,color)
            }
            else if(side === "TOP"){
                obj.drawLine(3+this.left,3+this.top,3+this.right,3+this.top,color)
            }
            else if(side === "LEFT"){
                obj.drawLine(3+this.left,3+this.bottom,3+this.left,3+this.top,color)
            }
            else if(side === "RIGHT"){
                obj.drawLine(3+this.right,3+this.bottom,3+this.right,3+this.top,color)
            }
        }

        this.drawSides = (obj) => {
            if(this.currentHighlight !== null){
                this.drawSide(this.currentHighlight, obj.whichTurn(obj.currentPlayer,true),obj)
            }
            if(this.borderLeft.selected){
                this.drawSide("LEFT", obj.whichTurn(this.borderLeft.owner,false),obj)
            }
            if(this.borderRight.selected){
                this.drawSide("RIGHT", obj.whichTurn(this.borderRight.owner,false),obj)
            }
            if(this.borderTop.selected){
                this.drawSide("TOP", obj.whichTurn(this.borderTop.owner,false),obj)
            }
            if(this.borderBottom.selected){
                this.drawSide("BOT", obj.whichTurn(this.borderBottom.owner,false),obj)
            }
        }

        this.highlightSide = (x,y,obj) => {
            let bot = this.bottom - y;
            let top = y - this.top;
            let left = x - this.left;
            let right = this.right - x; 
            let min = Math.min(bot,top,left,right)
            if(min === bot && this.borderBottom.selected === false){
                this.currentHighlight = "BOT"
            }
            else if(min === top && this.borderTop.selected === false){
                this.currentHighlight = "TOP"
            }
            else if(min === left && this.borderLeft.selected === false){
                this.currentHighlight = "LEFT"
            }
            else if(min === right && this.borderRight.selected === false){
                this.currentHighlight = "RIGHT"
            }
            return this.currentHighlight;
        }

        this.selectSide = (obj,side) => {
            this.currentHighlight = side;
            if(this.currentHighlight === "BOT" && this.borderBottom.selected === false){
                this.borderBottom.selected = true;
                if(obj.playerOneTurn){
                    this.borderBottom.owner = "p1"
                }
                else{
                    this.borderBottom.owner = "p2"
                }
            }
            else if(this.currentHighlight === "TOP" && this.borderTop.selected === false){
                this.borderTop.selected = true;
                if(obj.playerOneTurn){
                    this.borderTop.owner = "p1"
                }
                else{
                    this.borderTop.owner = "p2"
                }
            }
            else if(this.currentHighlight === "LEFT" && this.borderLeft.selected === false){
                this.borderLeft.selected = true;
                if(obj.playerOneTurn){
                    this.borderLeft.owner = "p1"
                }
                else{
                    this.borderLeft.owner = "p2"
                }
            }
            else if(this.currentHighlight === "RIGHT" && this.borderRight.selected === false){
                this.borderRight.selected = true;
                if(obj.playerOneTurn){
                    this.borderRight.owner = "p1"
                }
                else{
                    this.borderRight.owner = "p2"
                }
            }
            else{
                return;
            }
            this.currentHighlight = null;

            this.amountOfSides++;
            if(this.amountOfSides === 4){
                this.player = obj.currentPlayer
                if(this.player === "p1"){
                    obj.scoreP1++
                }else{
                    obj.scoreP2++;
                }
                return true;
            }
            else{
                return false;
            }
        }
    }
}