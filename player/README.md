# Javascript Starter

Disclaimer: developed with Node 8.12.0 and npm 6.8.0, not guaranteed to work with other versions

## Instructions

Make sure you have the required npm package(s) installed: `npm install`
To run the client: `node client.js [optional port] [optional hostname]`

To run all tests, run `npm run test`
To run the 'returns a valid move' test, run `npm run test -- -t 'returns a valid move'`
To run the 'returns a valid response', run `npm run test -- -t 'returns a valid response'`

## Recommended Software

-   Node 8.12.0
-   NPM 6.8.0

# My experience during the project

This was a great assessment and I thoroughly enjoyed it from start to finish: _it way more interesting than a typical Leetcode question, thanks for that lol_. I came across a few roadblocks, learned some new things, and grew as a developer by the end. By no means is my solution a perfect one, but given the time allowed it is a good one.

### My process

Prior to the project, I haven't heard of _Othello_. Initially, I skimmed through the project requirements and docs, but I then realized that I should first become familiar with the actual game of Othello and how it is played. I initially read the rules of the game online, which seemed to confuse me even more about how the game is played. I then went to google to find an online game that I could play. This instantly clicked for me and I now understood how the game should be played. After a few runs playing an online CPU, I read back over the rules. Having the context of now having played the game, the rule book more clear.

This now leads me to the actual project. After snooping around the SDKs, my objective became clear. I needed to program a bot that could complete a game of Othello. I wanted to first get some chips appearing on the UI rather than worrying about good strategy. I played around with manually inputting moves to test how the game would handle errors or bad moves. Once I got a feel for what exactly I need to output and what the game expects, I began to think about how I need to determine my moves.

I was not familiar with any strategies for Othello, given the fact that I haven't heard of it prior to this project. This lead me back to the online games to evaluate how I would naturally play the game. I took note to why I made the moves I did, as well as what worked and what didn't. Up to this point, I assumed the following:

1. Moves could only be made if there are enemy pieces in between your own piece and an empty space
2. The more enemy pieces between your piece and the empty space, the better (length of chain is important)
3. Some pieces have better moves than others, so it is worth checking every piece
4. You can rule out your piece for a potential move if it is not bordering an enemy piece.

According to this process I followed while I played, I decided to put it into programmatic steps:

1. Find one of your chips
2. Check the neighboring squares around the perimeter of your position
3. Is there an enemy chip? If so, continue in that direction until there isn't an enemy chip, counting your distance along the way
4. If that last spot is empty, meaning it is in bounds and not your own chip, then mark down the end position and the distance
5. Repeat steps 2-4 until all directions for that chip have been checked
6. Compare the greatest distance that piece can make with the global best move to find the max distance between the two. Update the global best move if needed.
7. Repeat steps 1-6 until all of your own chips have been checked
8. Make your move using global best move

This process makes sure that the greatest chain of enemy chips are being overtaken on a single move. I was able to break these steps down into nested functions within the `getMove()` function. I templated the steps into the following:

1. `findPlayerPieces(player: number)` - Returns an array of positions of `player` chips on the game board.
2. `findPathWithLength(postion: number[], direction: number[])` - given a position of `player`'s chip, return position of valid move in particular `direction` ([1, 0], [1, 1], etc.). Return null if not valid.
3. `evaluateMoves(position: number[]` - given the position of `player`'s chip, find all valid moves at that position. Utilize the `findPathWithLength(position: number[], direction: number[])` function.
4. `findBestMove(moves: number[])` - given an array of moves `{position: number[], length: number}`, find the best move. The best move is the move that contains the greatest length.

This strategy seems to work pretty well. I ran 20 games and recorded the results:

-   Player 1 wins: **12**
-   Player 2 wins: **8**

This gives my program approximately a 60% win rate.

Although this seemed to work well, there was room for improvement. The algorithm I created was only accounting for a single direction when evaluation best move. In Othello, one move is able to influence many directions. Since I was only accounting for the max length in a single direction, the best move was not always being played. To fix this, we can take the sum of all valid move lengths at each position into account rather than the max length.

Example:

Chip 1 has 3 valid moves. Move 1 has a length of 1, move 2 has a length of 4, and move 3 has a length of 1.

Chip 2 has 1 valid move with a length of 5.

Chip 2's valid move would currently be chosen as it has the greatest length at 5. Although, the best move would be chip 1 since its sum of lengths is 6, meaning it will change all of those moves.

### The Fix

I had to modify my `findBestMove(moves: number[])` function. The nature of this function was the issue. A better name for this function would be `findTotalMoveReach(moves: number[])`, and its process should reflect that name.

Before:

```js
const findBestMove = (moves) => {
	let best = moves[0];
	moves.map((move) => {
		if (move.length > best.length) {
			best = move;
		}
	});
	return best;
};
```

After:

```js
const findTotalMoveReach = (moves) => {
	if (moves.length === 0) {
		return null;
	}
	if (moves.length === 1) {
		return moves[0];
	}
	// moves is {position: [x, y], length: z}
	let totalLength = moves.reduce((acc, curr) => {
		return acc + curr.length;
	}, 0);

	return { position: moves[0].position, length: totalLength };
};
```

After running 20 games with the revised function, the results are as follows:

-   Player 1 wins: **11**
-   Player 2 wins: **9**

55% win rate

This was very surprising. My new strategy performed worse than the previous. Not by much, but the expectation was that it would at least do a few percentage points better.

### Why was this? What happened?

My first thought was that there were not enough trials. Would the percentages stay true at, let's say, 100 trials? Given the time allocation, I will not run each for 100 trials, but this could be true. Although, 20 is a generous amount, and should somewhat reflect a true percentage. So what could it be? Well, one thing I noticed after watching 40 games play out, was that the winner typically had corner control.

What does this mean? I did not record any data to prove this hypothesis, but I noticed that the end of the game, or the last few chips placed, had a ton of weight to the outcome of the game. I believe this to be entirely due to corner control. Out of the four corners of the game board, the winner tends to have 2/4 - 4/4 of the corners covered. I do not remember seeing a game play out where the winner had only one corner covered.

**So why did my new algo not work?**

My new algorithm favored blobs. Blobs tend to be towards the center of the game board. This meant that middle squares were more likely to be favored than a corner. By the time my algorithm was forced to play a corner, it was too late. The initial version of the algorithm favored line length in a single direction. This made the games play more spread out, resulting in more corners being taken earlier in the game by chance.

My hypothesis is that the blob algorithm is better in theory, but only if it factors in corner control. You could figure out a threshold that determines to what degree a corner would take precedence over a certain length, but that would take more time than is allowed for the project. However, I do still believe that if you always take a corner when available, rather than a blob, that you would increase your winning percentage.

### Let's implement the change

We need to modify the script in the `getMove(player: number, board: number[][])` function. We need to create a variable that holds the corner move if it exists. Then, if the best move for the piece is a corner, we assign it to the variable. Then all we have to do is return the corner move if it exists, or else just return the best move.

Before:

```js
// begin script
let playerPieces = findPlayerPieces(player);
playerPieces.map((piece) => {
	let moves = evaluateMoves(piece);
	bestMoveForPiece = findTotalMoveReach(moves);
	// if the piece has any valid moves, find the best move by comparing lengths of enemy chain
	if (bestMoveForPiece) {
		if (bestMoveForPiece.length > bestMove.length) {
			bestMove = bestMoveForPiece;
		}
	}
});
```

After:

```js
function getMove(player, board) {
	const directions = [
        ...
	];
	const enemy = player == 1 ? 2 : 1;
	let bestMove = { position: [0, 0], length: 0 };
    // Add variable to trump best move with corner move
	let cornerTrumpMove = null;
```

```js
// begin script
let playerPieces = findPlayerPieces(player);
playerPieces.map((piece) => {
	let moves = evaluateMoves(piece);
	bestMoveForPiece = findTotalMoveReach(moves);
	// if the piece has any valid moves, find the best move by comparing lengths of enemy chain
	if (bestMoveForPiece) {
		// if the move is a corner move, it is the best move. return it
		if (
			(bestMoveForPiece.position[0] === 0 &&
				bestMoveForPiece.position[1] === 0) ||
			(bestMoveForPiece.position[0] === 0 &&
				bestMoveForPiece.position[1] === 7) ||
			(bestMoveForPiece.position[0] === 7 &&
				bestMoveForPiece.position[1] === 0) ||
			(bestMoveForPiece.position[0] === 7 &&
				bestMoveForPiece.position[1] === 7)
		) {
			cornerTrumpMove = bestMoveForPiece;
		}

		// if no corner, then the greatest length of enemy chain is the best move
		if (bestMoveForPiece.length > bestMove.length) {
			bestMove = bestMoveForPiece;
		}
	}
});

return cornerTrumpMove ? cornerTrumpMove.position : bestMove.position;
```

And now we run our 20 trials and evaluate our change:

-   Player 1 wins: **17**
-   Player 2 wins: **3**

Win rate: **_85%_**, _a 54.55% increase!!!_

We did it! My hypothesis was proven correct. Corner control does indeed have a huge influence on win percentage.

### Conclusion

This was a great project to work on. I began to write this document after my initial solution. As I began to revise my solution to improve, I wrote my thought processes down in this document as I went along, as well as tracking the results. This leads to a super interesting look into how I ran into issues, implemented solutions, and tested results.

If I was given more time, my next step would be to find out how much extra value a corner gives a move compared to a non-corner move. Finding this out could fine tune the decision making of when to take a corner which would slightly increase win percentage.

I am proud of my final solution, as well as the quality of my code. I cannot wait to share and talk about this on Thursday! Thank you for the opportunity.
