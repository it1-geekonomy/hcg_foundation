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
		image: "/Smilestories/smilestory1.png",
		link: "/stories/jatin",
	},
	{
		name: "Archana P",
		date: "5 December, 2026",
		image: "/Smilestories/smilestory2.png",
		link: "/stories/archana-p",
	},
	{
		name: "Swati Patil",
		date: "19 June, 2026",
		image: "/Smilestories/smilestory3.png",
		link: "/stories/swati-patil",
	},
	{
		name: "Master Vikshith",
		date: "1 October, 2026",
		image: "/Smilestories/smilestory4.png",
		link: "/stories/master-vikshith",
	},
	// Placeholder entries — swap in real name/date/link once available.
	{
		name: "Aleema Banu",
		date: "4 April, 2024",
		image: "/Smilestories/smilestory5.png",
		link: "/stories/smilestory5",
	},
	{
		name: "Somappa J J",
		date: "19 December, 2024",
		image: "/Smilestories/smilestory6.png",
		link: "/stories/smilestory6",
	},
	{
		name: "Latha E",
		date: "20 March, 2026",
		image: "/Smilestories/smilestory7.png",
		link: "/stories/smilestory7",
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