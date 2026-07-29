"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createChessMatch, joinChessMatch, updateChessMatchFen, ChessMatch } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function ChessGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams?.get('match');
  const { user } = useAuth();

  const [guestId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('chess_guest_id');
      if (!id) { id = uuidv4(); localStorage.setItem('chess_guest_id', id); }
      return id;
    }
    return '';
  });

  const playerId = user?.uid || guestId;

  const [game, setGame] = useState(new Chess());
  const [matchData, setMatchData] = useState<ChessMatch | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [loading, setLoading] = useState(!!matchId);

  // Initialize or Join Game
  useEffect(() => {
    if (matchId) {
      joinChessMatch(matchId, playerId).then((success) => {
        if (!success) {
          alert('Game is full or invalid!');
          router.push('/instant/chess');
        }
      });
    }
  }, [matchId, playerId, router]);

  // Listen to Firestore
  useEffect(() => {
    if (!matchId) return;

    const unsub = onSnapshot(doc(db, 'chess_matches', matchId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as ChessMatch;
        setMatchData(data);
        
        // Update local game state
        const newGame = new Chess();
        try {
          newGame.load(data.fen);
          setGame(newGame);
        } catch (e) {
          console.error("Invalid FEN from DB");
        }

        // Determine player color
        if (data.white === playerId) setPlayerColor('white');
        else if (data.black === playerId) setPlayerColor('black');
        else setPlayerColor(null); // spectator

        setLoading(false);
      }
    });

    return () => unsub();
  }, [matchId, playerId]);

  const handleCreateGame = async () => {
    const id = await createChessMatch(playerId);
    router.push(`/instant/chess?match=${id}`);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!matchId || !matchData) return false;
    if (matchData.status !== 'playing') return false;
    
    // Check if it's player's turn
    const turn = game.turn() === 'w' ? 'white' : 'black';
    if (playerColor !== turn) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to queen for simplicity
      });

      if (move === null) return false;

      const newFen = game.fen();
      setGame(new Chess(newFen));

      // Check win conditions
      let winner: 'white' | 'black' | 'draw' | undefined = undefined;
      if (game.isCheckmate()) winner = turn; // the person who just moved wins
      else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) winner = 'draw';

      updateChessMatchFen(matchId, newFen, winner);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!matchId) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-display-lg font-bold text-primary mb-8">Aero Chess</h1>
        <div className="bg-surface-container rounded-3xl p-8 max-w-md w-full shadow-xl border border-outline-variant text-center">
          <p className="text-on-surface-variant mb-8">Create a multiplayer game instantly and challenge a friend globally.</p>
          <button 
            onClick={handleCreateGame}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            Create New Game
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-12 px-4 md:px-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start justify-center">
        
        {/* Game Info Panel */}
        <div className="w-full md:w-1/3 bg-surface-container rounded-3xl p-6 border border-outline-variant shadow-lg flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-primary">Aero Chess</h2>
          
          {matchData?.status === 'waiting' && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <h3 className="font-bold text-on-surface mb-2">Waiting for opponent...</h3>
              <p className="text-sm text-on-surface-variant mb-4">Share this link with a friend to play:</p>
              <input 
                type="text" 
                readOnly 
                value={typeof window !== 'undefined' ? window.location.href : ''} 
                className="w-full bg-surface text-sm p-2 rounded border border-outline-variant text-on-surface"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          )}

          {matchData?.status === 'playing' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-outline-variant">
                <span className="font-bold text-on-surface">Black</span>
                <div className={`w-3 h-3 rounded-full ${game.turn() === 'b' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-outline'}`}></div>
              </div>
              <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-outline-variant">
                <span className="font-bold text-on-surface">White</span>
                <div className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-outline'}`}></div>
              </div>
            </div>
          )}

          {matchData?.status === 'finished' && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-center">
              <h3 className="font-bold text-2xl text-secondary mb-2">Game Over</h3>
              <p className="text-on-surface font-bold">
                {matchData.winner === 'draw' ? 'Draw!' : `${matchData.winner?.toUpperCase()} Wins!`}
              </p>
              <button 
                onClick={() => router.push('/instant/chess')}
                className="mt-4 w-full bg-surface border border-outline-variant py-2 rounded font-bold hover:bg-surface-container-high"
              >
                Play Again
              </button>
            </div>
          )}

          {playerColor && (
            <div className="mt-auto pt-4 border-t border-outline-variant text-sm text-center text-on-surface-variant">
              You are playing as <strong>{playerColor.toUpperCase()}</strong>
            </div>
          )}
        </div>

        {/* The Board */}
        <div className="w-full md:w-2/3 max-w-[600px] aspect-square rounded-lg overflow-hidden shadow-2xl bg-surface-container-high border-4 border-surface-container">
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            boardOrientation={playerColor === 'black' ? 'black' : 'white'}
            customDarkSquareStyle={{ backgroundColor: '#4a6278' }}
            customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
            animationDuration={200}
          />
        </div>

      </div>
    </div>
  );
}

export default function ChessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
      <ChessGame />
    </Suspense>
  );
}
