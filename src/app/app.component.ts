import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
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
  fallSpeed = 0.8;
  minSpeed = 0.3;
  maxSpeed = 2.0;
  isPaused = false;

  ngOnInit() {
    // 游戏初始化，等待开始
  }

  ngOnDestroy() {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.isPaused) {
        this.togglePause();
        return;
      }
    }

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

  private lastGenerateTime = 0;
  private generateInterval = 1000; // 默认1秒生成一个字母

  private generateLetter() {
    const currentTime = Date.now();
    if (currentTime - this.lastGenerateTime >= this.generateInterval) {
      const letter: FallingLetter = {
        char: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        x: Math.random() * 90 + 5,
        y: 0,
        id: this.nextId++
      };
      this.fallingLetters.push(letter);
      this.lastGenerateTime = currentTime;
      // 根据当前速度动态调整生成间隔
      this.generateInterval = Math.max(500, 1000 / this.fallSpeed);
    }
  }

  private updateLetters() {
    this.fallingLetters = this.fallingLetters.filter(letter => {
      letter.y += this.fallSpeed;
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

  togglePause() {
    if (!this.isGameStarted || this.isGameOver) return;

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.stopGame();
    } else {
      this.gameLoop = setInterval(() => {
        this.updateLetters();
        this.generateLetter();
      }, 50);
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
