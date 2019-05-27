import { writable } from 'svelte/store';

// TODO randomly set direction at start
export const ballStart = {
	x: 385,
	y: 285,
	r: 6,
	color: 'white',
	speedX: 5,
	speedY: 5,
};
export const ballStore = writable(ballStart);

const playerOneStart = {
	x: 5,
	y: 250,
	w: 15,
	h: 100,
	color: 'white',
};
export const playerOneStore = writable(playerOneStart);

const playerTwoStart = {
	x: 775,
	y: 250,
	w: 15,
	h: 100,
	color: 'white',
};

export const playerTwoStore = writable(playerTwoStart);

export const scoreStore = writable({
	p1: 0,
	p2: 0,
});
