import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import $ from 'jquery';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private game: Game;
  private player: Player;
  private computer: Player;
  private available: any[];
  private isLoad: boolean;
  private isStart: boolean;
  private isPlay: boolean;
  private isEnd: boolean;
  private msg: string;
  private Psound = document.createElement("audio");
  private Csound = document.createElement("audio");

  constructor(public navCtrl: NavController) {
    this.onLoad();
  }

  Ptype() {
    return this.player.getType() === true ? "X" : "O";
  }

  Ctype() {
    return this.computer.getType() === true ? "X" : "O";
  }

  // Draw game board
  createBoard() {
    var boards = '';
    for (var i = 0; i < 9; i++) {
      boards += '<a class="square" id="s' + i + '" (click)="playerGo(' + i + ')"><span></span></a>';
    }
    $("#game").html(boards); 
    //$compile($("#game").html(boards))(this);
  }

  // RELOAD
  onLoad() {
     
    this.isLoad  = true,
    this.isStart = false,
    this.isPlay  = false;
    this.isEnd  = false;
    
    this.msg = '';
    this.available = [];
    
    this.game = new Game();
    this.player = new Player();
    this.computer = new Player();
    
    $("#your-turn").css('-webkit-transform', 'translateY(40px)');
    $("#comp uter-turn").css('-webkit-transform', 'translateY(40px)');

    var sources = [
      'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
      'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
      'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
      'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'
    ];

    this.Psound.src = sources[0];
    this.Csound.src = sources[1];

  };

  // START A NEW GAME
  start() {
    
    this.isLoad  = false;
    this.isStart = true;
    this.isPlay  = false;
    this.isEnd  = false;
  
    this.game.setTurn(true);
    this.player.resetHistory();
    this.computer.resetHistory();

    for (var i = 0; i < 9; i++) {
      var ele = "#s" + i + " span";
      $(ele).text('');
    }
    
    $("#your-turn").css('-webkit-transform', 'translateY(40px)');
    $("#computer-turn").css('-webkit-transform', 'translateY(40px)');
  }

  select(val) {
    this.game.setTurn(val);
    this.player.setType(val);
    this.computer.setType(!val);
    this.play();
  }

  // START PLAY
  play() {
    this.isStart = false;
    this.isPlay  = true;

    this.available = [0,1,2,3,4,5,6,7,8];

    // this.createBoard();
    if(this.game.getTurn()) {
      // Player go first
      $("#your-turn").animate({'-webkit-transform': 'translateY(0px)'}, 750);
      $("#computer-turn").animate({'-webkit-transform': 'translateY(40px)'}, 750);
    } else {
      // Computer fo first
      $("#your-turn").animate({'-webkit-transform': 'translateY(40px)'}, 750);
      $("#computer-turn").animate({'-webkit-transform': 'translateY(0px)'}, 750);
      this.computerGo();
    }
  };

  // RESTART
  restart() {
    this.start();
  };

  // PLAYER PLAY
  playerGo(s: number) {

    // Check availabe
    if (this.available.indexOf(s) > -1) {
      this.Psound.play();    
      // Print type
      var ele = "#s" + s + " span";
      $(ele).text(this.Ptype());
      this.player.addHistory(s);
      this.available.splice(this.available.indexOf(s), 1);
      
      // Check winner
      this.findWinner(1,this.available);
      
      // Change turn
      this.game.setTurn(false);
      $("#your-turn").animate({'-webkit-transform': 'translateY(40px)'}, 750);
      $("#computer-turn").animate({'-webkit-transform': 'translateY(0px)'}, 750);
      if (!this.isEnd) {
        setTimeout(() => {this.computerGo();}, 1000);
      }
      
    }        
  };

  // COMPUTER  PLAY
  computerGo() {
    // Check availabe
    if (this.available.length > 0) {
      this.Csound.play();
      
      var s = this.available[Math.floor(Math.random()*this.available.length)];
      // Print type
      var ele = "#s" + s + " span";
      $(ele).text(this.Ctype());
      this.computer.addHistory(s);
      this.available.splice(this.available.indexOf(s), 1);
      
      // Check winner
      this.findWinner(0,this.available);
      
      // Change turn
      this.game.setTurn(true);
      $("#your-turn").animate({'-webkit-transform': 'translateY(0px)'}, 750);
      $("#computer-turn").animate({'-webkit-transform': 'translateY(40px)'}, 750);
    }        
  };

  // FIND WINNER
  findWinner(who: number, s: any[]) {
    
    if (who && this.player.getHistory().length >= 3) {
      // Player win
      if (this.checkWin(this.player.getHistory())) {
        this.player.setScore(this.player.getScore() + 1);
        this.endGame("You win!");
      } else if (s.length === 0) this.endGame("Game over");
      
    } else if (!who && this.computer.getHistory().length >= 3) {
      // Computer win
      if (this.checkWin(this.computer.getHistory())) {
        this.computer.setScore(this.computer.getScore() + 1);
        this.endGame("You lose!");
      } else if (s.length === 0) this.endGame("Game over");  
    }
  }

  // FINISHED
  endGame(text) {
    this.isEnd   = true;    
    this.msg = text;
  }

  countInArray(array, what) {
    return array.filter(item => item == what).length;
  }

  checkWin(history) {
    var d3 = [], p3 = [];

    // 2 diagonal rows
    if (history.indexOf(0) > -1 && history.indexOf(4) > -1 && history.indexOf(8) > -1) {
      return true;
    }

    if (history.indexOf(2) > -1 && history.indexOf(4) > -1 && history.indexOf(6) > -1) {
      return true;
    }
    
    if (history.length === 3) {
      // horizontal row
      if (Math.floor(history[0]/3) === Math.floor(history[1]/3) && Math.floor(history[0]/3) === Math.floor(history[2]/3)) {
        return true;
      }
      
      // verticle row
      if (history[0]%3 === history[1]%3 && history[0]%3 === history[2]%3) {
        return true;
      }
      
    } else {
      var newPlay = history[history.length - 1];
      history.map(function(play) {
        d3.push(Math.floor(play/3));
        p3.push(Math.floor(play%3));
      });
      
      if (this.countInArray(d3,Math.floor(newPlay/3)) === 3) return true;    
      else if (this.countInArray(p3,newPlay%3) === 3) return true;
      else return false;
    }
  }
}

class Game {
  private turn: boolean;

  constructor() {
    this.turn = true
  }

  getTurn() {
    return this.turn;
  }

  setTurn(param: boolean) {
    this.turn = param;
  }
}

class Player {
  private score: number;
  private history: number[];
  private type: boolean;

  constructor() {
    this.type = false;
    this.score = 0;
    this.history = [];
  }

  getScore() {
    return this.score;
  }

  setScore(param: number) {
    this.score = param;
  }

  setType(param: boolean) {
    this.type = param;
  }

  getType() {
    return this.type;
  }

  getHistory() {
    return this.history;
  }

  resetHistory() {
    this.history = [];
  }

  addHistory(param: number) {
    this.history.push(param);
  }
  
}
