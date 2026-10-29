# Introduction

## Project Name: Tic-Tac-Toe

## Introduction

Tic-Tac-Toe is a classic strategy game where players compete against each other or against a computer. Using a simple 3×3 grid and X and O symbols, players aim to align three of their symbols horizontally, vertically, or diagonally to win the game.

This project focuses on improving the game's starting-player selection and fixing inconsistent behavior when resetting the board.

## Issue: Reset Board and Starting Player Selection

When the **Reset Board** button is pressed repeatedly, the starting player may change unexpectedly. Sometimes the AI plays first, while at other times the human player starts. The reset button should reset the game board without randomly changing the starting player.

To address this issue, two separate buttons are introduced to let players choose who starts the game: X or O.

## Fork Repository Link

Repository: [Tic-Tac-Toe](https://github.com/rangdajavas407-cmd/tic-tac-toe)

*Replace the repository URL above if your actual GitHub repository uses a different name.*

## Detailed Discussion of the Issue

### Button Implementation

Two HTML buttons are added: **Play X First** and **Play O First**. These buttons allow the player to choose which symbol starts the game.

### Functionality

JavaScript functions handle button clicks, reset the board, and initialize the game according to the selected starting player.

### Code Clarity

The code is organized into separate functions for selecting the starting player and resetting the board. This makes the game's behavior easier to understand and maintain.

## Code

### HTML Buttons

The following buttons allow players to select the starting symbol.

```html
<button id="selectXButton" onclick="selectFirstPlayer('X')">
    Play X First
</button>

<button id="selectOButton" onclick="selectFirstPlayer('O')">
    Play O First
</button>
```

### JavaScript Functions

#### `selectFirstPlayer()`

This function receives the selected symbol and starts a new game with the chosen starting player.

```javascript
const selectFirstPlayer = (symbol) => {
    reset_board1(symbol);
};
```

#### `reset_board1()`

This function initializes a new match according to the selected starting player.

```javascript
const reset_board1 = (firstPlayer) => {
    // Clear the game board.
    // Reset the game state.
    // Set the selected starting player.
    // Start the game with X or O.
};
```

The code above illustrates the intended structure. The actual implementation must include the existing game's board-resetting and turn-management logic.

### Steps

1. **Check the game board:** Clear the previous moves and prepare an empty board.
2. **Handle the starting-player preference:** Read the selected symbol, either X or O.
3. **Initialize the game:** Set the correct starting turn and update the game interface.
4. **Handle the AI turn:** If the computer is selected to start, call the existing AI move function.
5. **Keep reset behavior consistent:** Resetting the board should not randomly change the starting player unless the player explicitly requests that behavior.

## Code Review and Outcomes

To be completed after testing the implementation.

The expected outcome is that the player can consistently select X or O to start the game. The board should reset correctly, and the selected starting-player preference should be respected.

## Reflection

This improvement aims to make the Tic-Tac-Toe game more consistent and user-friendly. By separating starting-player selection from the reset function, players can choose who begins each match without experiencing unexpected changes.

The change also improves code organization by separating player selection, board resetting, and turn initialization. Further testing is needed to confirm that both starting-player options work correctly in single-player and two-player modes.

## Author and Copyright

Created by **Calon Arang / Ranbyus Varadha**.

Copyright © 2026. All rights reserved, subject to the project's applicable license.
