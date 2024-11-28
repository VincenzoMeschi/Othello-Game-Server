function getMove(player, board) {
	const directions = [
		[0, 1],
		[0, -1],
		[1, 0],
		[-1, 0],
		[1, 1],
		[-1, -1],
		[1, -1],
		[-1, 1],
	];
	const enemy = player == 1 ? 2 : 1;
	let bestMove = { position: [0, 0], length: 0 };
	let cornerTrumpMove = null;

	const findPlayerPieces = (player) => {
		// returns an array of positions of a given player's pieces
		let pieces = [];
		board.map((row, i) => {
			row.map((piece, j) => {
				if (piece == player) {
					pieces.push([i, j]);
				}
			});
		});

		return pieces;
	};

	const findPathWithLength = (position, direction) => {
		// returns a valid move for a given position in a given direction

		// initiate first move
		let currPos = [position[0] + direction[0], position[1] + direction[1]];
		let len = 1;

		// check if first move in direction is out of bounds or not an enemy piece
		if (
			currPos[0] < 0 ||
			currPos[0] > 7 ||
			currPos[1] < 0 ||
			currPos[1] > 7 ||
			board[currPos[0]][currPos[1]] != enemy
		) {
			return null;
		}

		// continue moving while position is within bounds and is an enemy piece
		while (
			currPos[0] >= 0 &&
			currPos[0] < 8 &&
			currPos[1] >= 0 &&
			currPos[1] < 8 &&
			board[currPos[0]][currPos[1]] === enemy
		) {
			currPos = [currPos[0] + direction[0], currPos[1] + direction[1]];
			len++;
		}
		// if current position is within bounds and is an empty space, return the position and length
		if (
			currPos[0] >= 0 &&
			currPos[0] < 8 &&
			currPos[1] >= 0 &&
			currPos[1] < 8 &&
			board[currPos[0]][currPos[1]] === 0
		) {
			return { position: currPos, length: len };
		}

		// if move is not valid, return null
		return null;
	};

	const evaluateMoves = (position) => {
		// returns an array of valid moves for a given position
		let moves = [];
		directions.map((direction) => {
			let path = findPathWithLength(position, direction);
			if (path) {
				moves.push(path);
			}
		});
		return moves;
	};

	const findTotalMoveReach = (moves) => {
		if (moves.length === 0) {
			return null;
		}
		if (moves.length === 1) {
			return moves[0];
		}

		let totalLength = moves.reduce((acc, curr) => {
			return acc + curr.length;
		}, 0);

		return { position: moves[0].position, length: totalLength };
	};

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
}

function prepareResponse(move) {
	const response = `${JSON.stringify(move)}\n`;
	return response;
}

module.exports = { getMove, prepareResponse };
