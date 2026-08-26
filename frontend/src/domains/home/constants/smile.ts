export type SmileStory = {
	name: string;
	date: string;
	image: string;
	link: string;
};

export const stories: SmileStory[] = [
	{
		name: "Jatin",
		date: "3 August, 2026",
		image: "/Smilestories/Jatin.png",
		link: "/stories/jatin",
	},
	{
		name: "Archana P",
		date: "5 December, 2026",
		image: "/Smilestories/Archana.png",
		link: "/stories/archana-p",
	},
	{
		name: "Swati Patil",
		date: "19 June, 2026",
		image: "/Smilestories/Swati.png",
		link: "/stories/swati-patil",
	},
	{
		name: "Master Vikshith",
		date: "1 October, 2026",
		image: "/Smilestories/Vikshith.png",
		link: "/stories/master-vikshith",
	},
];

export const loopedStories = [...stories, ...stories, ...stories];

export const AUTO_SCROLL_SPEED = 80;
export const RESUME_DELAY = 1200;
export const DRAG_THRESHOLD = 4;
export const STORAGE_KEY = "smileStoriesOffset";
export const SAVE_INTERVAL = 500;

export function wrap(value: number, max: number) {
	return ((value % max) + max) % max;
}
