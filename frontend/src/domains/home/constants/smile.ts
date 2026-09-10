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
		link: "/journey-of-hope/patient-stories",
	},
	{
		name: "Archana P",
		date: "5 December, 2026",
		image: "/Smilestories/Archana.png",
		link: "/journey-of-hope/patient-stories",
	},
	{
		name: "Swati Patil",
		date: "19 June, 2026",
		image: "/Smilestories/Swati.png",
		link: "/journey-of-hope/patient-stories",
	},
	{
		name: "Master Vikshith",
		date: "1 October, 2026",
		image: "/Smilestories/Vikshith.png",
		link: "/journey-of-hope/patient-stories",
	},
];

export const AUTO_SCROLL_SPEED = 80;
export const RESUME_DELAY = 1200;
export const DRAG_THRESHOLD = 4;
export const STORAGE_KEY = "smileStoriesOffset";
export const SAVE_INTERVAL = 500;

export function wrap(value: number, max: number) {
	return ((value % max) + max) % max;
}

export function formatStoryDate(value?: string | null) {
	if (!value) return "";
	const d = new Date(value.slice(0, 10) + "T00:00:00");
	if (Number.isNaN(d.getTime())) return value;
	return d.toLocaleDateString("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function loopStories(items: SmileStory[]) {
	if (items.length === 0) return [];
	return [...items, ...items, ...items];
}
