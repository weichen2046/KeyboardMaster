import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FallingLetter {
  char: string;
  x: number;
  y: number;
  id: number;
  exploding?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  score = 0;
  missed = 0;
  fallingLetters: FallingLetter[] = [];
  private gameLoop: any;
  private nextId = 0;
  isGameOver = false;
  isGameStarted = false;
  maxMissed = 10;
  countdownValue = 0;
  isCountingDown = false;

  ngOnInit() {
    // 游戏初始化，等待开始
  }

  ngOnDestroy() {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const letterIndex = this.fallingLetters.findIndex(letter => letter.char.toLowerCase() === key);
    
    if (letterIndex !== -1) {
      const letter = this.fallingLetters[letterIndex];
      letter.exploding = true;
      setTimeout(() => {
        this.score++;
        this.fallingLetters.splice(letterIndex, 1);
      }, 200);
    }
  }

  private stopGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }

  private generateLetter() {
    if (Math.random() < 0.03) {
      const letter: FallingLetter = {
        char: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        x: Math.random() * 90 + 5,
        y: 0,
        id: this.nextId++
      };
      this.fallingLetters.push(letter);
    }
  }

  private updateLetters() {
    this.fallingLetters = this.fallingLetters.filter(letter => {
      letter.y += 0.8;
      if (letter.y >= 90) {
        this.missed++;
        if (this.missed >= this.maxMissed) {
          this.gameOver();
        }
        return false;
      }
      return true;
    });
  }

  public startGame() {
    if (!this.isGameStarted && !this.isGameOver) {
      this.isCountingDown = true;
      this.countdownValue = 3;
      const startCountdown = () => {
        setTimeout(() => {
          if (this.countdownValue > 0) {
            this.countdownValue--;
            startCountdown();
          } else {
            this.isCountingDown = false;
            this.isGameStarted = true;
            this.score = 0;
            this.missed = 0;
            this.fallingLetters = [];
            this.gameLoop = setInterval(() => {
              this.updateLetters();
              this.generateLetter();
            }, 50);
          }
        }, 800);
      };
      startCountdown();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.isGameStarted = false;
    this.stopGame();
  }

  restartGame() {
    this.isGameOver = false;
    this.startGame();
  }
}
